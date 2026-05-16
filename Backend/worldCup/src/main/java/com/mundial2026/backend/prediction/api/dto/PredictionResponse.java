package com.mundial2026.backend.prediction.api.dto;

import java.time.OffsetDateTime;

public record PredictionResponse(
        Long id,
        Long userId,
        String username,
        Long fixtureId,
        String fixtureName,
        Integer predictedHomeScore,
        Integer predictedAwayScore,
        OffsetDateTime submittedAt,
        OffsetDateTime lockedAt,
        Boolean isLocked,
        String lockReason
) {
}
