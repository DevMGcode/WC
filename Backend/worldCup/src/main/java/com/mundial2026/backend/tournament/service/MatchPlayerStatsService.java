package com.mundial2026.backend.tournament.service;

import com.mundial2026.backend.config.CacheConfig;
import com.mundial2026.backend.tournament.api.dto.MatchPlayerStatResponse;
import com.mundial2026.backend.tournament.integration.port.ExternalMatchPlayerStat;
import com.mundial2026.backend.tournament.integration.port.MatchPlayerStatsDataPort;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MatchPlayerStatsService {

    private final MatchPlayerStatsDataPort matchPlayerStatsDataPort;

    @Cacheable(value = CacheConfig.MATCH_PLAYER_STATS, key = "#fixtureExternalId", unless = "#result.isEmpty()")
    public List<MatchPlayerStatResponse> findByFixture(Long fixtureExternalId) {
        return matchPlayerStatsDataPort.fetchPlayerStatsByFixture(fixtureExternalId).stream()
                .map(this::toResponse)
                .toList();
    }

    private MatchPlayerStatResponse toResponse(ExternalMatchPlayerStat e) {
        return new MatchPlayerStatResponse(
                e.teamId(),
                e.teamName(),
                e.playerId(),
                e.playerName(),
                e.photoUrl(),
                e.minutes(),
                e.shirtNumber(),
                e.position(),
                e.rating(),
                e.captain(),
                e.substitute(),
                e.shotsTotal(),
                e.shotsOn(),
                e.goals(),
                e.assists(),
                e.yellowCards(),
                e.redCards()
        );
    }
}
