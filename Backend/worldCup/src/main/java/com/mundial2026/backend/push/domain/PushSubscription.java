package com.mundial2026.backend.push.domain;

import com.mundial2026.backend.user.domain.AppUser;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;

/**
 * Suscripción Web Push de un navegador/dispositivo del usuario.
 * El navegador la genera al aceptar el permiso; el backend la usa para enviarle
 * notificaciones a ese dispositivo.
 */
@Getter
@Setter
@Entity
@Table(name = "push_subscription")
public class PushSubscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    /** URL del servicio push del navegador (Google/Mozilla/Apple). Única. */
    @Column(nullable = false, unique = true, length = 500)
    private String endpoint;

    /** Clave pública del cliente para cifrar el payload. */
    @Column(nullable = false, length = 255)
    private String p256dh;

    /** Secreto de autenticación del cliente. */
    @Column(nullable = false, length = 255)
    private String auth;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;
}
