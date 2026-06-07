package com.mundial2026.backend.tournament.api.dto;

import java.time.Instant;

public record StandingResponse(
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
        Integer homePlayed,
        Integer homeWon,
        Integer homeDrawn,
        Integer homeLost,
        Integer homeGoalsFor,
        Integer homeGoalsAgainst,
        Integer awayPlayed,
        Integer awayWon,
        Integer awayDrawn,
        Integer awayLost,
        Integer awayGoalsFor,
        Integer awayGoalsAgainst
) {
}
