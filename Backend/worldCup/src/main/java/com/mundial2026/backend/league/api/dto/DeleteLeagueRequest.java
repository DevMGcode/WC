package com.mundial2026.backend.league.api.dto;

import jakarta.validation.constraints.NotNull;

public record DeleteLeagueRequest(
        @NotNull Long ownerUserId
) {
}
