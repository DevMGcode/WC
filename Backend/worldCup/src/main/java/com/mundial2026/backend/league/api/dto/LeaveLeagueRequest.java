package com.mundial2026.backend.league.api.dto;

import jakarta.validation.constraints.NotNull;

public record LeaveLeagueRequest(
        @NotNull Long userId
) {
}
