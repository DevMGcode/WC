package com.mundial2026.backend.prediction.api.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CreatePredictionRequest(
        @NotNull Long userId,
        @NotNull Long fixtureId,
        @NotNull @Min(0) Integer predictedHomeScore,
        @NotNull @Min(0) Integer predictedAwayScore
) {
}
