package com.mundial2026.backend.tournament.service;

import com.mundial2026.backend.config.CacheConfig;
import com.mundial2026.backend.tournament.api.dto.StandingResponse;
import com.mundial2026.backend.tournament.integration.port.ExternalStanding;
import com.mundial2026.backend.tournament.integration.port.StandingsDataPort;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StandingsService {

    private final StandingsDataPort standingsDataPort;

    @Cacheable(CacheConfig.STANDINGS)
    public List<StandingResponse> findAll() {
        return standingsDataPort.fetchStandings().stream()
                .map(this::toResponse)
                .toList();
    }

    public List<StandingResponse> findByGroup(String groupCode) {
        String target = "Group " + groupCode.toUpperCase();
        return findAll().stream()
                .filter(s -> target.equalsIgnoreCase(s.groupName()))
                .toList();
    }

    public List<StandingResponse> findFewestGoalsAgainst(int limit) {
        return findAll().stream()
                .filter(s -> s.goalsAgainst() != null)
                .sorted(Comparator.comparingInt(StandingResponse::goalsAgainst))
                .limit(limit)
                .toList();
    }

    private StandingResponse toResponse(ExternalStanding e) {
        return new StandingResponse(
                e.groupName(),
                e.rank(),
                e.teamId(),
                e.teamName(),
                e.teamLogoUrl(),
                e.played(),
                e.won(),
                e.drawn(),
                e.lost(),
                e.goalsFor(),
                e.goalsAgainst(),
                e.goalDifference(),
                e.points(),
                e.form(),
                e.description(),
                e.lastUpdate()
        );
    }
}
