package com.mundial2026.backend.league.api.dto;

import java.time.OffsetDateTime;

public record LeagueResponse(
        Long id,
        String name,
        String code,
        Long ownerId,
        Long tournamentId,
        String tournamentName,
        String description,
        Boolean isPublic,
        Integer maxMembers,
        long memberCount,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}
