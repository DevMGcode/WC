package com.mundial2026.backend.tournament.api.dto;

import java.time.OffsetDateTime;

public record UpdateFixtureScheduleRequest(
        Long homeTeamId,
        Long awayTeamId,
        OffsetDateTime kickoffAt,
        Long stageId,
        Long groupStageId,
        String name
) {}
