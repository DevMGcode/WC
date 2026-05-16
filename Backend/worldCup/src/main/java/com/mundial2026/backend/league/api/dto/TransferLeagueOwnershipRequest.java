package com.mundial2026.backend.league.api.dto;

import jakarta.validation.constraints.NotNull;

public record TransferLeagueOwnershipRequest(
        @NotNull Long currentOwnerUserId,
        @NotNull Long newOwnerUserId
) {
}
