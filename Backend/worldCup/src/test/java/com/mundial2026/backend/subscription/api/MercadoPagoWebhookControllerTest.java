package com.mundial2026.backend.subscription.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.mundial2026.backend.common.exception.BusinessRuleException;
import com.mundial2026.backend.subscription.service.MercadoPagoGateway;
import com.mundial2026.backend.subscription.service.SubscriptionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Tests de la política de respuesta del webhook de Mercado Pago:
 *   - 200 cuando se procesa bien o el rechazo es permanente (reintentar no ayuda).
 *   - 500 cuando el error es transitorio, para que MP reintente la notificación
 *     (activateById es idempotente, así que el reintento es seguro).
 */
@ExtendWith(MockitoExtension.class)
class MercadoPagoWebhookControllerTest {

    @Mock MercadoPagoGateway mercadoPagoGateway;
    @Mock SubscriptionService subscriptionService;

    @InjectMocks MercadoPagoWebhookController controller;

    private final ObjectMapper mapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        // Sin secret configurado se omite la validación de firma (modo dev)
        ReflectionTestUtils.setField(controller, "webhookSecret", "");
    }

    private JsonNode paymentBody(String paymentId) {
        ObjectNode body = mapper.createObjectNode();
        body.put("type", "payment");
        body.putObject("data").put("id", paymentId);
        return body;
    }

    private MercadoPagoGateway.PaymentStatus approvedStatus(String subscriptionId) {
        return new MercadoPagoGateway.PaymentStatus(
                "approved", subscriptionId, true, false, new BigDecimal("9.99"), "USD");
    }

    @Test
    void approvedPayment_activatesAndReturns200() {
        when(mercadoPagoGateway.fetchPaymentStatus("111")).thenReturn(approvedStatus("42"));

        ResponseEntity<Void> response = controller.handleWebhook(paymentBody("111"), null, null, "req-1");

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        verify(subscriptionService).activateById(42L, "111", new BigDecimal("9.99"), "USD");
    }

    @Test
    void transientError_returns500_soMercadoPagoRetries() {
        // Fallo temporal (BD caída, timeout) al activar: el usuario ya pagó,
        // devolver 200 lo dejaría en PENDING para siempre.
        when(mercadoPagoGateway.fetchPaymentStatus("111")).thenReturn(approvedStatus("42"));
        when(subscriptionService.activateById(anyLong(), anyString(), any(), any()))
                .thenThrow(new RuntimeException("connection refused"));

        ResponseEntity<Void> response = controller.handleWebhook(paymentBody("111"), null, null, "req-2");

        assertThat(response.getStatusCode().value()).isEqualTo(500);
    }

    @Test
    void fetchStatusFails_returns500_soMercadoPagoRetries() {
        when(mercadoPagoGateway.fetchPaymentStatus("111"))
                .thenThrow(new IllegalStateException("MP API no disponible"));

        ResponseEntity<Void> response = controller.handleWebhook(paymentBody("111"), null, null, "req-3");

        assertThat(response.getStatusCode().value()).isEqualTo(500);
    }

    @Test
    void businessRejection_returns200_noRetryHelps() {
        // Monto que no concilia (anti-fraude): permanente, MP no debe reintentar
        when(mercadoPagoGateway.fetchPaymentStatus("111")).thenReturn(approvedStatus("42"));
        when(subscriptionService.activateById(anyLong(), anyString(), any(), any()))
                .thenThrow(new BusinessRuleException("El monto del pago no coincide con el precio del plan."));

        ResponseEntity<Void> response = controller.handleWebhook(paymentBody("111"), null, null, "req-4");

        assertThat(response.getStatusCode().value()).isEqualTo(200);
    }

    @Test
    void subscriptionNotFound_returns200_noRetryHelps() {
        when(mercadoPagoGateway.fetchPaymentStatus("111")).thenReturn(approvedStatus("42"));
        when(subscriptionService.activateById(anyLong(), anyString(), any(), any()))
                .thenThrow(new IllegalArgumentException("Suscripción no encontrada: 42"));

        ResponseEntity<Void> response = controller.handleWebhook(paymentBody("111"), null, null, "req-5");

        assertThat(response.getStatusCode().value()).isEqualTo(200);
    }

    @Test
    void invalidExternalReference_returns200() {
        when(mercadoPagoGateway.fetchPaymentStatus("111")).thenReturn(approvedStatus("no-numerico"));

        ResponseEntity<Void> response = controller.handleWebhook(paymentBody("111"), null, null, "req-6");

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        verify(subscriptionService, never()).activateById(anyLong(), anyString(), any(), any());
    }

    @Test
    void nonPaymentEvent_isIgnoredWith200() {
        ObjectNode body = mapper.createObjectNode();
        body.put("type", "merchant_order");

        ResponseEntity<Void> response = controller.handleWebhook(body, null, null, "req-7");

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        verify(mercadoPagoGateway, never()).fetchPaymentStatus(anyString());
    }
}
