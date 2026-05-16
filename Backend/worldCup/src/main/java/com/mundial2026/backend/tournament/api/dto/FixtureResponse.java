package com.mundial2026.backend.tournament.api.dto;

import java.time.OffsetDateTime;

public record FixtureResponse(
        Long id,
        String name,
        String tournamentName,
        String stageName,
        String groupCode,
        TeamResponse homeTeam,
        TeamResponse awayTeam,
        String hostCity,
        String hostCountry,
        String stadiumName,
        OffsetDateTime kickoffAt,
        OffsetDateTime predictionLockedAt,
        String status,
        Integer homeScore,
        Integer awayScore,
        Long externalProviderId
) {
    public record TeamResponse(
            Long id,
            String name,
            String shortName,
            String fifaCode,
            String flagUrl
    ) {
    }
}
