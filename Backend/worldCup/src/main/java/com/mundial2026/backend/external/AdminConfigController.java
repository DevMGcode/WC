package com.mundial2026.backend.external;

import com.mundial2026.backend.common.response.ApiResponse;
import com.mundial2026.backend.config.AppConfigService;
import com.mundial2026.backend.tournament.integration.sync.FixtureSyncService;
import com.mundial2026.backend.tournament.repository.FixtureRepository;
import com.mundial2026.backend.tournament.repository.TournamentRepository;
import com.mundial2026.backend.tournament.service.StandingsCalculatorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.sql.DataSource;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/public/admin/config")
@RequiredArgsConstructor
public class AdminConfigController {

    private static final String API_KEY_CFG = "football_data_api_key";

    private final AppConfigService           appConfigService;
    private final ExternalFixtureService     externalFixtureService;
    private final FixtureRepository          fixtureRepository;
    private final DataSource                 dataSource;
    private final TournamentRepository       tournamentRepository;
    private final StandingsCalculatorService standingsCalculator;
    private final FixtureSyncService         fixtureSyncService;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getConfig() {
        boolean configured = appConfigService.hasValue(API_KEY_CFG);
        String masked = appConfigService.getValue(API_KEY_CFG)
                .map(k -> k.substring(0, Math.min(6, k.length())) + "••••••••••••••••••••••••••")
                .orElse(null);

        return ResponseEntity.ok(ApiResponse.ok("Configuración obtenida", Map.of(
                "configured", configured,
                "apiKeyMasked", masked != null ? masked : "",
                "provider", "football-data.org"
        )));
    }

