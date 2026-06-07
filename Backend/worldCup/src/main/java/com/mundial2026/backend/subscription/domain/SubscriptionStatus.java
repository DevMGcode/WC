package com.mundial2026.backend.subscription.domain;

/**
 * Ciclo de vida de una suscripción:
 *   PENDING   → orden creada, esperando confirmación del pago (webhook)
 *   ACTIVE    → pago confirmado, usuario es Premium hasta expires_at
 *   EXPIRED   → expires_at pasó (job nocturno o lectura en caliente)
 *   CANCELLED → el usuario canceló manualmente
 *   FAILED    → el pago falló (webhook de failure)
 */
public enum SubscriptionStatus {
    PENDING,
    ACTIVE,
    EXPIRED,
    CANCELLED,
    FAILED
}
