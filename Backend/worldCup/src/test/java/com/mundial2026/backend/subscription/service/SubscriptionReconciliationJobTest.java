package com.mundial2026.backend.subscription.service;

import com.mundial2026.backend.subscription.domain.PaymentProvider;
import com.mundial2026.backend.subscription.domain.Subscription;
import com.mundial2026.backend.subscription.domain.SubscriptionStatus;
import com.mundial2026.backend.subscription.repository.SubscriptionRepository;
import com.mundial2026.backend.user.domain.AppUser;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Tests del job de reconciliación que corre cada 15 minutos buscando
 * suscripciones PENDING con pago aprobado en MP que no llegó por webhook.
 */
@ExtendWith(MockitoExtension.class)
class SubscriptionReconciliationJobTest {

    @Mock SubscriptionRepository subscriptionRepository;
    @Mock MercadoPagoGateway mercadoPagoGateway;
    @Mock SubscriptionService subscriptionService;

    @InjectMocks SubscriptionReconciliationJob reconciliationJob;

    private Subscription pendingSub(Long id, String preferenceId) {
        AppUser user = new AppUser();
        user.setId(1L);
        Subscription sub = new Subscription();
        sub.setId(id);
        sub.setUser(user);
        sub.setStatus(SubscriptionStatus.PENDING);
        sub.setPaymentProvider(PaymentProvider.MERCADO_PAGO);
        sub.setProviderOrderId(preferenceId);
        sub.setAmount(SubscriptionService.MUNDIAL_PASS_PRICE);
        sub.setCurrency(SubscriptionService.MUNDIAL_PASS_CURRENCY);
        return sub;
    }

    private MercadoPagoGateway.PaymentStatus approvedStatus(String preferenceId) {
        return new MercadoPagoGateway.PaymentStatus(
                "approved", preferenceId,
                true, false,
                SubscriptionService.MUNDIAL_PASS_PRICE,
                SubscriptionService.MUNDIAL_PASS_CURRENCY
        );
    }

    @Test
    void reconcile_noPendingSubscriptions_doesNothing() {
        when(subscriptionRepository.findPendingMercadoPagoOlderThan(any()))
                .thenReturn(List.of());

        reconciliationJob.reconcile();

        verify(mercadoPagoGateway, never()).fetchApprovedPaymentByPreferenceId(any());
        verify(subscriptionService, never()).activateById(any(), any(), any(), any());
    }

    @Test
    void reconcile_mpApprovedPayment_activatesSubscription() {
        Subscription sub = pendingSub(5L, "PREF_ABC");
        when(subscriptionRepository.findPendingMercadoPagoOlderThan(any()))
                .thenReturn(List.of(sub));
        when(mercadoPagoGateway.fetchApprovedPaymentByPreferenceId("PREF_ABC"))
                .thenReturn(Optional.of(approvedStatus("PREF_ABC")));

        reconciliationJob.reconcile();

        verify(subscriptionService).activateById(
                eq(5L),
                eq("PREF_ABC"),
                eq(SubscriptionService.MUNDIAL_PASS_PRICE),
                eq(SubscriptionService.MUNDIAL_PASS_CURRENCY)
        );
    }

    @Test
    void reconcile_mpNoApprovedPayment_keepsSubscriptionPending() {
        Subscription sub = pendingSub(5L, "PREF_ABC");
        when(subscriptionRepository.findPendingMercadoPagoOlderThan(any()))
                .thenReturn(List.of(sub));
        when(mercadoPagoGateway.fetchApprovedPaymentByPreferenceId("PREF_ABC"))
                .thenReturn(Optional.empty());

        reconciliationJob.reconcile();

        verify(subscriptionService, never()).activateById(any(), any(), any(), any());
    }

    @Test
    void reconcile_errorOnOneSub_continuesProcessingOthers() {
        Subscription sub1 = pendingSub(10L, "PREF_FAIL");
        Subscription sub2 = pendingSub(11L, "PREF_OK");
        when(subscriptionRepository.findPendingMercadoPagoOlderThan(any()))
                .thenReturn(List.of(sub1, sub2));

        // sub1 lanza excepción en MP
        when(mercadoPagoGateway.fetchApprovedPaymentByPreferenceId("PREF_FAIL"))
                .thenThrow(new RuntimeException("timeout"));
        // sub2 tiene pago aprobado
        when(mercadoPagoGateway.fetchApprovedPaymentByPreferenceId("PREF_OK"))
                .thenReturn(Optional.of(approvedStatus("PREF_OK")));

        // No debe lanzar excepción aunque falle sub1
        reconciliationJob.reconcile();

        // sub2 igual se procesa
        verify(subscriptionService).activateById(eq(11L), any(), any(), any());
    }

    @Test
    void reconcile_multipleApproved_activatesAll() {
        Subscription sub1 = pendingSub(20L, "PREF_1");
        Subscription sub2 = pendingSub(21L, "PREF_2");
        when(subscriptionRepository.findPendingMercadoPagoOlderThan(any()))
                .thenReturn(List.of(sub1, sub2));
        when(mercadoPagoGateway.fetchApprovedPaymentByPreferenceId("PREF_1"))
                .thenReturn(Optional.of(approvedStatus("PREF_1")));
        when(mercadoPagoGateway.fetchApprovedPaymentByPreferenceId("PREF_2"))
                .thenReturn(Optional.of(approvedStatus("PREF_2")));

        reconciliationJob.reconcile();

        verify(subscriptionService).activateById(eq(20L), any(), any(), any());
        verify(subscriptionService).activateById(eq(21L), any(), any(), any());
    }
}
