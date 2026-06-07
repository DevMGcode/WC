package com.mundial2026.backend.subscription.api.dto;

import java.math.BigDecimal;

/**
 * Detalles del producto que el frontend envía en cada checkout.
 * Espejo de `ProductDetails` en `lib/payments/types.ts`.
 */
public record ProductDetailsDto(
        String id,
        String name,
        String description,
        Integer quantity,
        BigDecimal unitPrice,
        String fiatCurrency,
        String cryptoCurrency,
        String type // 'PHYSICAL' | 'DIGITAL'
) {
}
