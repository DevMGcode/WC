package com.mundial2026.backend.subscription.repository;

import com.mundial2026.backend.subscription.domain.PaymentProvider;
import com.mundial2026.backend.subscription.domain.Subscription;
import com.mundial2026.backend.subscription.domain.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    /**
     * Suscripción ACTIVE y vigente (expires_at > now) del usuario, si existe.
     * Es la consulta clave para saber si un usuario es Premium en este momento.
     */
    @Query("""
           SELECT s FROM Subscription s
           WHERE s.user.id = :userId
             AND s.status = com.mundial2026.backend.subscription.domain.SubscriptionStatus.ACTIVE
             AND s.expiresAt > :now
           """)
    Optional<Subscription> findActiveByUserId(@Param("userId") Long userId, @Param("now") OffsetDateTime now);

    /**
     * Historial completo de suscripciones del usuario (todas, ordenadas por más reciente).
     */
    List<Subscription> findByUserIdOrderByCreatedAtDesc(Long userId);

    /**
     * Localiza la suscripción asociada a una orden del proveedor.
     * Se usa al procesar webhooks del proveedor de pago.
     */
    Optional<Subscription> findByPaymentProviderAndProviderOrderId(
            PaymentProvider paymentProvider,
            String providerOrderId
    );

    /**
     * ¿El usuario tiene alguna suscripción en estado PENDING?
     * Se usa para evitar crear órdenes duplicadas mientras una está en curso.
     */
    Optional<Subscription> findFirstByUserIdAndStatus(Long userId, SubscriptionStatus status);

    /**
     * Todas las suscripciones PENDING de Mercado Pago creadas antes de una fecha dada.
     * El job de reconciliación las consulta con MP para activarlas si el pago fue aprobado.
     */
    @Query("""
           SELECT s FROM Subscription s
           WHERE s.status = com.mundial2026.backend.subscription.domain.SubscriptionStatus.PENDING
             AND s.paymentProvider = com.mundial2026.backend.subscription.domain.PaymentProvider.MERCADO_PAGO
             AND s.providerOrderId IS NOT NULL
             AND s.createdAt < :before
           """)
    List<Subscription> findPendingMercadoPagoOlderThan(@Param("before") OffsetDateTime before);
}
