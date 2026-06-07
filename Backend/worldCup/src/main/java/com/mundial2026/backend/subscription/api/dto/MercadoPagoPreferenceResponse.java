package com.mundial2026.backend.subscription.api.dto;

/**
 * Respuesta de la creación de preferencia.
 *
 * - preferenceId: ID interno de Mercado Pago para esta orden.
 * - initPoint:    URL del checkout en producción (cobra dinero real).
 * - sandboxInitPoint: URL del checkout en sandbox (para pruebas con tarjetas TEST).
 *
 * El frontend redirige al usuario al `initPoint` (o al sandbox en dev).
 */
public record MercadoPagoPreferenceResponse(
        String preferenceId,
        String initPoint,
        String sandboxInitPoint,
        String publicKey
) {
}
