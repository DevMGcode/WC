package com.mundial2026.backend.subscription.service;

import com.mundial2026.backend.subscription.api.dto.AvailabilityResponse;
import com.mundial2026.backend.user.domain.AppUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Set;

/**
 * Decide si las pasarelas de pago están disponibles para un usuario dado.
 *
 * Reglas:
 *   1. País restringido → bloquea todo.
 *   2. Producto DIGITAL desde app nativa (iOS/Android) → bloquea todo (políticas de tienda).
 *   3. En cualquier otro caso → ambas pasarelas disponibles.
 */
@Service
@RequiredArgsConstructor
public class PaymentAvailabilityService {

    /** Países donde Mercado Pago no opera (vacío por defecto — opera en toda LATAM). */
    private static final Set<String> RESTRICTED_REGIONS = Set.of(
            "US", "CA", "GB", "JP", "SG", "CN"
    );

    /** Canales nativos donde Apple/Google exigen su propio billing para bienes digitales. */
    private static final Set<String> NATIVE_STORE_CHANNELS = Set.of("ios", "android");

    public AvailabilityResponse check(AppUser user, String productType, String distributionChannel) {

        // 1. Restricción regional
        String countryCode = user.getCountryCode();
        if (countryCode != null && RESTRICTED_REGIONS.contains(countryCode.toUpperCase())) {
            return AvailabilityResponse.blocked(
                    "REGION_RESTRICTED",
                    "Las pasarelas de pago no están disponibles en tu región."
            );
        }

        // 2. Bien digital en canal nativo de tienda
        if ("DIGITAL".equalsIgnoreCase(productType)
                && distributionChannel != null
                && NATIVE_STORE_CHANNELS.contains(distributionChannel.toLowerCase())) {
            return AvailabilityResponse.blocked(
                    "STORE_POLICY",
                    "Este método de pago no está disponible para compras in-app. Accede desde nuestro sitio web."
            );
        }

        // 3. Todo OK
        return AvailabilityResponse.bothAvailable();
    }
}
