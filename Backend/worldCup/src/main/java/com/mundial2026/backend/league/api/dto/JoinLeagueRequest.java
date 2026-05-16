package com.mundial2026.backend.league.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record JoinLeagueRequest(
        @NotNull Long userId,
        @NotBlank String leagueCode
) {
}
