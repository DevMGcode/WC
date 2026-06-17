package com.mundial2026.backend.user.api.dto;

import jakarta.validation.constraints.NotNull;

/**
 * Preferencias de notificación que envía el cliente (onboarding o Configuración).
 * Todos obligatorios: el frontend siempre manda el estado completo de los 4 toggles.
 */
public record NotificationPreferencesRequest(
        @NotNull Boolean fixtureReminders,
        @NotNull Boolean resultNotifications,
        @NotNull Boolean leagueUpdates,
        @NotNull Boolean newsUpdates
) {
}
