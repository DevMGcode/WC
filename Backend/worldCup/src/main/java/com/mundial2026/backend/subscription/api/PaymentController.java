package com.mundial2026.backend.subscription.api;

import com.mundial2026.backend.common.response.ApiResponse;
import com.mundial2026.backend.security.SecurityUtils;
import com.mundial2026.backend.subscription.api.dto.AvailabilityResponse;
import com.mundial2026.backend.subscription.api.dto.MercadoPagoPreferenceRequest;
import com.mundial2026.backend.subscription.api.dto.MercadoPagoPreferenceResponse;
import com.mundial2026.backend.subscription.api.dto.ProductDetailsDto;
import com.mundial2026.backend.subscription.domain.PaymentProvider;
import com.mundial2026.backend.subscription.domain.Subscription;
import com.mundial2026.backend.subscription.service.CurrencyConversionService;
import com.mundial2026.backend.subscription.service.MercadoPagoGateway;
import com.mundial2026.backend.subscription.service.PaymentAvailabilityService;
import com.mundial2026.backend.subscription.service.SubscriptionService;
import com.mundial2026.backend.user.domain.AppUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.mundial2026.backend.common.exception.ResourceNotFoundException;
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
    private final CurrencyConversionService currencyConversionService;

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

        // SEGURIDAD: el precio NO se toma del cliente. Partimos de 9.99 USD
        // y lo convertimos a COP en tiempo real para que MP y la BD coincidan.
        final BigDecimal usdPrice = SubscriptionService.MUNDIAL_PASS_PRICE;
        final BigDecimal copPrice = currencyConversionService.usdToCop(usdPrice);
        final String     currency = "COP";

        var pd = request.productDetails();
        ProductDetailsDto sanitizedDetails = new ProductDetailsDto(
                pd != null ? pd.id() : null,
                pd != null ? pd.name() : "Pase Mundial 2026",
                pd != null ? pd.description() : null,
                1,
                copPrice,
                currency,
                pd != null ? pd.cryptoCurrency() : null,
                pd != null ? pd.type() : "DIGITAL"
        );
        MercadoPagoPreferenceRequest sanitizedRequest =
                new MercadoPagoPreferenceRequest(copPrice, sanitizedDetails);

        log.info("Creando preferencia Mercado Pago userId={} amount={} USD → {} COP",
                user.getId(), usdPrice, copPrice);

        // 1. Crear suscripción PENDING en BD con el precio en COP (misma moneda que MP reportará)
        Subscription pending = subscriptionService.createPending(
                user.getId(),
                PaymentProvider.MERCADO_PAGO,
                copPrice,
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

    /**
     * El frontend llama este endpoint desde /checkout/result cuando MP redirige con status=success.
     * Consulta MP directamente para confirmar el pago y activa la suscripción sin depender del webhook.
     * Idempotente: si ya está ACTIVE no hace nada.
     */
    @PostMapping("/mercadopago/verify/{paymentId}")
    public ResponseEntity<ApiResponse<Void>> verifyMercadoPagoPayment(
            @PathVariable String paymentId
    ) {
        AppUser user = securityUtils.currentUser();
        log.info("Verificación activa de pago userId={} paymentId={}", user.getId(), paymentId);

        MercadoPagoGateway.PaymentStatus status = mercadoPagoGateway.fetchPaymentStatus(paymentId);

        if (!status.approved()) {
            log.info("Pago no aprobado aún paymentId={} mpStatus={}", paymentId, status.mpStatus());
            return ResponseEntity.ok(ApiResponse.ok("Pago pendiente o rechazado", null));
        }

        String externalRef = status.externalReference();
        if (externalRef == null || externalRef.isBlank()) {
            throw new ResourceNotFoundException("No se encontró referencia de suscripción para el pago " + paymentId);
        }

        Long subscriptionId = Long.parseLong(externalRef);
        subscriptionService.activateById(subscriptionId, paymentId,
                status.transactionAmount(), status.currency());

        log.info("Suscripción activada por verificación activa userId={} subscriptionId={}", user.getId(), subscriptionId);
        return ResponseEntity.ok(ApiResponse.ok("¡Suscripción Premium activada!", null));
    }
}
