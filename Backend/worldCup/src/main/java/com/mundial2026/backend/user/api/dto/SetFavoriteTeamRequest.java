package com.mundial2026.backend.user.api.dto;

import jakarta.validation.constraints.NotNull;

/**
 * Solicitud para establecer/cambiar el equipo favorito del usuario.
 * Es relevante para el plan FREE (define qué 3 partidos puede predecir gratis).
 */
public record SetFavoriteTeamRequest(
        @NotNull Long teamId
) {
}
