package com.mundial2026.backend.push.api.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Suscripción que envía el navegador tras aceptar el permiso de notificaciones.
 * Corresponde al objeto PushSubscription del estándar Web Push (endpoint + keys).
 */
public record PushSubscriptionRequest(
        @NotBlank String endpoint,
        @NotBlank String p256dh,
        @NotBlank String auth
) {
}
