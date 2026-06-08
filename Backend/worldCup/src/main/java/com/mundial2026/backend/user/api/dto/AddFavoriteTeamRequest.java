package com.mundial2026.backend.user.api.dto;

import jakarta.validation.constraints.NotNull;

public record AddFavoriteTeamRequest(
        @NotNull Long teamId,
        Boolean makePrimary
) {
}
