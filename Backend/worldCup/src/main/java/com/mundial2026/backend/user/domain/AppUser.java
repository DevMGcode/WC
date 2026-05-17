package com.mundial2026.backend.user.domain;

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
