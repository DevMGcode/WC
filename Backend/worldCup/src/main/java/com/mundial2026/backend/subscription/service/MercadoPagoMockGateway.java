package com.mundial2026.backend.subscription.service;

import com.mundial2026.backend.subscription.api.dto.MercadoPagoPreferenceRequest;
import com.mundial2026.backend.subscription.api.dto.MercadoPagoPreferenceResponse;
import com.mundial2026.backend.user.domain.AppUser;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Mock para desarrollo sin credenciales reales.
 *
 * <p>Devuelve un preferenceId aleatorio y URLs apuntando a una página interna.
 *
 * <p><b>Atajo de testing:</b> tras crear la preferencia, también activa la
 * suscripción directamente. En producción esto lo hace el webhook real de MP,
 * pero en modo mock no hay webhook — sin este atajo el desarrollador tendría
 * que correr {@code UPDATE subscription SET status='ACTIVE'} cada vez que
 * prueba el flujo. Esto NO afecta el modo {@code real}: ese gateway nace
 * en otro bean ({@link MercadoPagoRealGateway}) que mantiene PENDING hasta
 * que el webhook auténtico llegue.
 */
@Slf4j
@Service
@ConditionalOnProperty(
        prefix = "app.payments.mercado-pago",
        name = "mode",
        havingValue = "mock",
        matchIfMissing = true
)
public class MercadoPagoMockGateway implements MercadoPagoGateway {

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    @Value("${app.payments.mercado-pago.public-key:TEST-MOCK-PUBLIC-KEY}")
    private String publicKey;

    // @Lazy evita un ciclo: SubscriptionService → MercadoPagoGateway → SubscriptionService.
    private final SubscriptionService subscriptionService;

    public MercadoPagoMockGateway(@Lazy SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @Override
    public MercadoPagoPreferenceResponse createPreference(
            AppUser user,
            Long subscriptionId,
            MercadoPagoPreferenceRequest request
    ) {
        String preferenceId = "MOCK_MP_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();
        String fakeUrl = frontendUrl + "/checkout/result?provider=MERCADO_PAGO&preferenceId=" + preferenceId + "&status=success";

        log.info("[MOCK MercadoPago] Preferencia creada preferenceId={} userId={} amount={} subscriptionId={}",
                preferenceId, user.getId(), request.amount(), subscriptionId);

        // Auto-activación del lado mock: simula el webhook que en producción
        // pasaría la sub de PENDING → ACTIVE después del pago APPROVED.
        try {
            subscriptionService.activateById(subscriptionId, preferenceId);
            log.info("[MOCK MercadoPago] Suscripción id={} auto-activada (atajo de modo mock)", subscriptionId);
        } catch (Exception ex) {
            log.warn("[MOCK MercadoPago] No se pudo auto-activar sub id={}: {}", subscriptionId, ex.getMessage());
        }

        return new MercadoPagoPreferenceResponse(preferenceId, fakeUrl, fakeUrl, publicKey);
    }

    @Override
    public PaymentStatus fetchPaymentStatus(String paymentId) {
        log.info("[MOCK MercadoPago] Consulta de pago paymentId={} → APPROVED (simulado)", paymentId);
        // El mock "paga" exactamente el precio canónico del servidor para que la
        // conciliación anti-fraude del webhook pase en pruebas locales.
        return new PaymentStatus("approved", paymentId, true, false,
                SubscriptionService.MUNDIAL_PASS_PRICE, SubscriptionService.MUNDIAL_PASS_CURRENCY);
    }

    @Override
    public void refund(String paymentId) {
        log.info("[MOCK MercadoPago] Reembolso simulado paymentId={} → OK", paymentId);
    }

    @Override
    public void refund(String paymentId) {
        log.info("[MOCK MercadoPago] Reembolso simulado paymentId={} → OK", paymentId);
    }
}
