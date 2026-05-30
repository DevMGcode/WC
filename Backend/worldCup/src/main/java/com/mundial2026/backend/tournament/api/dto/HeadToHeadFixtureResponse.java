package com.mundial2026.backend.tournament.api.dto;

import com.mundial2026.backend.tournament.integration.port.MatchStatus;

import java.time.Instant;

public record HeadToHeadFixtureResponse(
        String externalId,
        Long homeTeamId,
        String homeTeamName,
        Long awayTeamId,
        String awayTeamName,
        Integer homeScore,
        Integer awayScore,
        MatchStatus status,
        Instant kickoffUtc,
        String venueName,
        String leagueRound
) {
}
