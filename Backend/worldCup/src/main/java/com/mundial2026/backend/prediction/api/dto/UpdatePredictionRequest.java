package com.mundial2026.backend.prediction.api.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record UpdatePredictionRequest(
        @NotNull @Min(0) Integer predictedHomeScore,
        @NotNull @Min(0) Integer predictedAwayScore
) {
}
