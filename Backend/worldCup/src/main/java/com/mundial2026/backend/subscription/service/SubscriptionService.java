package com.mundial2026.backend.subscription.service;

import com.mundial2026.backend.common.exception.BusinessRuleException;
import com.mundial2026.backend.subscription.domain.PaymentProvider;
import com.mundial2026.backend.subscription.domain.Subscription;
import com.mundial2026.backend.subscription.domain.SubscriptionStatus;
import com.mundial2026.backend.subscription.repository.SubscriptionRepository;
import com.mundial2026.backend.user.domain.AppUser;
import com.mundial2026.backend.user.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.Optional;

/**
 * Servicio que centraliza la lógica de suscripciones Premium.
 *
 * Reglas de negocio:
 *   - Una suscripción nace en PENDING (al crear la orden de pago).
 *   - Pasa a ACTIVE cuando llega el webhook del proveedor confirmando pago.
 *   - Pasa a EXPIRED automáticamente al consultar (lazy) si expires_at < NOW().
 *   - Solo puede haber UNA suscripción ACTIVE por usuario (constraint en BD).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final AppUserRepository userRepository;
    private final MercadoPagoGateway mercadoPagoGateway;

    /**
     * Plan único actualmente disponible: Pase Mundial 2026.
     * Cobramos en USD pero el usuario ve $20.000 COP en la UI.
     */
    public static final String PLAN_MUNDIAL_PASS = "MUNDIAL_PASS_2026";

    /** Fecha de expiración del Pase Mundial (fin del torneo + buffer). */
    private static final OffsetDateTime MUNDIAL_PASS_EXPIRES_AT =
            OffsetDateTime.parse("2026-07-19T23:59:59-05:00");

    // ─── Lectura ──────────────────────────────────────────────────────────────

    /**
     * ¿El usuario es Premium AHORA?
     * Esta es la consulta clave que se invoca desde el JWT/login y desde gates.
     */
    @Transactional(readOnly = true)
    public boolean isPremium(Long userId) {
        return subscriptionRepository
                .findActiveByUserId(userId, OffsetDateTime.now())
                .isPresent();
    }

    /**
     * Devuelve la suscripción ACTIVE del usuario si existe.
     */
    @Transactional(readOnly = true)
    public Optional<Subscription> findActive(Long userId) {
        return subscriptionRepository.findActiveByUserId(userId, OffsetDateTime.now());
    }

    // ─── Escritura ────────────────────────────────────────────────────────────

    /**
     * Crea una suscripción en estado PENDING al iniciar el checkout.
     * Devuelve la suscripción persistida para que el caller pueda asociarla
     * con la orden creada en el proveedor (Mercado Pago, etc.).
     */
    @Transactional
    public Subscription createPending(
            Long userId,
            PaymentProvider provider,
            BigDecimal amount,
            String currency
    ) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado: " + userId));

        // Si ya hay una ACTIVE vigente, no permitimos crear otra (evita doble cobro)
        if (isPremium(userId)) {
            throw new BusinessRuleException("El usuario ya tiene una suscripción Premium activa.");
        }

        Subscription sub = new Subscription();
        sub.setUser(user);
        sub.setPlan(PLAN_MUNDIAL_PASS);
        sub.setStatus(SubscriptionStatus.PENDING);
        sub.setPaymentProvider(provider);
        sub.setAmount(amount);
        sub.setCurrency(currency);

        Subscription saved = subscriptionRepository.save(sub);
        log.info("Suscripción PENDING creada id={} userId={} provider={}", saved.getId(), userId, provider);
        return saved;
    }

    /**
     * Asocia el ID de orden devuelto por el proveedor a una suscripción PENDING.
     * Se llama justo después de crear la orden en el proveedor.
     */
    @Transactional
    public void attachProviderOrderId(Long subscriptionId, String providerOrderId) {
        Subscription sub = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new IllegalArgumentException("Suscripción no encontrada: " + subscriptionId));
        sub.setProviderOrderId(providerOrderId);
        subscriptionRepository.save(sub);
    }

    /**
     * Activa una suscripción al recibir el webhook de pago exitoso del proveedor.
     * Idempotente: si ya está ACTIVE, no hace nada.
     */
    @Transactional
    public Subscription activate(PaymentProvider provider, String providerOrderId) {
        Subscription sub = subscriptionRepository
                .findByPaymentProviderAndProviderOrderId(provider, providerOrderId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No existe suscripción para " + provider + " / " + providerOrderId));

        if (sub.getStatus() == SubscriptionStatus.ACTIVE) {
            log.info("Suscripción ya ACTIVA, ignorando webhook duplicado id={}", sub.getId());
            return sub;
        }

        sub.setStatus(SubscriptionStatus.ACTIVE);
        sub.setStartedAt(OffsetDateTime.now());
        sub.setExpiresAt(MUNDIAL_PASS_EXPIRES_AT);

        Subscription saved = subscriptionRepository.save(sub);
        log.info("Suscripción ACTIVADA id={} userId={} expiresAt={}",
                saved.getId(), saved.getUser().getId(), saved.getExpiresAt());
        return saved;
    }

    /**
     * Activa una suscripción identificada por su propio ID (no por providerOrderId).
     * Útil cuando el proveedor (Mercado Pago) devuelve nuestro `external_reference`
     * que justamente es el `subscriptionId`.
     */
    @Transactional
    public Subscription activateById(Long subscriptionId, String paymentId) {
        Subscription sub = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new IllegalArgumentException("Suscripción no encontrada: " + subscriptionId));

        if (sub.getStatus() == SubscriptionStatus.ACTIVE) {
            log.info("Suscripción ya ACTIVA, ignorando duplicado id={}", sub.getId());
            return sub;
        }

        sub.setStatus(SubscriptionStatus.ACTIVE);
        sub.setStartedAt(OffsetDateTime.now());
        sub.setExpiresAt(MUNDIAL_PASS_EXPIRES_AT);
        sub.setPaymentId(paymentId);

        Subscription saved = subscriptionRepository.save(sub);
        log.info("Suscripción ACTIVADA por ID id={} userId={} paymentId={} expiresAt={}",
                saved.getId(), saved.getUser().getId(), paymentId, saved.getExpiresAt());
        return saved;
    }

    /**
     * Marca como FAILED una suscripción por su ID directo.
     */
    @Transactional
    public void markFailedById(Long subscriptionId) {
        subscriptionRepository.findById(subscriptionId).ifPresent(sub -> {
            sub.setStatus(SubscriptionStatus.FAILED);
            subscriptionRepository.save(sub);
            log.info("Suscripción marcada FAILED por ID id={}", sub.getId());
        });
    }

    /**
     * Marca una suscripción como FAILED al recibir webhook de fallo.
     */
    @Transactional
    public void markFailed(PaymentProvider provider, String providerOrderId) {
        subscriptionRepository
                .findByPaymentProviderAndProviderOrderId(provider, providerOrderId)
                .ifPresent(sub -> {
                    sub.setStatus(SubscriptionStatus.FAILED);
                    subscriptionRepository.save(sub);
                    log.info("Suscripción marcada FAILED id={}", sub.getId());
                });
    }

    /**
     * Cancela una suscripción ACTIVE a petición del usuario.
     * No reembolsa — solo marca como CANCELLED y deja expirar.
     */
    @Transactional
    public void cancel(Long userId) {
        subscriptionRepository
                .findActiveByUserId(userId, OffsetDateTime.now())
                .ifPresent(sub -> {
                    sub.setStatus(SubscriptionStatus.CANCELLED);
                    sub.setCancelledAt(OffsetDateTime.now());
                    subscriptionRepository.save(sub);
                    log.info("Suscripción CANCELADA id={} userId={}", sub.getId(), userId);
                });
    }

    /**
     * Solicita el reembolso de la suscripción activa del usuario.
     * Reglas:
     *   - El usuario debe tener una suscripción ACTIVE.
     *   - El pago debe haberse confirmado hace menos de 24 horas (started_at).
     *   - Debe existir un payment_id numérico almacenado (solo disponible en pagos reales).
     * Si las condiciones se cumplen, llama a MP para reembolsar y marca la suscripción REFUNDED.
     */
    @Transactional
    public void requestRefund(Long userId) {
        if (subscriptionRepository.findFirstByUserIdAndStatus(userId, SubscriptionStatus.REFUNDED).isPresent()) {
            throw new BusinessRuleException("Solo se permite un reembolso por cuenta.");
        }

        Subscription sub = subscriptionRepository
                .findActiveByUserId(userId, OffsetDateTime.now())
                .orElseThrow(() -> {
                    boolean yaReembolsada = subscriptionRepository
                            .findFirstByUserIdAndStatus(userId, SubscriptionStatus.REFUNDED)
                            .isPresent();
                    return new BusinessRuleException(yaReembolsada
                            ? "Esta suscripción ya fue reembolsada."
                            : "No tienes una suscripción Premium activa para reembolsar.");
                });

        if (sub.getStartedAt() == null) {
            throw new BusinessRuleException("La suscripción no tiene fecha de activación registrada.");
        }

        long horasDesdeActivacion = Duration.between(sub.getStartedAt(), OffsetDateTime.now()).toHours();
        if (horasDesdeActivacion > 24) {
            throw new BusinessRuleException(
                    "El período de reembolso de 24 horas ya expiró. La suscripción fue activada hace "
                    + horasDesdeActivacion + " horas.");
        }

        if (sub.getPaymentId() == null || sub.getPaymentId().isBlank()) {
            throw new BusinessRuleException("No se encontró el ID de pago necesario para procesar el reembolso.");
        }

        try {
            mercadoPagoGateway.refund(sub.getPaymentId());
        } catch (IllegalArgumentException | IllegalStateException e) {
            throw new BusinessRuleException("No se pudo procesar el reembolso: " + e.getMessage());
        }

        sub.setStatus(SubscriptionStatus.REFUNDED);
        sub.setRefundedAt(OffsetDateTime.now());
        subscriptionRepository.save(sub);

        log.info("Suscripción REEMBOLSADA id={} userId={} paymentId={}", sub.getId(), userId, sub.getPaymentId());
    }
}
