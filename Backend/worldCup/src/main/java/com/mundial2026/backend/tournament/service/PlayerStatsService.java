package com.mundial2026.backend.tournament.service;

import com.mundial2026.backend.config.CacheConfig;
import com.mundial2026.backend.tournament.api.dto.PlayerStatResponse;
import com.mundial2026.backend.tournament.integration.port.ExternalPlayerStat;
import com.mundial2026.backend.tournament.integration.port.PlayerDataPort;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PlayerStatsService {

    /** Tope absoluto del backend — el controller decide cuántos devolver según el plan. */
    public static final int FREE_TOP_LIMIT = 10;
    public static final int PREMIUM_TOP_LIMIT = 50;

    private final PlayerDataPort playerDataPort;

    /** Lista cruda de top goleadores (cacheada). Sin limit ni filtro. */
    @Cacheable(CacheConfig.TOP_SCORERS)
    public List<PlayerStatResponse> findTopScorers() {
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

    @Cacheable(CacheConfig.TOP_ASSISTS)
    public List<PlayerStatResponse> findTopAssists() {
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
