package com.mundial2026.backend.subscription.service;

import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.preference.PreferenceBackUrlsRequest;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferencePayerRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.payment.Payment;
import com.mercadopago.resources.preference.Preference;
import com.mundial2026.backend.subscription.api.dto.MercadoPagoPreferenceRequest;
import com.mundial2026.backend.subscription.api.dto.MercadoPagoPreferenceResponse;
import com.mundial2026.backend.user.domain.AppUser;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

/**
 * Implementación real de Mercado Pago — llama al SDK oficial para crear
 * una Preference en la cuenta del merchant y obtener `init_point`.
 *
 * Se activa configurando en application.yml (o env):
 *   app.payments.mercado-pago.mode=real
 *   app.payments.mercado-pago.access-token=TEST-...  (o APP_USR-... en producción)
 *
 * Documentación oficial: https://www.mercadopago.com.co/developers/es/docs/checkout-pro
 */
@Slf4j
@Service
@ConditionalOnProperty(
        prefix = "app.payments.mercado-pago",
        name = "mode",
        havingValue = "real"
)
public class MercadoPagoRealGateway implements MercadoPagoGateway {

    @Value("${app.payments.mercado-pago.access-token:}")
    private String accessToken;

    @Value("${app.payments.mercado-pago.public-key:}")
    private String publicKey;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    @Value("${app.payments.mercado-pago.notification-url:}")
    private String notificationUrl;

    @PostConstruct
    void init() {
        if (accessToken == null || accessToken.isBlank()) {
            throw new IllegalStateException(
                    "MercadoPagoRealGateway: falta app.payments.mercado-pago.access-token. " +
                            "Configura la variable MERCADO_PAGO_ACCESS_TOKEN o vuelve al modo mock."
            );
        }
        MercadoPagoConfig.setAccessToken(accessToken);
        log.info("MercadoPagoRealGateway inicializado con access token {}",
                accessToken.length() > 12 ? accessToken.substring(0, 12) + "..." : "(corto)");
    }

    @Override
    public MercadoPagoPreferenceResponse createPreference(
            AppUser user,
            Long subscriptionId,
            MercadoPagoPreferenceRequest request
    ) {
        try {
            // 1. Construir el item (Pase Mundial)
            PreferenceItemRequest item = PreferenceItemRequest.builder()
                    .id(request.productDetails().id())
                    .title(request.productDetails().name())
                    .description(request.productDetails().description())
                    .quantity(request.productDetails().quantity() != null
                            ? request.productDetails().quantity() : 1)
                    .currencyId(normalizeCurrency(request.productDetails().fiatCurrency()))
                    .unitPrice(request.amount())
                    .build();

            // 2. Datos del pagador (para que MP autocomplete email/nombre en el checkout)
            PreferencePayerRequest payer = PreferencePayerRequest.builder()
                    .email(user.getEmail())
                    .name(user.getFirstName())
                    .surname(user.getLastName())
                    .build();

            // 3. URLs de retorno tras el pago
            PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                    .success(frontendUrl + "/checkout/result?provider=MERCADO_PAGO&status=success")
                    .failure(frontendUrl + "/checkout/result?provider=MERCADO_PAGO&status=failure")
                    .pending(frontendUrl + "/checkout/result?provider=MERCADO_PAGO&status=pending")
                    .build();

            // 4. Petición final
            // autoReturn solo aplica con URLs públicas (https). En localhost MP lo rechaza,
            // así que lo omitimos en dev — el usuario hace click manual en "Volver al sitio".
            boolean isLocalhost = frontendUrl != null && frontendUrl.contains("localhost");

            PreferenceRequest.PreferenceRequestBuilder builder = PreferenceRequest.builder()
                    .items(List.of(item))
                    .payer(payer)
                    .backUrls(backUrls)
                    .externalReference(String.valueOf(subscriptionId))  // ← KEY para conciliar webhook
                    .notificationUrl(notificationUrl.isBlank() ? null : notificationUrl)
                    .statementDescriptor("WC PASE MUNDIAL");

            if (!isLocalhost) {
                builder.autoReturn("approved");
            }

            PreferenceRequest preferenceRequest = builder.build();

            PreferenceClient client = new PreferenceClient();
            Preference preference = client.create(preferenceRequest);

            log.info("MercadoPago: preferencia creada id={} subscriptionId={}",
                    preference.getId(), subscriptionId);

            return new MercadoPagoPreferenceResponse(
                    preference.getId(),
                    preference.getInitPoint(),
                    preference.getSandboxInitPoint(),
                    publicKey
            );

        } catch (MPApiException e) {
            log.error("MercadoPago API error: status={} body={}", e.getStatusCode(), e.getApiResponse().getContent());
            throw new IllegalStateException("Error creando preferencia en Mercado Pago", e);
        } catch (MPException e) {
            log.error("MercadoPago error: {}", e.getMessage());
            throw new IllegalStateException("Error creando preferencia en Mercado Pago", e);
        }
    }

    @Override
    public PaymentStatus fetchPaymentStatus(String paymentId) {
        try {
            PaymentClient client = new PaymentClient();
            Payment payment = client.get(Long.parseLong(paymentId));

            String status = payment.getStatus();  // approved, rejected, pending, etc.
            String externalRef = payment.getExternalReference();
            boolean approved = "approved".equalsIgnoreCase(status);
            boolean rejected = "rejected".equalsIgnoreCase(status)
                    || "cancelled".equalsIgnoreCase(status);

            log.info("MercadoPago: pago consultado paymentId={} status={} externalReference={}",
                    paymentId, status, externalRef);

            return new PaymentStatus(status, externalRef, approved, rejected);

        } catch (MPApiException e) {
            log.error("MercadoPago fetchPayment API error: status={} body={}", e.getStatusCode(), e.getApiResponse().getContent());
            throw new IllegalStateException("Error consultando pago en Mercado Pago", e);
        } catch (MPException e) {
            log.error("MercadoPago fetchPayment error: {}", e.getMessage());
            throw new IllegalStateException("Error consultando pago en Mercado Pago", e);
        }
    }

    /**
     * Mercado Pago Colombia usa "COP" como currency_id. Si llega "USD" lo aceptamos.
     * Cualquier otra moneda se rechaza.
     */
    private static String normalizeCurrency(String raw) {
        if (raw == null) return "COP";
        return switch (raw.toUpperCase()) {
            case "COP", "USD" -> raw.toUpperCase();
            default -> throw new IllegalArgumentException("Moneda no soportada por MercadoPago Colombia: " + raw);
        };
    }
}
