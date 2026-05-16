package com.mundial2026.backend.scoring.api.dto;

import java.time.OffsetDateTime;

public record PredictionScoreResponse(
        Long predictionId,
        Long userId,
        String username,
        Long fixtureId,
        String fixtureName,
        Long tournamentId,
        Integer pointsAwarded,
        String ruleCode,
        OffsetDateTime scoredAt
) {
}
