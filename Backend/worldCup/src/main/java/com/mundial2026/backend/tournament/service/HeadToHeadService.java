package com.mundial2026.backend.tournament.service;

import com.mundial2026.backend.config.CacheConfig;
import com.mundial2026.backend.tournament.api.dto.HeadToHeadFixtureResponse;
import com.mundial2026.backend.tournament.integration.port.ExternalMatch;
import com.mundial2026.backend.tournament.integration.port.HeadToHeadDataPort;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HeadToHeadService {

    private static final int DEFAULT_LAST_MATCHES = 10;

    private final HeadToHeadDataPort headToHeadDataPort;

    @Cacheable(value = CacheConfig.HEAD_TO_HEAD, key = "#team1Id + '-' + #team2Id + '-' + #last")
    public List<HeadToHeadFixtureResponse> findBetween(Long team1Id, Long team2Id, Integer last) {
        int limit = (last == null || last <= 0) ? DEFAULT_LAST_MATCHES : last;
        return headToHeadDataPort.fetchHeadToHead(team1Id, team2Id, limit).stream()
                .map(this::toResponse)
                .toList();
    }

    private HeadToHeadFixtureResponse toResponse(ExternalMatch m) {
        return new HeadToHeadFixtureResponse(
                m.externalId(),
                m.homeTeamId(),
                m.homeTeamName(),
                m.awayTeamId(),
                m.awayTeamName(),
                m.homeScore(),
                m.awayScore(),
                m.status(),
                m.kickoffUtc(),
                m.venueName(),
                m.leagueRound()
        );
    }
}
