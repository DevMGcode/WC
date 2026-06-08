package com.mundial2026.backend.user.api.dto;

/**
 * Equipo favorito de un usuario expuesto al frontend.
 */
public record FavoriteTeamResponse(
        Long teamId,
        String name,
        String shortName,
        String fifaCode,
        String flagUrl,
        Boolean isPrimary,
        Integer position
) {
}
