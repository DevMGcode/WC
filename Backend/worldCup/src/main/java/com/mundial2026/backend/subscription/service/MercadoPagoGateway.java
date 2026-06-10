package com.mundial2026.backend.subscription.service;

import com.mundial2026.backend.subscription.api.dto.MercadoPagoPreferenceRequest;
import com.mundial2026.backend.subscription.api.dto.MercadoPagoPreferenceResponse;
import com.mundial2026.backend.user.domain.AppUser;

import java.math.BigDecimal;

/**
 * Contrato de la pasarela Mercado Pago (Checkout Pro).
 *
 * Implementación MOCK: devuelve URLs falsas para desarrollo local.
 * Implementación REAL: llama al SDK oficial para crear una Preference real
 * y obtener el `init_point` donde redirigir al usuario.
 */
public interface MercadoPagoGateway {

    MercadoPagoPreferenceResponse createPreference(
            AppUser user,
            Long subscriptionId,
            MercadoPagoPreferenceRequest request
    );

    /**
     * Consulta el estado de un pago en Mercado Pago a partir de su ID.
     * Se usa en el webhook: MP envía "type=payment, data.id=123" y nosotros
     * consultamos al MP qué pasó realmente con ese pago (status=approved, etc.).
     */
    PaymentStatus fetchPaymentStatus(String paymentId);

    /**
     * Solicita un reembolso total del pago indicado.
     * Lanza excepción si MP rechaza el reembolso.
     */
    void refund(String paymentId);

    /**
     * Estado normalizado del pago consultado a Mercado Pago.
     * - APPROVED:  pago confirmado → activar suscripción
     * - REJECTED:  pago rechazado → marcar FAILED
     * - PENDING:   en proceso (efectivo, PSE pendiente, etc.)
     */
    record PaymentStatus(
            String mpStatus,             // status crudo de MP
            String externalReference,    // referencia interna que mandamos = subscriptionId
            boolean approved,
            boolean rejected,
            BigDecimal transactionAmount, // monto realmente pagado (para conciliar anti-fraude)
            String currency              // moneda del pago
    ) {}
}
