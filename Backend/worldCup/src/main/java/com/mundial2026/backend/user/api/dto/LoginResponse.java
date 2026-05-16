package com.mundial2026.backend.user.api.dto;

public record LoginResponse(
        AuthUserResponse user,
        String accessToken,
        String refreshToken
) {
}
