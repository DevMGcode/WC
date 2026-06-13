package com.mundial2026.backend.subscription.service;

import com.mundial2026.backend.subscription.domain.Subscription;
import com.mundial2026.backend.subscription.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * Reconcilia suscripciones PENDING contra Mercado Pago.
 *
 * Cubre el caso en que MP aprobó el pago pero el webhook nunca llegó
 * (frecuente con débito Bancolombia y otros bancos colombianos).
 *
 * Cada hora busca suscripciones PENDING con más de 5 minutos de vida
 * y consulta a MP si existe un pago aprobado para esa preferencia.
 * Si lo hay → activa la suscripción. Si fue rechazado → marca FAILED.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SubscriptionReconciliationJob {

    private final SubscriptionRepository subscriptionRepository;
    private final MercadoPagoGateway     mercadoPagoGateway;
    private final SubscriptionService    subscriptionService;

    @Scheduled(fixedDelay = 15 * 60 * 1_000, initialDelay = 5 * 60 * 1_000)
    public void reconcile() {
        OffsetDateTime cutoff = OffsetDateTime.now().minusMinutes(5);
        List<Subscription> pending = subscriptionRepository.findPendingMercadoPagoOlderThan(cutoff);

        if (pending.isEmpty()) return;

        log.info("[Reconciliación] Verificando {} suscripciones PENDING con MP", pending.size());

        for (Subscription sub : pending) {
            try {
                mercadoPagoGateway
                        .fetchApprovedPaymentByExternalRef(String.valueOf(sub.getId()))
                        .ifPresentOrElse(
                                status -> {
                                    subscriptionService.activateById(
                                            sub.getId(),
                                            status.externalReference(),
                                            status.transactionAmount(),
                                            status.currency()
                                    );
                                    log.info("[Reconciliación] Suscripción {} activada — pago aprobado en MP", sub.getId());
                                },
                                () -> log.info("[Reconciliación] Suscripción {} sin pago aprobado en MP — sigue PENDING", sub.getId())
                        );
            } catch (Exception e) {
                log.warn("[Reconciliación] Error procesando suscripción {}: {}", sub.getId(), e.getMessage());
            }
        }
    }
}
