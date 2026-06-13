package com.mundial2026.backend.subscription.service;

import com.mundial2026.backend.common.exception.BusinessRuleException;
import com.mundial2026.backend.subscription.domain.Subscription;
import com.mundial2026.backend.subscription.domain.SubscriptionStatus;
import com.mundial2026.backend.subscription.repository.SubscriptionRepository;
import com.mundial2026.backend.user.domain.AppUser;
import com.mundial2026.backend.user.domain.RoleEntity;
import com.mundial2026.backend.user.repository.AppUserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Tests de la conciliación anti-fraude de montos en activateById (S1).
 */
@ExtendWith(MockitoExtension.class)
class SubscriptionServiceTest {

    @Mock SubscriptionRepository subscriptionRepository;
    @Mock AppUserRepository userRepository;
    @Mock MercadoPagoGateway mercadoPagoGateway;

    @InjectMocks SubscriptionService subscriptionService;

    private Subscription pendingSub() {
        AppUser user = new AppUser();
        user.setId(7L);
        Subscription sub = new Subscription();
        sub.setUser(user);
        sub.setStatus(SubscriptionStatus.PENDING);
        sub.setAmount(SubscriptionService.MUNDIAL_PASS_PRICE);   // 9.99
        sub.setCurrency(SubscriptionService.MUNDIAL_PASS_CURRENCY); // USD
        return sub;
    }

    @Test
    void activateById_amountMatches_activates() {
        Subscription sub = pendingSub();
        when(subscriptionRepository.findById(1L)).thenReturn(Optional.of(sub));
        when(subscriptionRepository.save(any(Subscription.class))).thenAnswer(inv -> inv.getArgument(0));

        Subscription result = subscriptionService.activateById(
                1L, "pay_123", new BigDecimal("9.99"), "USD");

        assertThat(result.getStatus()).isEqualTo(SubscriptionStatus.ACTIVE);
        assertThat(result.getPaymentId()).isEqualTo("pay_123");
    }

    @Test
    void activateById_underpaid_rejectsAndMarksFailed() {
        Subscription sub = pendingSub();
        when(subscriptionRepository.findById(1L)).thenReturn(Optional.of(sub));
        when(subscriptionRepository.save(any(Subscription.class))).thenAnswer(inv -> inv.getArgument(0));

        // Un atacante pagó solo 1.00 en vez de 9.99
        assertThatThrownBy(() -> subscriptionService.activateById(
                1L, "pay_fraude", new BigDecimal("1.00"), "USD"))
                .isInstanceOf(BusinessRuleException.class);

        assertThat(sub.getStatus()).isEqualTo(SubscriptionStatus.FAILED);
    }

    /**
     * Cuando MP cobra en COP (moneda diferente a USD de la suscripción) se confía
     * en la aprobación de MP y se activa — se saltea la comparación de montos.
     * Cubre el caso real de Bancolombia débito donde MP convierte USD→COP.
     */
    @Test
    void activateById_differentCurrencies_skipsAmountCheck_activates() {
        Subscription sub = pendingSub();   // amount=9.99 USD
        when(subscriptionRepository.findById(1L)).thenReturn(Optional.of(sub));
        when(subscriptionRepository.save(any(Subscription.class))).thenAnswer(inv -> inv.getArgument(0));

        // MP reporta 35009 COP — moneda distinta → se activa sin comparar monto
        Subscription result = subscriptionService.activateById(
                1L, "pay_cop", new BigDecimal("35009"), "COP");

        assertThat(result.getStatus()).isEqualTo(SubscriptionStatus.ACTIVE);
        assertThat(result.getPaymentId()).isEqualTo("pay_cop");
    }

    @Test
    void activateById_noAmount_activates_forMockGateway() {
        Subscription sub = pendingSub();
        when(subscriptionRepository.findById(1L)).thenReturn(Optional.of(sub));
        when(subscriptionRepository.save(any(Subscription.class))).thenAnswer(inv -> inv.getArgument(0));

        // Sobrecarga sin monto (modo mock) → activa sin conciliar
        Subscription result = subscriptionService.activateById(1L, "MOCK_PREF");

        assertThat(result.getStatus()).isEqualTo(SubscriptionStatus.ACTIVE);
    }

    // ─── Premium permanente para ADMIN ──────────────────────────────────────────

