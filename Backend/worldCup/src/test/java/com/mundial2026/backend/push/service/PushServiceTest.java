package com.mundial2026.backend.push.service;

import com.mundial2026.backend.push.api.dto.PushSubscriptionRequest;
import com.mundial2026.backend.push.domain.PushSubscription;
import com.mundial2026.backend.push.repository.PushSubscriptionRepository;
import com.mundial2026.backend.user.domain.AppUser;
import com.mundial2026.backend.user.repository.AppUserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Tests de gestión de suscripciones push (sin envío real, que requiere navegador).
 */
@ExtendWith(MockitoExtension.class)
class PushServiceTest {

    @Mock PushSubscriptionRepository subscriptionRepository;
    @Mock AppUserRepository userRepository;

    private PushService newService() {
        return new PushService(subscriptionRepository, userRepository,
                "PUBLIC_KEY_DEV", "PRIVATE_KEY_DEV", "mailto:test@test.com");
    }

    @Test
    void getPublicKey_returnsConfiguredKey() {
        assertThat(newService().getPublicKey()).isEqualTo("PUBLIC_KEY_DEV");
    }

    @Test
    void saveSubscription_newEndpoint_createsWithUserAndKeys() {
        AppUser user = new AppUser();
        user.setId(5L);
        when(userRepository.findById(5L)).thenReturn(Optional.of(user));
        when(subscriptionRepository.findByEndpoint("https://push/abc")).thenReturn(Optional.empty());

        var req = new PushSubscriptionRequest("https://push/abc", "p256dh-key", "auth-secret");
        newService().saveSubscription(5L, req);

        ArgumentCaptor<PushSubscription> captor = ArgumentCaptor.forClass(PushSubscription.class);
        verify(subscriptionRepository).save(captor.capture());
        PushSubscription saved = captor.getValue();
        assertThat(saved.getUser()).isSameAs(user);
        assertThat(saved.getEndpoint()).isEqualTo("https://push/abc");
        assertThat(saved.getP256dh()).isEqualTo("p256dh-key");
        assertThat(saved.getAuth()).isEqualTo("auth-secret");
    }

    @Test
    void saveSubscription_existingEndpoint_updatesInPlace() {
        AppUser user = new AppUser();
        user.setId(5L);
        PushSubscription existing = new PushSubscription();
        existing.setId(99L);
        existing.setEndpoint("https://push/abc");

        when(userRepository.findById(5L)).thenReturn(Optional.of(user));
        when(subscriptionRepository.findByEndpoint("https://push/abc")).thenReturn(Optional.of(existing));

        var req = new PushSubscriptionRequest("https://push/abc", "new-p256", "new-auth");
        newService().saveSubscription(5L, req);

        ArgumentCaptor<PushSubscription> captor = ArgumentCaptor.forClass(PushSubscription.class);
        verify(subscriptionRepository).save(captor.capture());
        assertThat(captor.getValue().getId()).isEqualTo(99L);      // misma fila
        assertThat(captor.getValue().getP256dh()).isEqualTo("new-p256");
    }

    @Test
    void saveSubscription_missingUser_throws() {
        when(userRepository.findById(404L)).thenReturn(Optional.empty());
        var req = new PushSubscriptionRequest("https://push/x", "k", "a");

        assertThatThrownBy(() -> newService().saveSubscription(404L, req))
                .isInstanceOf(com.mundial2026.backend.common.exception.ResourceNotFoundException.class);
    }

    @Test
    void deleteSubscription_delegatesToRepo() {
        newService().deleteSubscription("https://push/abc");
        verify(subscriptionRepository).deleteByEndpoint("https://push/abc");
    }
}
