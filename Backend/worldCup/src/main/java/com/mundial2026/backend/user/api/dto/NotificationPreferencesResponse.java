package com.mundial2026.backend.user.api.dto;

import com.mundial2026.backend.user.domain.AppUser;

/**
 * Preferencias de notificación del usuario (las lee el onboarding y Configuración).
 */
public record NotificationPreferencesResponse(
        Boolean fixtureReminders,
        Boolean resultNotifications,
        Boolean leagueUpdates,
        Boolean newsUpdates
) {
    public static NotificationPreferencesResponse from(AppUser user) {
        return new NotificationPreferencesResponse(
                user.getNotifyFixtureReminders(),
                user.getNotifyResultNotifications(),
                user.getNotifyLeagueUpdates(),
                user.getNotifyNewsUpdates()
        );
    }
}
