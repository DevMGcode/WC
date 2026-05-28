package com.mundial2026.backend.tournament.service;

import com.mundial2026.backend.config.CacheConfig;
import com.mundial2026.backend.tournament.api.dto.HeadToHeadFixtureResponse;
import com.mundial2026.backend.tournament.domain.Team;
import com.mundial2026.backend.tournament.integration.port.ExternalMatch;
import com.mundial2026.backend.tournament.integration.port.HeadToHeadDataPort;
import com.mundial2026.backend.tournament.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HeadToHeadService {

    private static final int DEFAULT_LAST_MATCHES = 10;

    private final HeadToHeadDataPort headToHeadDataPort;
    private final TeamRepository teamRepository;

    @Cacheable(value = CacheConfig.HEAD_TO_HEAD, key = "#team1Id + '-' + #team2Id + '-' + #last")
    public List<HeadToHeadFixtureResponse> findBetween(Long team1Id, Long team2Id, Integer last) {
        int limit = (last == null || last <= 0) ? DEFAULT_LAST_MATCHES : last;

        Long extId1 = teamRepository.findById(team1Id).map(Team::getExternalProviderId).orElse(null);
        Long extId2 = teamRepository.findById(team2Id).map(Team::getExternalProviderId).orElse(null);

        if (extId1 == null || extId2 == null) return Collections.emptyList();

        return headToHeadDataPort.fetchHeadToHead(extId1, extId2, limit).stream()
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
