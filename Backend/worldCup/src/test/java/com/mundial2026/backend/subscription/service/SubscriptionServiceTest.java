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
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
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

    @Test
    void activateById_wrongCurrency_rejects() {
        Subscription sub = pendingSub();
        when(subscriptionRepository.findById(1L)).thenReturn(Optional.of(sub));
        when(subscriptionRepository.save(any(Subscription.class))).thenAnswer(inv -> inv.getArgument(0));

        assertThatThrownBy(() -> subscriptionService.activateById(
                1L, "pay_x", new BigDecimal("9.99"), "ARS"))
                .isInstanceOf(BusinessRuleException.class);

        assertThat(sub.getStatus()).isEqualTo(SubscriptionStatus.FAILED);
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
}
