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

    private final PlayerDataPort playerDataPort;

    @Cacheable(CacheConfig.TOP_SCORERS)
    public List<PlayerStatResponse> findTopScorers() {
        return playerDataPort.fetchTopScorers().stream()
                .map(this::toResponse)
                .toList();
    }

    @Cacheable(CacheConfig.TOP_ASSISTS)
    public List<PlayerStatResponse> findTopAssists() {
        return playerDataPort.fetchTopAssists().stream()
                .map(this::toResponse)
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
