package com.mundial2026.backend.tournament.api.dto;

import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;

public record CreateFixtureRequest(
        @NotNull Long tournamentId,
        @NotNull Long stageId,
        Long groupStageId,
        @NotNull Long homeTeamId,
        @NotNull Long awayTeamId,
        @NotNull OffsetDateTime kickoffAt,
        String name
) {}
