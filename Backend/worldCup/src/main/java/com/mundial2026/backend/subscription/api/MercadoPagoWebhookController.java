package com.mundial2026.backend.subscription.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.mundial2026.backend.subscription.service.MercadoPagoGateway;
import com.mundial2026.backend.subscription.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;

/**
 * Webhook donde Mercado Pago notifica el estado de los pagos.
 *
 * Mercado Pago envía un POST a la URL configurada en la preferencia
 * (campo notification_url o configurada en el dashboard).
 *
 * Payload típico:
 *   {
 *     "action": "payment.created",
 *     "type":   "payment",
 *     "data":   { "id": "1234567890" }
 *   }
 *
 * Headers de seguridad:
 *   x-signature:  HMAC-SHA256 firmado con el secret del webhook
 *   x-request-id: ID único de la request (para idempotencia)
 *
 * Endpoint PÚBLICO — Mercado Pago no tiene JWT, validamos por firma.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/public/payments/mercadopago")
@RequiredArgsConstructor
public class MercadoPagoWebhookController {

    private final MercadoPagoGateway mercadoPagoGateway;
    private final SubscriptionService subscriptionService;

    @Value("${app.payments.mercado-pago.webhook-secret:}")
    private String webhookSecret;

    @PostMapping("/webhook")
    public ResponseEntity<Void> handleWebhook(
            @RequestBody JsonNode body,
            @RequestParam(name = "data.id", required = false) String queryDataId,
            @RequestHeader(name = "x-signature", required = false) String signature,
            @RequestHeader(name = "x-request-id", required = false) String requestId
    ) {
        log.info("Webhook MP recibido requestId={} body={}", requestId, body);

        // 1. Validar firma (solo si hay secret configurado — en mock/dev se puede omitir)
        if (!webhookSecret.isBlank()) {
            String dataId = extractDataId(body, queryDataId);
            if (!isValidSignature(signature, requestId, dataId)) {
                log.warn("Webhook MP con firma inválida — rechazado");
                return ResponseEntity.status(401).build();
            }
        }

        // 2. Procesar solo eventos de tipo "payment"
        String type = body.path("type").asText("");
        if (!"payment".equalsIgnoreCase(type)) {
            log.info("Webhook MP ignorado, type={}", type);
            return ResponseEntity.ok().build();
        }

        // 3. Extraer el paymentId
        String paymentId = body.path("data").path("id").asText(null);
        if (paymentId == null && queryDataId != null) {
            paymentId = queryDataId;
        }
        if (paymentId == null) {
            log.warn("Webhook MP sin paymentId — ignorado");
            return ResponseEntity.ok().build();
        }
        paymentId = paymentId.strip();

        // 4-6. Consultar estado y conciliar suscripción — todo en un solo bloque para
        // garantizar que cualquier excepción inesperada (red, parseo, BD) nunca produzca
        // un 500: MP reintenta hasta 5 veces ante errores, lo que duplicaría activaciones.
        try {
            MercadoPagoGateway.PaymentStatus status = mercadoPagoGateway.fetchPaymentStatus(paymentId);

            String externalRef = status.externalReference();
            if (externalRef == null || externalRef.isBlank()) {
                log.warn("Webhook MP sin externalReference — no se puede conciliar paymentId={}", paymentId);
                return ResponseEntity.ok().build();
            }

            Long subscriptionId = Long.parseLong(externalRef);
            if (status.approved()) {
                subscriptionService.activateById(subscriptionId, paymentId);
                log.info("Suscripción ACTIVADA por webhook MP subscriptionId={} paymentId={}", externalRef, paymentId);
            } else if (status.rejected()) {
                subscriptionService.markFailedById(subscriptionId);
                log.info("Suscripción FALLIDA por webhook MP subscriptionId={} paymentId={}", externalRef, paymentId);
            } else {
                log.info("Webhook MP pago PENDING — sin acción subscriptionId={} status={}", externalRef, status.mpStatus());
            }
        } catch (NumberFormatException nfe) {
            log.warn("Webhook MP — ID inválido (paymentId={} o externalRef no numérico)", paymentId);
        } catch (Exception e) {
            log.error("Webhook MP — error procesando paymentId={}: {}", paymentId, e.getMessage(), e);
        }

        // 7. Siempre devolver 200 a MP para que no reintente
        return ResponseEntity.ok().build();
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private static String extractDataId(JsonNode body, String fallback) {
        String id = body.path("data").path("id").asText(null);
        return (id != null && !id.isBlank()) ? id : fallback;
    }

    /**
     * Verifica la firma según el patrón de Mercado Pago:
     *   x-signature: ts=12345,v1=abc...
     *   manifest = "id:<dataId>;request-id:<requestId>;ts:<ts>;"
     *   esperado = HMAC-SHA256(manifest, webhookSecret)
     *   v1 debe coincidir con esperado.
     */
    private boolean isValidSignature(String signatureHeader, String requestId, String dataId) {
        if (signatureHeader == null || signatureHeader.isBlank()) return false;

        String ts = null;
        String v1 = null;
        for (String part : signatureHeader.split(",")) {
            String[] kv = part.split("=", 2);
            if (kv.length != 2) continue;
            String key = kv[0].trim();
            String value = kv[1].trim();
            if ("ts".equals(key)) ts = value;
            else if ("v1".equals(key)) v1 = value;
        }
        if (ts == null || v1 == null || dataId == null || requestId == null) return false;

        String manifest = "id:" + dataId + ";request-id:" + requestId + ";ts:" + ts + ";";
        String computed = hmacSha256(webhookSecret, manifest);
        return computed.equalsIgnoreCase(v1);
    }

    private static String hmacSha256(String secret, String payload) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return HexFormat.of().formatHex(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException("Error calculando HMAC-SHA256", e);
        }
    }

}
