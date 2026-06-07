package com.mundial2026.backend.league.api.dto;

import java.time.OffsetDateTime;

public record LeagueMemberResponse(
        Long id,
        Long leagueId,
        Long userId,
        String username,
        String fullName,
        String role,
        OffsetDateTime joinedAt,
        Boolean isPremium
) {
}
