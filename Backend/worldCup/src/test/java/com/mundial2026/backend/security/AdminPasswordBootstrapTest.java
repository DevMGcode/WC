package com.mundial2026.backend.security;

import com.mundial2026.backend.user.domain.AppUser;
import com.mundial2026.backend.user.repository.AppUserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminPasswordBootstrapTest {

    private static final String DEFAULT_HASH =
            "$2a$10$KeuXSTa8G3VNsAnXoXs9Ze9APPmqiEs/a3YuF//YJ7MFJjn87y.rK";

    @Mock AppUserRepository appUserRepository;
    @Mock PasswordEncoder passwordEncoder;

    @InjectMocks AdminPasswordBootstrap bootstrap;

    private AppUser adminWithHash(String hash) {
        AppUser admin = new AppUser();
        admin.setEmail("admin@example.com");
        admin.setPasswordHash(hash);
        return admin;
    }

    @Test
    void run_resetsPassword_whenInitialPasswordProvided() {
        AppUser admin = adminWithHash(DEFAULT_HASH);
        when(appUserRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(admin));
        when(passwordEncoder.matches("nuevo-fuerte", DEFAULT_HASH)).thenReturn(false);
        when(passwordEncoder.encode("nuevo-fuerte")).thenReturn("$2a$10$NEWHASH");
        ReflectionTestUtils.setField(bootstrap, "adminInitialPassword", "nuevo-fuerte");
        ReflectionTestUtils.setField(bootstrap, "failOnDefaultAdmin", false);

        bootstrap.run();

        assertThat(admin.getPasswordHash()).isEqualTo("$2a$10$NEWHASH");
        verify(appUserRepository).save(admin);
    }

    @Test
    void run_throws_whenDefaultHashAndFailFlagOn() {
        AppUser admin = adminWithHash(DEFAULT_HASH);
        when(appUserRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(admin));
        ReflectionTestUtils.setField(bootstrap, "adminInitialPassword", "");
        ReflectionTestUtils.setField(bootstrap, "failOnDefaultAdmin", true);

        assertThatThrownBy(() -> bootstrap.run())
                .isInstanceOf(IllegalStateException.class);
        verify(appUserRepository, never()).save(any());
    }

    @Test
    void run_onlyWarns_whenDefaultHashAndFailFlagOff() {
        AppUser admin = adminWithHash(DEFAULT_HASH);
        when(appUserRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(admin));
        ReflectionTestUtils.setField(bootstrap, "adminInitialPassword", "");
        ReflectionTestUtils.setField(bootstrap, "failOnDefaultAdmin", false);

        bootstrap.run(); // no lanza
        verify(appUserRepository, never()).save(any());
    }

    @Test
    void run_doesNothing_whenPasswordAlreadyMatchesConfigured() {
        AppUser admin = adminWithHash("$2a$10$HASH_DEL_CONFIGURADO");
        when(appUserRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(admin));
        when(passwordEncoder.matches("x", "$2a$10$HASH_DEL_CONFIGURADO")).thenReturn(true);
        ReflectionTestUtils.setField(bootstrap, "adminInitialPassword", "x");
        ReflectionTestUtils.setField(bootstrap, "failOnDefaultAdmin", true);

        bootstrap.run(); // ya coincide: no lanza ni re-hashea
        verify(appUserRepository, never()).save(any());
    }

    @Test
    void run_enforcesConfiguredPassword_evenIfChangedByOtherMeans() {
        // La variable es la fuente de verdad: si alguien cambió el password del
        // admin por otro medio, el arranque lo restaura al valor configurado.
        AppUser admin = adminWithHash("$2a$10$CAMBIADO_A_MANO");
        when(appUserRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(admin));
        when(passwordEncoder.matches("x", "$2a$10$CAMBIADO_A_MANO")).thenReturn(false);
        when(passwordEncoder.encode("x")).thenReturn("$2a$10$RESTAURADO");
        ReflectionTestUtils.setField(bootstrap, "adminInitialPassword", "x");
        ReflectionTestUtils.setField(bootstrap, "failOnDefaultAdmin", true);

        bootstrap.run();

        assertThat(admin.getPasswordHash()).isEqualTo("$2a$10$RESTAURADO");
        verify(appUserRepository).save(admin);
    }

    @Test
    void run_doesNothing_whenNoPasswordConfigured_andHashNotDefault() {
        AppUser admin = adminWithHash("$2a$10$ALGO_DISTINTO");
        when(appUserRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(admin));
        ReflectionTestUtils.setField(bootstrap, "adminInitialPassword", "");
        ReflectionTestUtils.setField(bootstrap, "failOnDefaultAdmin", true);

        bootstrap.run(); // password ya no es el default: no lanza
        verify(appUserRepository, never()).save(any());
    }

    @Test
    void run_doesNothing_whenNoAdmin() {
        when(appUserRepository.findByEmail("admin@example.com")).thenReturn(Optional.empty());
        ReflectionTestUtils.setField(bootstrap, "failOnDefaultAdmin", true);

        bootstrap.run(); // no lanza
        verify(appUserRepository, never()).save(any());
    }
}