    @PostMapping("/api-key")
    public ResponseEntity<ApiResponse<Void>> saveApiKey(@RequestBody Map<String, String> body) {
        String key = body.get("apiKey");
        if (key == null || key.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.ok("API key no puede estar vacía", null));
        }
        appConfigService.setValue(API_KEY_CFG, key.trim());
        return ResponseEntity.ok(ApiResponse.ok("API key guardada correctamente", null));
    }

    @DeleteMapping("/api-key")
    public ResponseEntity<ApiResponse<Void>> deleteApiKey() {
        appConfigService.setValue(API_KEY_CFG, null);
        return ResponseEntity.ok(ApiResponse.ok("API key eliminada", null));
    }

    /**
     * Deletes only the demo fixtures (those without external_provider_id),
     * then recalculates standings so the group_standing table no longer
     * reflects the demo results. We do NOT wipe group_standing — the 48 rows
     * representing the canonical group assignments stay, just zeroed out for
     * groups that had only demos.
     */
    @Transactional
    @DeleteMapping("/demo-fixtures")
    public ResponseEntity<ApiResponse<Map<String, Object>>> deleteDemoFixtures() {
        long fixturesDeleted = fixtureRepository.findByExternalProviderIdIsNull().size();
        fixtureRepository.deleteByExternalProviderIdIsNull();

        // Recalculate so points/games from the deleted demos disappear from the
        // standings table. The team rows themselves remain (zeroed).
        tournamentRepository.findAll()
                .forEach(t -> standingsCalculator.recalculateAllGroups(t.getId()));

        return ResponseEntity.ok(ApiResponse.ok("Datos demo eliminados", Map.of(
                "fixturesDeleted",  fixturesDeleted,
                "standingsRecalculated", true
        )));
    }

    /**
     * Deletes only the API-synced fixtures (those WITH external_provider_id)
     * and recalculates standings so the group_standing table forgets their
     * results. Demo fixtures are untouched.
     */
    @Transactional
    @DeleteMapping("/api-fixtures")
    public ResponseEntity<ApiResponse<Map<String, Object>>> deleteApiFixtures() {
        long fixturesDeleted = fixtureRepository.findByExternalProviderIdIsNotNull().size();
        fixtureRepository.deleteByExternalProviderIdIsNotNull();

        tournamentRepository.findAll()
                .forEach(t -> standingsCalculator.recalculateAllGroups(t.getId()));

        return ResponseEntity.ok(ApiResponse.ok("Datos API eliminados", Map.of(
                "fixturesDeleted", fixturesDeleted,
                "standingsRecalculated", true
        )));
    }

    /**
     * Restores the 6 demo fixtures aligned with the real 2026 World Cup teams
     * (originally seeded by V19). Idempotent via WHERE NOT EXISTS guards — safe
     * to call repeatedly. Pairs with `deleteDemoFixtures()` to provide a clean
     * BD-only workflow for QA/admins.
     *
     * Each demo fixture:
     *   - Has external_provider_id = NULL → UI tags as "BD".
     *   - Re-uses real teams synced from API-Football (by external_provider_id).
     *   - Falls under stage GROUPS in the canonical group_stage (A-L).
     *
     * After re-inserting, callers typically follow up with
     * `POST /recalculate-standings` so the FINISHED demos are reflected in the
     * standings table.
     */
    @PostMapping("/restore-demo")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> restoreDemo() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);

        // Each row = one demo fixture description. Keeping the data here in Java
        // (rather than a classpath SQL file) avoids re-shipping a migration that
        // was already consolidated into V1__init.sql.
        Object[][] demos = new Object[][] {
            // {groupCode, homeExternalId, awayExternalId, name, status, homeScore, awayScore, hoursOffset}
            { "A", 16L,   1531L, "México vs Sudáfrica (DEMO)",     "FINISHED",  2, 0,  -72 },
            { "C",  6L,     31L, "Brasil vs Marruecos (DEMO)",     "FINISHED",  3, 1,  -48 },
            { "J", 26L,   1532L, "Argentina vs Argelia (DEMO)",    "FINISHED",  4, 0,  -24 },
            { "H",  9L,   1533L, "España vs Cabo Verde (DEMO)",    "LIVE",      2, 1,   -1 },
            { "E", 25L,   5530L, "Alemania vs Curaçao (DEMO)",     "SCHEDULED", null, null,  72 },
            { "L", 10L,      3L, "Inglaterra vs Croacia (DEMO)",   "SCHEDULED", null, null, 120 }
        };

        int inserted = 0;
        for (Object[] d : demos) {
            String groupCode  = (String) d[0];
            Long homeExtId    = (Long)   d[1];
            Long awayExtId    = (Long)   d[2];
            String name       = (String) d[3];
            String status     = (String) d[4];
            Integer homeScore = (Integer) d[5];
            Integer awayScore = (Integer) d[6];
            int hoursOffset   = (Integer) d[7];

            // INSERT … SELECT with subqueries resolves real IDs from external_provider_id.
            // WHERE NOT EXISTS makes the whole thing idempotent.
            int rows = jdbc.update("""
                INSERT INTO fixture (
                    tournament_id, stage_id, group_stage_id,
                    home_team_id, away_team_id,
                    name, kickoff_at, prediction_locked_at, status,
                    home_score, away_score
                )
                SELECT
                    (SELECT id FROM tournament WHERE code='WC2026'),
                    (SELECT id FROM stage WHERE code='GROUPS'
                       AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
                    (SELECT id FROM group_stage WHERE code=?
                       AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
                    (SELECT id FROM team WHERE external_provider_id=?),
                    (SELECT id FROM team WHERE external_provider_id=?),
                    ?,
                    NOW() + (INTERVAL '1 hour' * ?),
                    NOW() + (INTERVAL '1 hour' * ?) - INTERVAL '5 minutes',
                    ?,
                    ?, ?
                WHERE NOT EXISTS (
                    SELECT 1 FROM fixture
                    WHERE name = ? AND external_provider_id IS NULL
                )
                """,
                groupCode,
                homeExtId, awayExtId,
                name,
                hoursOffset, hoursOffset,
                status,
                homeScore, awayScore,
                name
            );
            inserted += rows;
        }

        // Recalculate standings so the FINISHED demos are reflected in the
        // group_standing table. recalculate now also handles the initial seed,
        // so empty groups get their 4 zero-stats rows too.
        tournamentRepository.findAll()
                .forEach(t -> standingsCalculator.recalculateAllGroups(t.getId()));

        return ResponseEntity.ok(ApiResponse.ok(
                "Datos demo restaurados y standings recalculados",
                Map.of("fixturesInserted", inserted, "fixturesAlreadyPresent", demos.length - inserted)
        ));
    }

    /**
     * "Recalcular standings" — one-click full refresh.
     *
     * Pulls the latest match data from API-Football (scores, status transitions
     * to FINISHED, etc.), then rebuilds the standings table from ALL local
     * fixtures: API-synced AND demo BD ones, treated uniformly as "matches".
     *
     * Why this is coherent:
     *   - We never combine pre-aggregated /standings from API-Football with our
     *     own increments — that would mix abstraction layers.
     *   - Instead we always work at the fixture level: every match is a unit,
     *     every match contributes its own points/goals from its own result.
     *   - The standings table is just a SUM of fixtures. Sum(API only) plus
     *     Sum(BD demos) = Sum(everything), which is exactly what the admin
     *     wants to see when testing.
     *   - If the admin wants "API-only view": click "Limpiar BD" first.
     *
     * The sync step is best-effort: if API-Football is unreachable we still
     * recalculate from what's locally cached, so the UI stays responsive.
     */
    @PostMapping("/recalculate-standings")
    public ResponseEntity<ApiResponse<Map<String, Object>>> recalculateStandings() {
        // STEP 1 — refresh fixture data from API-Football (best-effort).
        long synced = 0;
        String syncError = null;
        try {
            FixtureSyncService.SyncResult r = fixtureSyncService.syncAllTournamentFixtures();
            synced = r.inserted() + r.updated();
        } catch (Exception e) {
            syncError = e.getMessage();
            // Continue anyway — we still want to recalculate from local state.
        }

        // STEP 2 — rebuild standings from ALL local fixtures (API + BD).
        tournamentRepository.findAll()
                .forEach(t -> standingsCalculator.recalculateAllGroups(t.getId()));

        Map<String, Object> result = new java.util.LinkedHashMap<>();
        result.put("apiFixturesRefreshed", synced);
        if (syncError != null) {
            result.put("apiSyncError", syncError);
            result.put("note", "Recalculo procedió usando datos locales en caché.");
        }
        return ResponseEntity.ok(ApiResponse.ok(
                "Standings recalculados (API + BD)",
                result
        ));
    }

    @PostMapping("/sync")
    public ResponseEntity<ApiResponse<Map<String, Object>>> syncFixtures() {
        if (!externalFixtureService.isConfigured()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.ok("API key no configurada", null));
        }
        ExternalFixtureService.SyncResult result = externalFixtureService.syncFixtures();
        return ResponseEntity.ok(ApiResponse.ok("Sincronización completada", Map.of(
                "created", result.created(),
                "updated", result.updated(),
                "errors",  result.errors()
        )));
    }
}
