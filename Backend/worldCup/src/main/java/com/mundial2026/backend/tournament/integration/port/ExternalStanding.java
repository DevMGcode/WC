package com.mundial2026.backend.tournament.integration.port;

import java.time.Instant;

public record ExternalStanding(
        String groupName,
        Integer rank,
        Long teamId,
        String teamName,
        String teamLogoUrl,
        Integer played,
        Integer won,
        Integer drawn,
        Integer lost,
        Integer goalsFor,
        Integer goalsAgainst,
        Integer goalDifference,
        Integer points,
        String form,
        String description,
        Instant lastUpdate,
        // Home breakdown — null in 2022 (API-Football returns all-null for that season)
        Integer homePlayed,
        Integer homeWon,
        Integer homeDrawn,
        Integer homeLost,
        Integer homeGoalsFor,
        Integer homeGoalsAgainst,
        // Away breakdown — null in 2022
        Integer awayPlayed,
        Integer awayWon,
        Integer awayDrawn,
        Integer awayLost,
        Integer awayGoalsFor,
        Integer awayGoalsAgainst
) {
}
