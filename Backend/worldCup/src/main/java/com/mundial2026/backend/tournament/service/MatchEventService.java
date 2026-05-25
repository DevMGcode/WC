package com.mundial2026.backend.tournament.service;

import com.mundial2026.backend.config.CacheConfig;
import com.mundial2026.backend.tournament.api.dto.MatchEventResponse;
import com.mundial2026.backend.tournament.integration.port.ExternalMatchEvent;
import com.mundial2026.backend.tournament.integration.port.MatchEventDataPort;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MatchEventService {

    private final MatchEventDataPort matchEventDataPort;

    @Cacheable(value = CacheConfig.MATCH_EVENTS, key = "#fixtureExternalId", unless = "#result.isEmpty()")
    public List<MatchEventResponse> findByFixture(Long fixtureExternalId) {
        return matchEventDataPort.fetchEventsByFixture(fixtureExternalId).stream()
                .map(this::toResponse)
                .toList();
    }

    private MatchEventResponse toResponse(ExternalMatchEvent e) {
        return new MatchEventResponse(
                e.elapsedMinute(),
                e.extraMinute(),
                e.teamId(),
                e.teamName(),
                e.playerId(),
                e.playerName(),
                e.assistPlayerId(),
                e.assistPlayerName(),
                e.type(),
                e.detail(),
                e.comments()
        );
    }
}
