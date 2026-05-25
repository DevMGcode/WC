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
        Instant lastUpdate
) {
}
