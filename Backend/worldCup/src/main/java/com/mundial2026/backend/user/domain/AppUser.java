package com.mundial2026.backend.user.domain;

import com.mundial2026.backend.tournament.domain.Team;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "app_user")
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(name = "email", nullable = false, unique = true, columnDefinition = "CITEXT")
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "country_name", length = 120)
    private String countryName;

    @Column(name = "country_code", length = 10)
    private String countryCode;

    @Column(name = "region_name", length = 120)
    private String regionName;

    @Column(name = "department_name", length = 120)
    private String departmentName;

    @Column(name = "city_name", length = 120)
    private String cityName;

    @Column(name = "phone_country_code", length = 10)
    private String phoneCountryCode;

    @Column(name = "phone_number", length = 30)
    private String phoneNumber;

    @Column(name = "preferred_language", nullable = false, length = 10)
    private String preferredLanguage = "es";

    @Column(name = "time_zone", nullable = false, length = 100)
    private String timeZone = "UTC";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserStatus status = UserStatus.ACTIVE;

    @Column(name = "email_verified", nullable = false)
    private Boolean emailVerified = false;

    @Column(name = "email_verification_token", length = 64)
    private String verificationToken;

    /** Token de recuperación de contraseña (flujo con enlace temporal). */
    @Column(name = "password_reset_token", length = 64)
    private String passwordResetToken;

    /** Expiración del token de recuperación. */
    @Column(name = "password_reset_expires_at")
    private OffsetDateTime passwordResetExpiresAt;

    /**
     * Versión de token. Cada JWT lleva esta versión al emitirse. Al cambiar el
     * password se incrementa, invalidando todos los tokens emitidos previamente.
     */
    @Column(name = "token_version", nullable = false)
    private Integer tokenVersion = 0;

    /**
     * ¿El usuario ya completó (u omitió) el onboarding inicial?
     * El frontend lo usa tras el login: false → redirigir a /onboarding;
     * true → entrar directo con idioma y favoritos ya configurados.
     */
    @Column(name = "onboarding_completed", nullable = false)
    private Boolean onboardingCompleted = false;

    /**
     * Preferencias de notificación (fuente única, compartida por onboarding y
     * perfil → Configuración). Con defaults para que existan aunque se omita el
     * onboarding. Las consumirá el envío de push (fases siguientes).
     */
    @Column(name = "notify_fixture_reminders", nullable = false)
    private Boolean notifyFixtureReminders = true;

    @Column(name = "notify_result_notifications", nullable = false)
    private Boolean notifyResultNotifications = true;

    @Column(name = "notify_league_updates", nullable = false)
    private Boolean notifyLeagueUpdates = true;

    @Column(name = "notify_news_updates", nullable = false)
    private Boolean notifyNewsUpdates = false;

    /**
     * Equipo favorito del usuario.
     * Lo usa el plan FREE para determinar qué 3 partidos puede predecir gratis
     * (los de fase de grupos del equipo). El plan PREMIUM lo ignora — puede
     * predecir todos los partidos.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "favorite_team_id")
    private Team favoriteTeam;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private OffsetDateTime updatedAt;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_role",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<RoleEntity> roles = new HashSet<>();
}
