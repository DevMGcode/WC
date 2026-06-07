package com.mundial2026.backend.user.api.dto;

import java.time.OffsetDateTime;

public record AuthUserResponse(
        String id,
        String email,
        String displayName,
        String status,
        OffsetDateTime createdAt,
        Boolean isPremium
) {
}
