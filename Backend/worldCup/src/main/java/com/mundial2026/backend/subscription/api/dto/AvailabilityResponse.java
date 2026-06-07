package com.mundial2026.backend.subscription.api.dto;

/**
 * Respuesta del endpoint GET /payments/availability.
 * Espejo de `AvailabilityResponse` en el frontend.
 *
 * - available: true si al menos UNA pasarela está disponible
 * - gateways:  flags por pasarela para que el frontend muestre solo las activas
 */
public record AvailabilityResponse(
        boolean available,
        String reason,   // 'REGION_RESTRICTED' | 'PRODUCT_TYPE_BLOCKED' | 'STORE_POLICY' | 'MAINTENANCE'
        String message,
        Gateways gateways
) {
    public record Gateways(boolean mercadoPago) {}

    public static AvailabilityResponse bothAvailable() {
        return new AvailabilityResponse(true, null, null, new Gateways(true));
    }

    public static AvailabilityResponse blocked(String reason, String message) {
        return new AvailabilityResponse(false, reason, message, new Gateways(false));
    }
}
