package com.mundial2026.backend.external;

import com.mundial2026.backend.common.response.ApiResponse;
import com.mundial2026.backend.config.AppConfigService;
import com.mundial2026.backend.tournament.repository.FixtureRepository;
import com.mundial2026.backend.tournament.repository.GroupStandingRepository;
import com.mundial2026.backend.tournament.repository.TournamentRepository;
import com.mundial2026.backend.tournament.service.StandingsCalculatorService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
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
    private final GroupStandingRepository    groupStandingRepository;
    private final DataSource                 dataSource;
    private final TournamentRepository       tournamentRepository;
    private final StandingsCalculatorService standingsCalculator;

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

    @Transactional
    @DeleteMapping("/demo-fixtures")
    public ResponseEntity<ApiResponse<Map<String, Object>>> deleteDemoFixtures() {
        long fixturesDeleted = fixtureRepository.findByExternalProviderIdIsNull().size();
        fixtureRepository.deleteByExternalProviderIdIsNull();
        long standingsDeleted = groupStandingRepository.count();
        groupStandingRepository.deleteAll();
        return ResponseEntity.ok(ApiResponse.ok("Datos demo eliminados", Map.of(
                "fixturesDeleted",  fixturesDeleted,
                "standingsDeleted", standingsDeleted
        )));
    }

    @Transactional
    @DeleteMapping("/api-fixtures")
    public ResponseEntity<ApiResponse<Map<String, Object>>> deleteApiFixtures() {
        long fixturesDeleted = fixtureRepository.findByExternalProviderIdIsNotNull().size();
        fixtureRepository.deleteByExternalProviderIdIsNotNull();
        return ResponseEntity.ok(ApiResponse.ok("Datos API eliminados", Map.of(
                "fixturesDeleted", fixturesDeleted
        )));
    }

    @PostMapping("/restore-demo")
    public ResponseEntity<ApiResponse<Void>> restoreDemo() {
        ResourceDatabasePopulator populator = new ResourceDatabasePopulator();
        populator.addScript(new ClassPathResource("db/migration/V8__seed_groups_and_standings.sql"));
        populator.addScript(new ClassPathResource("db/migration/V9__seed_knockout_fixtures.sql"));
        populator.addScript(new ClassPathResource("db/migration/V10__seed_group_fixtures.sql"));
        populator.setSeparator(";");
        populator.execute(dataSource);
        return ResponseEntity.ok(ApiResponse.ok("Datos demo restaurados correctamente", null));
    }

    @PostMapping("/recalculate-standings")
    public ResponseEntity<ApiResponse<Void>> recalculateStandings() {
        tournamentRepository.findAll().forEach(t -> standingsCalculator.recalculateAllGroups(t.getId()));
        return ResponseEntity.ok(ApiResponse.ok("Standings recalculados correctamente", null));
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
