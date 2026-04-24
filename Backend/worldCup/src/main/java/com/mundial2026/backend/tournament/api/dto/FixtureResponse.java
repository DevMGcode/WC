package com.mundial2026.backend.tournament.api.dto;

import java.time.OffsetDateTime;

public record FixtureResponse(
        Long id,
        String name,
        String tournamentName,
        String stageName,
        String groupCode,
        String homeTeam,
        String awayTeam,
        OffsetDateTime kickoffAt,
        OffsetDateTime predictionLockedAt,
        String status
) {
}