    private AppUser userWithRole(String roleCode) {
        AppUser u = new AppUser();
        RoleEntity role = new RoleEntity();
        role.setCode(roleCode);
        u.getRoles().add(role);
        return u;
    }

    @Test
    void isPremium_adminUser_isAlwaysPremium_withoutSubscription() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(userWithRole("ADMIN")));

        assertThat(subscriptionService.isPremium(2L)).isTrue();
        // Para un admin ni siquiera se consulta la tabla de suscripciones
        verify(subscriptionRepository, never()).findActiveByUserId(any(), any());
    }

    @Test
    void isPremium_normalUser_withoutSubscription_isNotPremium() {
        when(userRepository.findById(3L)).thenReturn(Optional.of(userWithRole("USER")));
        when(subscriptionRepository.findActiveByUserId(eq(3L), any())).thenReturn(Optional.empty());

        assertThat(subscriptionService.isPremium(3L)).isFalse();
    }

    @Test
    void isPremium_normalUser_withActiveSubscription_isPremium() {
        when(userRepository.findById(4L)).thenReturn(Optional.of(userWithRole("USER")));
        when(subscriptionRepository.findActiveByUserId(eq(4L), any()))
                .thenReturn(Optional.of(new Subscription()));

        assertThat(subscriptionService.isPremium(4L)).isTrue();
    }

    @Test
    void activateById_alreadyActive_isIdempotent() {
        Subscription sub = pendingSub();
        sub.setStatus(SubscriptionStatus.ACTIVE);
        when(subscriptionRepository.findById(1L)).thenReturn(Optional.of(sub));

        Subscription result = subscriptionService.activateById(
                1L, "pay_dup", new BigDecimal("1.00"), "USD");

        // Ya estaba activa: no se toca ni se valida monto, no se persiste de nuevo
        assertThat(result.getStatus()).isEqualTo(SubscriptionStatus.ACTIVE);
        verify(subscriptionRepository, never()).save(any(Subscription.class));
    }

    // ─── Reembolso (requestRefund) ───────────────────────────────────────────

    private Subscription activeSub(OffsetDateTime startedAt, String paymentId) {
        AppUser user = new AppUser();
        user.setId(7L);
        Subscription sub = new Subscription();
        sub.setUser(user);
        sub.setStatus(SubscriptionStatus.ACTIVE);
        sub.setStartedAt(startedAt);
        sub.setPaymentId(paymentId);
        return sub;
    }

    @Test
    void requestRefund_within24h_refundsAndMarksRefunded() {
        Subscription sub = activeSub(OffsetDateTime.now().minusHours(2), "123456");
        when(subscriptionRepository.findFirstByUserIdAndStatus(7L, SubscriptionStatus.REFUNDED))
                .thenReturn(Optional.empty());
        when(subscriptionRepository.findActiveByUserId(eq(7L), any())).thenReturn(Optional.of(sub));
        when(subscriptionRepository.save(any(Subscription.class))).thenAnswer(inv -> inv.getArgument(0));

        subscriptionService.requestRefund(7L);

        verify(mercadoPagoGateway).refund("123456");
        assertThat(sub.getStatus()).isEqualTo(SubscriptionStatus.REFUNDED);
        assertThat(sub.getRefundedAt()).isNotNull();
    }

    @Test
    void requestRefund_windowExpired_rejectsWithoutCallingGateway() {
        Subscription sub = activeSub(OffsetDateTime.now().minusHours(30), "123456");
        when(subscriptionRepository.findFirstByUserIdAndStatus(7L, SubscriptionStatus.REFUNDED))
                .thenReturn(Optional.empty());
        when(subscriptionRepository.findActiveByUserId(eq(7L), any())).thenReturn(Optional.of(sub));

        assertThatThrownBy(() -> subscriptionService.requestRefund(7L))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("24 horas");

        verify(mercadoPagoGateway, never()).refund(any());
        assertThat(sub.getStatus()).isEqualTo(SubscriptionStatus.ACTIVE);
    }

    @Test
    void requestRefund_justOver24h_rejects() {
        // La ventana es de 24h exactas: a las 24h30m ya no aplica
        // (antes toHours() > 24 aceptaba hasta 24h59m)
        Subscription sub = activeSub(OffsetDateTime.now().minusHours(24).minusMinutes(30), "123456");
        when(subscriptionRepository.findFirstByUserIdAndStatus(7L, SubscriptionStatus.REFUNDED))
                .thenReturn(Optional.empty());
        when(subscriptionRepository.findActiveByUserId(eq(7L), any())).thenReturn(Optional.of(sub));

        assertThatThrownBy(() -> subscriptionService.requestRefund(7L))
                .isInstanceOf(BusinessRuleException.class);

        verify(mercadoPagoGateway, never()).refund(any());
    }

    @Test
    void requestRefund_alreadyRefundedOnce_rejects() {
        when(subscriptionRepository.findFirstByUserIdAndStatus(7L, SubscriptionStatus.REFUNDED))
                .thenReturn(Optional.of(new Subscription()));

        assertThatThrownBy(() -> subscriptionService.requestRefund(7L))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("un reembolso por cuenta");

        verify(mercadoPagoGateway, never()).refund(any());
    }

    @Test
    void requestRefund_noActiveSubscription_rejects() {
        when(subscriptionRepository.findFirstByUserIdAndStatus(7L, SubscriptionStatus.REFUNDED))
                .thenReturn(Optional.empty());
        when(subscriptionRepository.findActiveByUserId(eq(7L), any())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> subscriptionService.requestRefund(7L))
                .isInstanceOf(BusinessRuleException.class);

        verify(mercadoPagoGateway, never()).refund(any());
    }

    @Test
    void requestRefund_missingPaymentId_rejects() {
        Subscription sub = activeSub(OffsetDateTime.now().minusHours(1), null);
        when(subscriptionRepository.findFirstByUserIdAndStatus(7L, SubscriptionStatus.REFUNDED))
                .thenReturn(Optional.empty());
        when(subscriptionRepository.findActiveByUserId(eq(7L), any())).thenReturn(Optional.of(sub));

        assertThatThrownBy(() -> subscriptionService.requestRefund(7L))
                .isInstanceOf(BusinessRuleException.class);

        verify(mercadoPagoGateway, never()).refund(any());
    }

    @Test
    void requestRefund_gatewayFails_subscriptionStaysActive() {
        Subscription sub = activeSub(OffsetDateTime.now().minusHours(1), "123456");
        when(subscriptionRepository.findFirstByUserIdAndStatus(7L, SubscriptionStatus.REFUNDED))
                .thenReturn(Optional.empty());
        when(subscriptionRepository.findActiveByUserId(eq(7L), any())).thenReturn(Optional.of(sub));
        doThrow(new IllegalStateException("MP caído")).when(mercadoPagoGateway).refund("123456");

        assertThatThrownBy(() -> subscriptionService.requestRefund(7L))
                .isInstanceOf(BusinessRuleException.class);

        // Si MP falla, la suscripción NO debe quedar marcada REFUNDED
        assertThat(sub.getStatus()).isEqualTo(SubscriptionStatus.ACTIVE);
        verify(subscriptionRepository, never()).save(any(Subscription.class));
    }

    // ─── reconcilePendingForUser (conciliación en login/refresh) ─────────────────

    private Subscription pendingSubWithProvider(Long userId, String preferenceId) {
        AppUser user = new AppUser();
        user.setId(userId);
        Subscription sub = new Subscription();
        sub.setId(10L);
        sub.setUser(user);
        sub.setStatus(SubscriptionStatus.PENDING);
        sub.setAmount(SubscriptionService.MUNDIAL_PASS_PRICE);
        sub.setCurrency(SubscriptionService.MUNDIAL_PASS_CURRENCY);
        sub.setProviderOrderId(preferenceId);
        return sub;
    }

    @Test
    void reconcilePendingForUser_alreadyPremium_skipsEverything() {
        // Si ya es premium no se hace ninguna consulta a MP
        when(userRepository.findById(5L)).thenReturn(Optional.of(userWithRole("USER")));
        when(subscriptionRepository.findActiveByUserId(eq(5L), any()))
                .thenReturn(Optional.of(new Subscription()));

        subscriptionService.reconcilePendingForUser(5L);

        verify(subscriptionRepository, never()).findFirstByUserIdAndStatus(any(), any());
        verify(mercadoPagoGateway, never()).fetchApprovedPaymentByPreferenceId(any());
    }

    @Test
    void reconcilePendingForUser_noPendingSubscription_doesNothing() {
        when(userRepository.findById(5L)).thenReturn(Optional.of(userWithRole("USER")));
        when(subscriptionRepository.findActiveByUserId(eq(5L), any())).thenReturn(Optional.empty());
        when(subscriptionRepository.findFirstByUserIdAndStatus(5L, SubscriptionStatus.PENDING))
                .thenReturn(Optional.empty());

        subscriptionService.reconcilePendingForUser(5L);

        verify(mercadoPagoGateway, never()).fetchApprovedPaymentByPreferenceId(any());
    }

    @Test
    void reconcilePendingForUser_pendingWithoutProviderOrderId_doesNothing() {
        Subscription sub = pendingSubWithProvider(5L, null); // sin preferenceId
        when(userRepository.findById(5L)).thenReturn(Optional.of(userWithRole("USER")));
        when(subscriptionRepository.findActiveByUserId(eq(5L), any())).thenReturn(Optional.empty());
        when(subscriptionRepository.findFirstByUserIdAndStatus(5L, SubscriptionStatus.PENDING))
                .thenReturn(Optional.of(sub));

        subscriptionService.reconcilePendingForUser(5L);

        verify(mercadoPagoGateway, never()).fetchApprovedPaymentByPreferenceId(any());
    }

    @Test
    void reconcilePendingForUser_mpApprovedPayment_activatesSubscription() {
        Subscription sub = pendingSubWithProvider(5L, "PREF_ABC123");
        when(userRepository.findById(5L)).thenReturn(Optional.of(userWithRole("USER")));
        when(subscriptionRepository.findActiveByUserId(eq(5L), any())).thenReturn(Optional.empty());
        when(subscriptionRepository.findFirstByUserIdAndStatus(5L, SubscriptionStatus.PENDING))
                .thenReturn(Optional.of(sub));
        when(subscriptionRepository.findById(10L)).thenReturn(Optional.of(sub));
        when(subscriptionRepository.save(any(Subscription.class))).thenAnswer(inv -> inv.getArgument(0));

        MercadoPagoGateway.PaymentStatus approved = new MercadoPagoGateway.PaymentStatus(
                "approved", "pay_789",
                true, false,
                SubscriptionService.MUNDIAL_PASS_PRICE,
                SubscriptionService.MUNDIAL_PASS_CURRENCY
        );
        when(mercadoPagoGateway.fetchApprovedPaymentByPreferenceId("PREF_ABC123"))
                .thenReturn(Optional.of(approved));

        subscriptionService.reconcilePendingForUser(5L);

        assertThat(sub.getStatus()).isEqualTo(SubscriptionStatus.ACTIVE);
        assertThat(sub.getPaymentId()).isEqualTo("pay_789");
    }

    @Test
    void reconcilePendingForUser_mpNoApprovedPayment_staysPending() {
        Subscription sub = pendingSubWithProvider(5L, "PREF_ABC123");
        when(userRepository.findById(5L)).thenReturn(Optional.of(userWithRole("USER")));
        when(subscriptionRepository.findActiveByUserId(eq(5L), any())).thenReturn(Optional.empty());
        when(subscriptionRepository.findFirstByUserIdAndStatus(5L, SubscriptionStatus.PENDING))
                .thenReturn(Optional.of(sub));
        when(mercadoPagoGateway.fetchApprovedPaymentByPreferenceId("PREF_ABC123"))
                .thenReturn(Optional.empty());

        subscriptionService.reconcilePendingForUser(5L);

        assertThat(sub.getStatus()).isEqualTo(SubscriptionStatus.PENDING);
        verify(subscriptionRepository, never()).save(any(Subscription.class));
    }

    @Test
    void reconcilePendingForUser_mpThrows_doesNotBubbleException() {
        Subscription sub = pendingSubWithProvider(5L, "PREF_ERR");
        when(userRepository.findById(5L)).thenReturn(Optional.of(userWithRole("USER")));
        when(subscriptionRepository.findActiveByUserId(eq(5L), any())).thenReturn(Optional.empty());
        when(subscriptionRepository.findFirstByUserIdAndStatus(5L, SubscriptionStatus.PENDING))
                .thenReturn(Optional.of(sub));
        when(mercadoPagoGateway.fetchApprovedPaymentByPreferenceId("PREF_ERR"))
                .thenThrow(new RuntimeException("timeout MP"));

        // El error de MP no debe romper el login del usuario
        subscriptionService.reconcilePendingForUser(5L);

        assertThat(sub.getStatus()).isEqualTo(SubscriptionStatus.PENDING);
    }
}
