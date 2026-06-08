package com.mundial2026.backend.subscription.service;

import com.mundial2026.backend.subscription.api.dto.MercadoPagoPreferenceRequest;
import com.mundial2026.backend.subscription.api.dto.MercadoPagoPreferenceResponse;
import com.mundial2026.backend.user.domain.AppUser;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Mock para desarrollo sin credenciales reales.
 * Devuelve un preferenceId aleatorio y URLs apuntando a una página interna.
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

        return new MercadoPagoPreferenceResponse(preferenceId, fakeUrl, fakeUrl, publicKey);
    }

    @Override
    public PaymentStatus fetchPaymentStatus(String paymentId) {
        // En modo mock, asumimos que todos los pagos se aprueban
        log.info("[MOCK MercadoPago] Consulta de pago paymentId={} → APPROVED (simulado)", paymentId);
        return new PaymentStatus("approved", paymentId, true, false);
    }
}
