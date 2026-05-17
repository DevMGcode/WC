package com.mundial2026.backend.external;

import com.mundial2026.backend.config.AppConfigService;
import com.mundial2026.backend.tournament.domain.*;
import com.mundial2026.backend.tournament.repository.*;
import com.mundial2026.backend.tournament.service.MatchEventService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.OffsetDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExternalFixtureService {

    private static final String FD_BASE    = "https://api.football-data.org/v4";
    private static final String API_KEY_CFG = "football_data_api_key";

    private static final Map<String, String> TEAM_NAMES_ES = Map.ofEntries(
        Map.entry("ALG", "Argelia"),
        Map.entry("AUS", "Australia"),
        Map.entry("BIH", "Bosnia y Herzegovina"),
        Map.entry("CPV", "Cabo Verde"),
        Map.entry("COD", "Rep. Democrática del Congo"),
        Map.entry("CRO", "Croacia"),
        Map.entry("CUR", "Curazao"),
        Map.entry("CZE", "República Checa"),
        Map.entry("EGY", "Egipto"),
        Map.entry("ENG", "Inglaterra"),
        Map.entry("GHA", "Ghana"),
        Map.entry("HAI", "Haití"),
        Map.entry("IRN", "Irán"),
        Map.entry("IRQ", "Irak"),
        Map.entry("CIV", "Costa de Marfil"),
        Map.entry("JOR", "Jordania"),
        Map.entry("NZL", "Nueva Zelanda"),
        Map.entry("NOR", "Noruega"),
        Map.entry("PAN", "Panamá"),
        Map.entry("QAT", "Catar"),
        Map.entry("KSA", "Arabia Saudita"),
        Map.entry("SCO", "Escocia"),
        Map.entry("SEN", "Senegal"),
        Map.entry("RSA", "Sudáfrica"),
        Map.entry("SWE", "Suecia"),
        Map.entry("TUN", "Túnez"),
        Map.entry("TUR", "Turquía"),
        Map.entry("USA", "Estados Unidos"),
        Map.entry("UZB", "Uzbekistán")
    );

    private final AppConfigService      appConfigService;
    private final TournamentRepository  tournamentRepository;
    private final FixtureRepository     fixtureRepository;
    private final TeamRepository        teamRepository;
    private final StageRepository       stageRepository;
    private final GroupStageRepository  groupStageRepository;
    private final MatchEventService      matchEventService;
    private final MatchEventRepository   matchEventRepository;

    /* ── JSON response shapes ─────────────────────────────────── */
    record FdMatchesResponse(List<FdMatch> matches) {}
    record FdMatch(Long id, String utcDate, String status, String stage,
                   String group, FdTeam homeTeam, FdTeam awayTeam, FdScore score) {}
    record FdTeam(Long id, String name, String shortName, String tla, String crest) {}
    record FdScore(FdFullTime fullTime) {}
    record FdFullTime(Integer home, Integer away) {}

    /* Shapes para el endpoint individual /matches/{id} (incluye goles) */
    record FdMatchDetail(List<FdGoal> goals) {}
    record FdGoal(Integer minute, FdGoalTeam team, FdGoalScorer scorer) {}
    record FdGoalTeam(Long id) {}
    record FdGoalScorer(Long id, String name) {}

    /* ── Public API ───────────────────────────────────────────── */

    public boolean isConfigured() {
        return appConfigService.hasValue(API_KEY_CFG);
    }

    @Transactional
    public SyncResult syncFixtures() {
        String apiKey = appConfigService.getValue(API_KEY_CFG)
                .orElseThrow(() -> new IllegalStateException("API key no configurada"));

        Tournament tournament = tournamentRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No hay torneo en la base de datos"));

        List<Stage>       stages = stageRepository.findByTournamentIdOrderBySortOrderAsc(tournament.getId());
        List<GroupStage>  groups = groupStageRepository.findByTournamentIdOrderByCodeAsc(tournament.getId());
        List<Team>        teams  = new ArrayList<>(teamRepository.findAll());

        FdMatchesResponse response = fetchFromApi(apiKey);
        if (response == null || response.matches() == null) {
            return new SyncResult(0, 0, List.of("Sin respuesta de la API"));
        }

        int created = 0, updated = 0;
        List<String> errors = new ArrayList<>();

        for (FdMatch match : response.matches()) {
            try {
                Team home = findOrCreateTeam(teams, match.homeTeam());
                Team away = findOrCreateTeam(teams, match.awayTeam());
                if (home == null || away == null) {
                    // TBD knockout fixture — teams not yet determined, skip silently
                    log.debug("Omitiendo partido TBD id={}", match.id());
                    continue;
                }

                Stage      stage = findStage(stages, match.stage());
                GroupStage group = findGroup(groups, match.group(), tournament);

                Optional<Fixture> existing = fixtureRepository.findByExternalProviderId((long) match.id().intValue());
                Fixture fixture = existing.orElse(new Fixture());
                boolean isNew   = existing.isEmpty();

                fixture.setExternalProviderId((long) match.id().intValue());
                fixture.setTournament(tournament);
                fixture.setStage(stage != null ? stage : stages.get(0));
                fixture.setGroupStage(group);
                fixture.setHomeTeam(home);
                fixture.setAwayTeam(away);
                fixture.setName(home.getName() + " vs " + away.getName());

                OffsetDateTime kickoff = OffsetDateTime.parse(match.utcDate());
                fixture.setKickoffAt(kickoff);
                fixture.setPredictionLockedAt(kickoff.minusMinutes(5));
                fixture.setStatus(mapStatus(match.status()));

                if (match.score() != null && match.score().fullTime() != null) {
                    fixture.setHomeScore(match.score().fullTime().home());
                    fixture.setAwayScore(match.score().fullTime().away());
                }

                fixtureRepository.save(fixture);
                if (isNew) created++; else updated++;

                // Para partidos FINALIZADOS sincronizar goleadores desde la API
                if (fixture.getStatus() == FixtureStatus.FINISHED && match.id() != null) {
                    syncScorers(apiKey, fixture.getId(), match.id());
                }

            } catch (Exception e) {
                log.warn("Error procesando partido {}: {}", match.id(), e.getMessage());
                errors.add("Partido " + match.id() + ": " + e.getMessage());
            }
        }

        log.info("Sync completado: {} creados, {} actualizados, {} errores", created, updated, errors.size());
        return new SyncResult(created, updated, errors);
    }

    /* ── Private helpers ──────────────────────────────────────── */

    private FdMatchesResponse fetchFromApi(String apiKey) {
        try {
            RestTemplate rest = new RestTemplate();
            HttpHeaders  headers = new HttpHeaders();
            headers.set("X-Auth-Token", apiKey);
            headers.setAccept(List.of(MediaType.APPLICATION_JSON));

            ResponseEntity<FdMatchesResponse> resp = rest.exchange(
                    FD_BASE + "/competitions/WC/matches?season=2026",
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    FdMatchesResponse.class
            );
            return resp.getBody();
        } catch (Exception e) {
            log.error("Error llamando football-data.org: {}", e.getMessage());
            throw new RuntimeException("Error conectando con football-data.org: " + e.getMessage());
        }
    }

    private Team findOrCreateTeam(List<Team> teams, FdTeam fdTeam) {
        if (fdTeam == null) return null;
        // TBD team — all identifying fields absent
        if (fdTeam.id() == null && fdTeam.tla() == null && fdTeam.name() == null) return null;

        // 1. Match by external provider id
        if (fdTeam.id() != null) {
            Team found = teams.stream()
                    .filter(t -> fdTeam.id().equals(t.getExternalProviderId()))
                    .findFirst().orElse(null);
            if (found != null) return found;
        }

        // 2. Match by TLA / fifa_code
        if (fdTeam.tla() != null) {
            Team found = teams.stream()
                    .filter(t -> fdTeam.tla().equalsIgnoreCase(t.getFifaCode()))
                    .findFirst().orElse(null);
            if (found != null) return found;
        }

        // 3. Match by name
        if (fdTeam.name() != null) {
            Team found = teams.stream()
                    .filter(t -> fdTeam.name().equalsIgnoreCase(t.getName()))
                    .findFirst().orElse(null);
            if (found != null) return found;
        }

        // 4. Auto-create — need at least id + name
        if (fdTeam.id() == null || fdTeam.name() == null) return null;

        String nameEs = fdTeam.tla() != null
                ? TEAM_NAMES_ES.getOrDefault(fdTeam.tla().toUpperCase(), fdTeam.name())
                : fdTeam.name();

        Team newTeam = new Team();
        newTeam.setExternalProviderId(fdTeam.id());
        newTeam.setName(nameEs);
        newTeam.setShortName(fdTeam.tla());
        newTeam.setFifaCode(fdTeam.tla());
        newTeam.setCountryName(nameEs);
        newTeam.setFlagUrl(fdTeam.crest());
        teamRepository.save(newTeam);
        teams.add(newTeam);
        log.info("Equipo creado automáticamente: {} ({})", nameEs, fdTeam.tla());
        return newTeam;
    }

    private Stage findStage(List<Stage> stages, String fdStage) {
        if (fdStage == null || stages.isEmpty()) return null;
        String code = mapStageCode(fdStage);
        return stages.stream()
                .filter(s -> s.getCode() != null && s.getCode().equalsIgnoreCase(code))
                .findFirst()
                .orElse(stages.get(0));
    }

    private GroupStage findGroup(List<GroupStage> groups, String fdGroup, Tournament tournament) {
        if (fdGroup == null) return null;
        // "GROUP_A" → "A"
        String letter = fdGroup.replace("GROUP_", "").trim();
        if (letter.isBlank()) return null;

        GroupStage found = groups.stream()
                .filter(g -> g.getCode() != null && g.getCode().equalsIgnoreCase(letter))
                .findFirst().orElse(null);
        if (found != null) return found;

        // Auto-create missing group
        GroupStage newGroup = new GroupStage();
        newGroup.setTournament(tournament);
        newGroup.setCode(letter.toUpperCase());
        newGroup.setName("Grupo " + letter.toUpperCase());
        groupStageRepository.save(newGroup);
        groups.add(newGroup);
        log.info("Grupo creado automáticamente: {}", letter.toUpperCase());
        return newGroup;
    }

    private FixtureStatus mapStatus(String fdStatus) {
        if (fdStatus == null) return FixtureStatus.SCHEDULED;
        return switch (fdStatus.toUpperCase()) {
            case "IN_PLAY", "PAUSED", "HALFTIME" -> FixtureStatus.LIVE;
            case "FINISHED"                       -> FixtureStatus.FINISHED;
            case "POSTPONED", "CANCELLED", "SUSPENDED" -> FixtureStatus.POSTPONED;
            default                               -> FixtureStatus.SCHEDULED;
        };
    }

    private String mapStageCode(String fdStage) {
        return switch (fdStage.toUpperCase()) {
            case "GROUP_STAGE"    -> "GROUPS";
            case "ROUND_OF_16"    -> "OCTAVOS";
            case "QUARTER_FINALS" -> "CUARTOS";
            case "SEMI_FINALS"    -> "SEMIFINAL";
            case "FINAL"          -> "FINAL";
            case "THIRD_PLACE"    -> "FINAL";
            default               -> "GROUPS";
        };
    }

    /**
     * Sincroniza goleadores para todos los partidos FINALIZADOS con externalProviderId
     * que hayan kickedoff en las últimas 24 h y aún no tengan datos de la API.
     * Llamado por el ScorerSyncScheduler cada 5 min.
     */
    @Transactional
    public void syncScorersForRecentlyFinished() {
        if (!isConfigured()) return;
        String apiKey = appConfigService.getValue(API_KEY_CFG).orElse(null);
        if (apiKey == null) return;

        OffsetDateTime since = OffsetDateTime.now().minusHours(24);
        List<Fixture> candidates = fixtureRepository
                .findByStatusAndExternalProviderIdNotNullAndKickoffAtAfter(
                        FixtureStatus.FINISHED, since);

        for (Fixture fixture : candidates) {
            boolean alreadySynced = !matchEventRepository
                    .findByFixtureIdAndSource(fixture.getId(), MatchEvent.Source.API)
                    .isEmpty();
            if (!alreadySynced) {
                syncScorers(apiKey, fixture.getId(), fixture.getExternalProviderId());
            }
        }
    }

    /**
     * Llama a /v4/matches/{externalId} para obtener los goleadores del partido
     * y delega la comparación/corrección al MatchEventService.
     */
    void syncScorers(String apiKey, Long fixtureId, Long externalMatchId) {
        try {
            RestTemplate rest = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Auth-Token", apiKey);
            headers.setAccept(List.of(MediaType.APPLICATION_JSON));

            ResponseEntity<FdMatchDetail> resp = rest.exchange(
                    FD_BASE + "/matches/" + externalMatchId,
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    FdMatchDetail.class
            );

            FdMatchDetail detail = resp.getBody();
            if (detail == null || detail.goals() == null) return;

            List<MatchEventService.ApiGoal> apiGoals = detail.goals().stream()
                    .filter(g -> g.scorer() != null && g.scorer().name() != null)
                    .map(g -> new MatchEventService.ApiGoal(
                            g.scorer().name(),
                            g.minute(),
                            g.team() != null ? g.team().id() : null
                    ))
                    .toList();

            matchEventService.syncFromApi(fixtureId, apiGoals);

        } catch (Exception e) {
            log.warn("[Scorers] No se pudieron obtener goleadores para externalId={}: {}", externalMatchId, e.getMessage());
        }
    }

    public record SyncResult(int created, int updated, List<String> errors) {}
}
