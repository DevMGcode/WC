package com.mundial2026.backend.security;

import com.mundial2026.backend.user.domain.AppUser;
import com.mundial2026.backend.user.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Chequeo de seguridad del usuario admin sembrado por la migración V1.
 *
 * El seed inicial crea {@code admin@example.com} con un hash BCrypt PÚBLICO
 * (está en el repo) cuya contraseña es "admin". En producción eso es una puerta
 * abierta. No podemos modificar V1__init.sql (rompería el checksum de Flyway en
 * entornos ya migrados), así que lo gestionamos al arrancar:
 *
 *   - Si se define ADMIN_INITIAL_PASSWORD → reseteamos el password del admin a
 *     ese valor (solo mientras siga teniendo el hash por defecto).
 *   - Si NO se define y el admin sigue con el hash por defecto:
 *       · app.security.fail-on-default-admin=true  → la app NO arranca.
 *       · false (default dev)                      → solo advertencia en log.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AdminPasswordBootstrap implements CommandLineRunner {

    /** Email del admin sembrado en V1__init.sql. */
    private static final String ADMIN_EMAIL = "admin@example.com";

    /** Hash BCrypt por defecto (password "admin") presente en el seed público. */
    private static final String DEFAULT_ADMIN_HASH =
            "$2a$10$KeuXSTa8G3VNsAnXoXs9Ze9APPmqiEs/a3YuF//YJ7MFJjn87y.rK";

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.security.admin-initial-password:}")
    private String adminInitialPassword;

    @Value("${app.security.fail-on-default-admin:false}")
    private boolean failOnDefaultAdmin;

    @Override
    @Transactional
    public void run(String... args) {
        AppUser admin = appUserRepository.findByEmail(ADMIN_EMAIL).orElse(null);
        if (admin == null) {
            return; // No hay admin sembrado (p.ej. prod con BD limpia) — nada que hacer.
        }

        boolean hasDefaultHash = DEFAULT_ADMIN_HASH.equals(admin.getPasswordHash());
        if (!hasDefaultHash) {
            return; // El password ya fue cambiado — todo en orden.
        }

        if (adminInitialPassword != null && !adminInitialPassword.isBlank()) {
            admin.setPasswordHash(passwordEncoder.encode(adminInitialPassword));
            appUserRepository.save(admin);
            log.info("[AdminBootstrap] Password del admin reseteado desde ADMIN_INITIAL_PASSWORD.");
            return;
        }

        String msg = "El usuario admin (" + ADMIN_EMAIL + ") aún usa la contraseña por defecto "
                + "\"admin\" (hash público del seed). Define ADMIN_INITIAL_PASSWORD para reemplazarla.";
        if (failOnDefaultAdmin) {
            throw new IllegalStateException("[AdminBootstrap] " + msg);
        }
        log.warn("[AdminBootstrap] ⚠ {}", msg);
    }
}
