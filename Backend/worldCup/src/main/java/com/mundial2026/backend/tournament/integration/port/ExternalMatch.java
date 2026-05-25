package com.mundial2026.backend.tournament.integration.port;

import java.time.Instant;

public record ExternalMatch(
        String externalId,
        Long homeTeamId,
        String homeTeamName,
        Long awayTeamId,
        String awayTeamName,
        Integer homeScore,
        Integer awayScore,
        Integer elapsedMinutes,
        MatchStatus status,
        Instant kickoffUtc,
        String venueName,
        String leagueRound
) {
}