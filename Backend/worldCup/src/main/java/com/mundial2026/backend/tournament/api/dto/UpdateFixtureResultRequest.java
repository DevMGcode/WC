package com.mundial2026.backend.tournament.api.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record UpdateFixtureResultRequest(
        @NotNull @Min(0) Integer homeScore,
        @NotNull @Min(0) Integer awayScore
) {
}
