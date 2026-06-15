package com.mundial2026.backend.tournament.service;

import com.mundial2026.backend.config.CacheConfig;
import com.mundial2026.backend.tournament.api.dto.PlayerStatResponse;
import com.mundial2026.backend.tournament.domain.MatchEvent;
import com.mundial2026.backend.tournament.domain.Team;
import com.mundial2026.backend.tournament.integration.port.ExternalPlayerStat;
import com.mundial2026.backend.tournament.integration.port.PlayerDataPort;
import com.mundial2026.backend.tournament.integration.sync.CoverageService;
import com.mundial2026.backend.tournament.repository.MatchEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class PlayerStatsService {

    /** Tope absoluto del backend — el controller decide cuántos devolver según el plan. */
    public static final int FREE_TOP_LIMIT = 10;
    public static final int PREMIUM_TOP_LIMIT = 50;

    private final PlayerDataPort playerDataPort;
    private final CoverageService coverageService;
    private final MatchEventRepository matchEventRepository;

    /**
     * Lista cruda de top goleadores (cacheada).
     *
     * <p>Antes de llamar a la API consulta {@link CoverageService#canFetchTopScorers()}:
     * si API-Football declara {@code coverage.top_scorers=false} (caso típico pre-Mundial),
     * devuelve lista vacía sin gastar cuota. La cobertura se re-evalúa cada 30 min
     * (TTL de {@link CacheConfig#LEAGUE_COVERAGE}), así que al activarse los flags
     * el día del kick-off el sistema empieza a llamar la API solo (max 30 min delay).
     */
    @Cacheable(CacheConfig.TOP_SCORERS)
    public List<PlayerStatResponse> findTopScorers() {
        if (coverageService.canFetchTopScorers()) {
            List<PlayerStatResponse> fromApi = playerDataPort.fetchTopScorers().stream()
                    .map(this::toResponse)
                    .toList();
            if (!fromApi.isEmpty()) {
                return fromApi;
            }
        }
        // Fallback local: API-Football aún no publica /players/topscorers para la
        // temporada activa (el ranking consolidado tarda más en activarse que los
        // eventos por partido). Lo calculamos desde los goles ya guardados en
        // match_event — mismos datos, fuente propia. Cuando la API publique el
        // ranking oficial (con fotos y stats completas), toma prioridad solo.
        return topScorersFromLocalGoals();
    }

    /**
     * Top goleadores con limite y filtro opcional por equipo.
     * El filtrado se hace sobre la lista cacheada — no genera nueva llamada externa.
     */
    public List<PlayerStatResponse> findTopScorers(int limit, Long teamFilter) {
        return findTopScorers().stream()
                .filter(p -> teamFilter == null || (p.teamId() != null && p.teamId().equals(teamFilter)))
                .limit(Math.max(1, limit))
                .toList();
    }

    /** Top asistentes — mismo patrón que {@link #findTopScorers()}. */
    @Cacheable(CacheConfig.TOP_ASSISTS)
    public List<PlayerStatResponse> findTopAssists() {
        if (!coverageService.canFetchTopAssists()) {
            log.debug("Skipping /players/topassists — coverage.top_assists=false for active season");
            return List.of();
        }
        return playerDataPort.fetchTopAssists().stream()
                .map(this::toResponse)
                .toList();
    }

    /** Top asistentes con limite y filtro opcional por equipo (Premium-only en el controller). */
    public List<PlayerStatResponse> findTopAssists(int limit, Long teamFilter) {
        return findTopAssists().stream()
                .filter(p -> teamFilter == null || (p.teamId() != null && p.teamId().equals(teamFilter)))
                .limit(Math.max(1, limit))
                .toList();
    }

    /**
     * Arma el top de goleadores agregando los goles de la tabla match_event
     * (sincronizados desde la API partido a partido, o cargados por el admin).
     * Sin foto ni stats avanzadas — el frontend muestra iniciales como fallback.
     * Los playerId son sintéticos (negativos) porque estos jugadores aún no
     * tienen id de la API; solo se usan como key de render en el frontend.
     */
    private List<PlayerStatResponse> topScorersFromLocalGoals() {
        List<MatchEvent> goals = matchEventRepository.findGoalEvents();
        if (goals.isEmpty()) {
            return List.of();
        }

        record PlayerKey(String name, Long teamId) {}
        Map<PlayerKey, List<MatchEvent>> grouped = new LinkedHashMap<>();
        for (MatchEvent e : goals) {
            if (e.getPlayerName() == null || e.getPlayerName().isBlank()) continue;
            PlayerKey key = new PlayerKey(
                    e.getPlayerName().trim(),
                    e.getTeam() != null ? e.getTeam().getId() : null);
            grouped.computeIfAbsent(key, k -> new ArrayList<>()).add(e);
        }

        List<PlayerStatResponse> out = new ArrayList<>();
        long syntheticId = -1;
        for (Map.Entry<PlayerKey, List<MatchEvent>> entry : grouped.entrySet().stream()
                .sorted((a, b) -> Integer.compare(b.getValue().size(), a.getValue().size()))
                .toList()) {
            Team team = entry.getValue().get(0).getTeam();
            out.add(new PlayerStatResponse(
                    syntheticId--,
                    entry.getKey().name(),
                    null, null,
                    team != null ? team.getCountryName() : null,
                    null,
                    null, null,
                    team != null ? team.getId() : null,
                    team != null ? team.getName() : null,
                    team != null ? team.getFlagUrl() : null,
                    null, null,
                    entry.getValue().size(),
                    null, null, null, null, null, null
            ));
        }
        return out;
    }

    private PlayerStatResponse toResponse(ExternalPlayerStat e) {
        return new PlayerStatResponse(
                e.playerId(),
                e.playerName(),
                e.firstName(),
                e.lastName(),
                e.nationality(),
                e.photoUrl(),
                e.age(),
                e.position(),
                e.teamId(),
                e.teamName(),
                e.teamLogoUrl(),
                e.appearances(),
                e.minutesPlayed(),
                e.goals(),
                e.assists(),
                e.shotsTotal(),
                e.shotsOnTarget(),
                e.yellowCards(),
                e.redCards(),
                e.rating()
        );
    }
}
