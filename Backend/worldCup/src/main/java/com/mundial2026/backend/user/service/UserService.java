package com.mundial2026.backend.user.service;

import com.mundial2026.backend.common.exception.BusinessRuleException;
import com.mundial2026.backend.common.exception.ResourceNotFoundException;
import com.mundial2026.backend.user.api.dto.ChangePasswordRequest;
import com.mundial2026.backend.user.api.dto.CreateUserRequest;
import com.mundial2026.backend.user.api.dto.UpdateUserProfileRequest;
import com.mundial2026.backend.tournament.domain.Team;
import com.mundial2026.backend.tournament.repository.TeamRepository;
import com.mundial2026.backend.user.domain.AppUser;
import com.mundial2026.backend.user.domain.RoleEntity;
import com.mundial2026.backend.user.repository.AppUserRepository;
import com.mundial2026.backend.user.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final AppUserRepository appUserRepository;
    private final RoleRepository roleRepository;
    private final TeamRepository teamRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    @Value("${app.email.verification-required:true}")
    private boolean emailVerificationRequired;

    @Transactional
    public AppUser create(CreateUserRequest request) {
        if (appUserRepository.existsByUsername(request.username())) {
            throw new BusinessRuleException("El username ya existe");
        }
        if (appUserRepository.existsByEmail(request.email())) {
            throw new BusinessRuleException("El email ya existe");
        }

        RoleEntity userRole = roleRepository.findByCode("USER")
                .orElseThrow(() -> new ResourceNotFoundException("Rol USER no encontrado"));

        AppUser user = new AppUser();
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setCountryName(request.countryName());
        user.setCountryCode(request.countryCode());
        user.setRegionName(request.regionName());
        user.setDepartmentName(request.departmentName());
        user.setCityName(request.cityName());
        user.setPhoneCountryCode(request.phoneCountryCode());
        user.setPhoneNumber(request.phoneNumber());
        user.setPreferredLanguage(request.preferredLanguage() == null ? "es" : request.preferredLanguage());
        user.setTimeZone(request.timeZone() == null ? "UTC" : request.timeZone());
        user.getRoles().add(userRole);

        String token = UUID.randomUUID().toString().replace("-", "");
        user.setVerificationToken(token);

        if (!emailVerificationRequired) {
            user.setEmailVerified(true);
            user.setVerificationToken(null);
        }

        AppUser saved = appUserRepository.save(user);

        if (emailVerificationRequired) {
            try {
                String verifyUrl = frontendUrl + "/api/v1/auth/verify-email?token=" + token;
                emailService.sendVerificationEmail(saved.getEmail(), saved.getUsername(), verifyUrl);
            } catch (Exception e) {
                log.warn("[UserService] Verification email failed for {}: {}", saved.getEmail(), e.getMessage());
            }
        } else {
            try {
                emailService.sendWelcomeEmail(saved.getEmail(), saved.getUsername());
            } catch (Exception e) {
                log.warn("[UserService] Welcome email failed for {}: {}", saved.getEmail(), e.getMessage());
            }
        }
        return saved;
    }

    @Transactional(readOnly = true)
    public long count() {
        return appUserRepository.count();
    }

    @Transactional(readOnly = true)
    public AppUser findById(Long id) {
        return appUserRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id=" + id));
    }

    @Transactional(readOnly = true)
    public AppUser authenticate(String email, String password) {
        // Anti-enumeración: mismo mensaje genérico tanto si el email NO existe
        // como si el password es incorrecto. Un atacante no puede distinguir
        // entre los dos casos para enumerar emails registrados.
        AppUser user = appUserRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessRuleException("Credenciales inválidas"));

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new BusinessRuleException("Credenciales inválidas");
        }

        if (!user.getStatus().name().equals("ACTIVE")) {
            throw new BusinessRuleException("Usuario no está activo");
        }

        if (emailVerificationRequired && !Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new BusinessRuleException("EMAIL_NOT_VERIFIED");
        }

        return user;
    }

    @Transactional(readOnly = true)
    public AppUser findByUsername(String username) {
        return appUserRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }

    @Transactional
    public boolean verifyEmail(String token) {
        return appUserRepository.findByVerificationToken(token)
                .map(user -> {
                    user.setEmailVerified(true);
                    user.setVerificationToken(null);
                    appUserRepository.save(user);
                    try {
                        emailService.sendWelcomeEmail(user.getEmail(), user.getUsername());
                    } catch (Exception e) {
                        log.warn("[UserService] Post-verification welcome email failed: {}", e.getMessage());
                    }
                    return true;
                })
                .orElse(false);
    }

    @Transactional
    public AppUser updateProfile(Long id, UpdateUserProfileRequest request) {
        AppUser user = appUserRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id=" + id));

        // Validar que el email no esté siendo usado por otro usuario
        if (!user.getEmail().equals(request.email()) && appUserRepository.existsByEmail(request.email())) {
            throw new BusinessRuleException("El email ya existe");
        }

        user.setEmail(request.email());
        user.setFirstName(request.firstName());
        // Campos opcionales: solo se actualizan si el cliente los envía.
        // El frontend actual solo manda firstName+email, pero Postman/clientes
        // móviles pueden enviar más, y todos los campos existen en la BD.
        if (request.lastName() != null) {
            user.setLastName(request.lastName());
        }
        if (request.preferredLanguage() != null && !request.preferredLanguage().isBlank()) {
            user.setPreferredLanguage(request.preferredLanguage());
        }
        if (request.timeZone() != null && !request.timeZone().isBlank()) {
            user.setTimeZone(request.timeZone());
        }

        return appUserRepository.save(user);
    }

    @Transactional
    public String resetPassword(String email) {
        AppUser user = appUserRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("No existe una cuenta con ese email"));

        String tempPassword = generateTempPassword();
        user.setPasswordHash(passwordEncoder.encode(tempPassword));
        appUserRepository.save(user);
        return tempPassword;
    }

    private String generateTempPassword() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
        SecureRandom rng = new SecureRandom();
        StringBuilder sb = new StringBuilder(8);
        for (int i = 0; i < 8; i++) {
            sb.append(chars.charAt(rng.nextInt(chars.length())));
        }
        return sb.toString();
    }

    @Transactional
    public AppUser changePassword(Long id, ChangePasswordRequest request) {
        AppUser user = appUserRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id=" + id));

        // Validar que la contraseña actual sea correcta
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new BusinessRuleException("La contraseña actual es incorrecta");
        }

        // Validar que la nueva contraseña sea diferente
        if (request.currentPassword().equals(request.newPassword())) {
            throw new BusinessRuleException("La nueva contraseña debe ser diferente a la actual");
        }

        // Actualizar la contraseña
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));

        return appUserRepository.save(user);
    }

    /**
     * Establece el equipo favorito del usuario.
     * Relevante para el plan FREE: determina qué 3 partidos puede predecir gratis.
     */
    @Transactional
    public AppUser setFavoriteTeam(Long userId, Long teamId) {
        AppUser user = findById(userId);
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Equipo no encontrado con id=" + teamId));
        user.setFavoriteTeam(team);
        return appUserRepository.save(user);
    }
}
