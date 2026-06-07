package com.mundial2026.backend.league.api.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateLeagueRequest(
        @NotNull Long userId,
        @NotNull Long tournamentId,
        @NotBlank @Size(max = 150) String name,
        @Size(max = 500) String description,
        @Min(2) @Max(100) Integer maxMembers,
        Boolean isPublic
) {
}
