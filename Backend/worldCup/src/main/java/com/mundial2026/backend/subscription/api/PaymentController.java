package com.mundial2026.backend.subscription.api;

import com.mundial2026.backend.common.response.ApiResponse;
import com.mundial2026.backend.security.SecurityUtils;
import com.mundial2026.backend.subscription.api.dto.AvailabilityResponse;
import com.mundial2026.backend.subscription.api.dto.MercadoPagoPreferenceRequest;
import com.mundial2026.backend.subscription.api.dto.MercadoPagoPreferenceResponse;
import com.mundial2026.backend.subscription.api.dto.ProductDetailsDto;
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

import java.math.BigDecimal;

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

    // ─── Reembolso ────────────────────────────────────────────────────────────

    /**
     * Solicita el reembolso de la suscripción activa del usuario autenticado.
     * Solo aplica dentro de las 24 horas desde la activación del pago.
     */
    @PostMapping("/refund")
    public ResponseEntity<ApiResponse<Void>> requestRefund() {
        AppUser user = securityUtils.currentUser();
        log.info("Solicitud de reembolso userId={}", user.getId());
        subscriptionService.requestRefund(user.getId());
        return ResponseEntity.ok(ApiResponse.ok("Reembolso procesado exitosamente. El monto será acreditado en los próximos días hábiles.", null));
    }

    // ─── Mercado Pago ─────────────────────────────────────────────────────────

    @PostMapping("/mercadopago/preference")
    public ResponseEntity<ApiResponse<MercadoPagoPreferenceResponse>> createMercadoPagoPreference(
            @Valid @RequestBody MercadoPagoPreferenceRequest request
    ) {
        AppUser user = securityUtils.currentUser();

        // SEGURIDAD: el precio NO se toma del cliente. El frontend puede manipular
        // `amount` (p.ej. ?amount=1) para pagar menos. Usamos el precio canónico
        // del servidor y saneamos el productDetails para que el item cobrado coincida.
        final BigDecimal price    = SubscriptionService.MUNDIAL_PASS_PRICE;
        final String     currency = SubscriptionService.MUNDIAL_PASS_CURRENCY;

        var pd = request.productDetails();
        ProductDetailsDto sanitizedDetails = new ProductDetailsDto(
                pd != null ? pd.id() : null,
                pd != null ? pd.name() : "Pase Mundial 2026",
                pd != null ? pd.description() : null,
                1,                 // cantidad fija: 1 Pase
                price,             // precio del servidor
                currency,          // moneda del servidor
                pd != null ? pd.cryptoCurrency() : null,
                pd != null ? pd.type() : "DIGITAL"
        );
        MercadoPagoPreferenceRequest sanitizedRequest =
                new MercadoPagoPreferenceRequest(price, sanitizedDetails);

        log.info("Creando preferencia Mercado Pago userId={} amount={} {} (precio fijado por servidor)",
                user.getId(), price, currency);

        // 1. Crear suscripción PENDING en BD con el precio del servidor
        Subscription pending = subscriptionService.createPending(
                user.getId(),
                PaymentProvider.MERCADO_PAGO,
                price,
                currency
        );

        // 2. Crear la preferencia en Mercado Pago (mock o real, según config)
        MercadoPagoPreferenceResponse preference = mercadoPagoGateway.createPreference(
                user, pending.getId(), sanitizedRequest
        );

        // 3. Asociar el preferenceId a la suscripción para conciliar el webhook
        subscriptionService.attachProviderOrderId(pending.getId(), preference.preferenceId());

        return ResponseEntity.ok(ApiResponse.ok("Preferencia creada", preference));
    }
}
