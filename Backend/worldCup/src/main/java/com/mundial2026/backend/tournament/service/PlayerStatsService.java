package com.mundial2026.backend.tournament.service;

import com.mundial2026.backend.config.CacheConfig;
import com.mundial2026.backend.tournament.api.dto.PlayerStatResponse;
import com.mundial2026.backend.tournament.integration.port.ExternalPlayerStat;
import com.mundial2026.backend.tournament.integration.port.PlayerDataPort;
import com.mundial2026.backend.tournament.integration.sync.CoverageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PlayerStatsService {

    /** Tope absoluto del backend — el controller decide cuántos devolver según el plan. */
    public static final int FREE_TOP_LIMIT = 10;
    public static final int PREMIUM_TOP_LIMIT = 50;

    private final PlayerDataPort playerDataPort;
    private final CoverageService coverageService;

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
        if (!coverageService.canFetchTopScorers()) {
            log.debug("Skipping /players/topscorers — coverage.top_scorers=false for active season");
            return List.of();
        }
        return playerDataPort.fetchTopScorers().stream()
                .map(this::toResponse)
                .toList();
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
