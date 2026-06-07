package com.mundial2026.backend.subscription.api.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

/**
 * Petición del frontend para crear una preferencia de pago en Mercado Pago.
 * El usuario autenticado se infiere del JWT, no del payload.
 */
public record MercadoPagoPreferenceRequest(
        @NotNull @Positive BigDecimal amount,
        @NotNull ProductDetailsDto productDetails
) {
}
