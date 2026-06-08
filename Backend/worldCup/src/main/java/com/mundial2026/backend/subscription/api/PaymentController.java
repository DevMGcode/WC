package com.mundial2026.backend.subscription.api;

import com.mundial2026.backend.common.response.ApiResponse;
import com.mundial2026.backend.security.SecurityUtils;
import com.mundial2026.backend.subscription.api.dto.AvailabilityResponse;
import com.mundial2026.backend.subscription.api.dto.MercadoPagoPreferenceRequest;
import com.mundial2026.backend.subscription.api.dto.MercadoPagoPreferenceResponse;
import com.mundial2026.backend.subscription.domain.PaymentProvider;
import com.mundial2026.backend.subscription.domain.Subscription;
import com.mundial2026.backend.subscription.service.MercadoPagoGateway;
import com.mundial2026.backend.subscription.service.PaymentAvailabilityService;
import com.mundial2026.backend.subscription.service.SubscriptionService;
import com.mundial2026.backend.user.domain.AppUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Endpoints de pago consumidos por el frontend.
 *
 * Pasarela única: Mercado Pago (Checkout Pro) — cubre tarjeta, Nequi, PSE,
 * Daviplata, efectivo, Apple/Google Pay y pago internacional.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final SecurityUtils securityUtils;
    private final SubscriptionService subscriptionService;
    private final PaymentAvailabilityService availabilityService;
    private final MercadoPagoGateway mercadoPagoGateway;

    // ─── Availability ─────────────────────────────────────────────────────────

    @GetMapping("/availability")
    public ResponseEntity<AvailabilityResponse> availability(
            @RequestParam(name = "productType", required = false) String productType,
            @RequestHeader(name = "X-Distribution-Channel", required = false) String channel
    ) {
        AppUser user = securityUtils.currentUser();
        AvailabilityResponse response = availabilityService.check(user, productType, channel);
        return ResponseEntity.ok(response);
    }

    // ─── Mercado Pago ─────────────────────────────────────────────────────────

    @PostMapping("/mercadopago/preference")
    public ResponseEntity<ApiResponse<MercadoPagoPreferenceResponse>> createMercadoPagoPreference(
            @Valid @RequestBody MercadoPagoPreferenceRequest request
    ) {
        AppUser user = securityUtils.currentUser();
        log.info("Creando preferencia Mercado Pago userId={} amount={} {}",
                user.getId(), request.amount(), request.productDetails().fiatCurrency());

        // 1. Crear suscripción PENDING en BD
        Subscription pending = subscriptionService.createPending(
                user.getId(),
                PaymentProvider.MERCADO_PAGO,
                request.amount(),
                request.productDetails().fiatCurrency()
        );

        // 2. Crear la preferencia en Mercado Pago (mock o real, según config)
        MercadoPagoPreferenceResponse preference = mercadoPagoGateway.createPreference(
                user, pending.getId(), request
        );

        // 3. Asociar el preferenceId a la suscripción para conciliar el webhook
        subscriptionService.attachProviderOrderId(pending.getId(), preference.preferenceId());

        return ResponseEntity.ok(ApiResponse.ok("Preferencia creada", preference));
    }
}
