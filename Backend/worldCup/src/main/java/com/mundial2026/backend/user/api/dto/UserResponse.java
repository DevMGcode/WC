package com.mundial2026.backend.user.api.dto;

import java.time.OffsetDateTime;
import java.util.Set;

public record UserResponse(
        Long id,
        String username,
        String email,
        String firstName,
        String lastName,
        String countryName,
        String departmentName,
        String cityName,
        String preferredLanguage,
        String timeZone,
        String status,
        Boolean emailVerified,
        Set<String> roles,
        OffsetDateTime createdAt,
        Boolean isPremium
) {
}
