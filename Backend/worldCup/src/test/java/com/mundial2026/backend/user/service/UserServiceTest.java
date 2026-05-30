package com.mundial2026.backend.user.service;

import com.mundial2026.backend.common.exception.BusinessRuleException;
import com.mundial2026.backend.common.exception.ResourceNotFoundException;
import com.mundial2026.backend.user.api.dto.CreateUserRequest;
import com.mundial2026.backend.user.domain.AppUser;
import com.mundial2026.backend.user.domain.RoleEntity;
import com.mundial2026.backend.user.domain.UserStatus;
import com.mundial2026.backend.user.repository.AppUserRepository;
import com.mundial2026.backend.user.repository.RoleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock AppUserRepository appUserRepository;
    @Mock RoleRepository roleRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock EmailService emailService;

    @InjectMocks UserService userService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(userService, "frontendUrl", "http://localhost:3000");
        // Mantener verificación de email habilitada por defecto en los tests,
        // igual que en producción (`app.email.verification-required: true`).
        ReflectionTestUtils.setField(userService, "emailVerificationRequired", true);
    }

    // ── create ────────────────────────────────────────────────────────────────

    @Test
    void create_validRequest_savesUser() {
        var req = buildCreateRequest("alice", "alice@test.com");
        var role = new RoleEntity();

        when(appUserRepository.existsByUsername("alice")).thenReturn(false);
        when(appUserRepository.existsByEmail("alice@test.com")).thenReturn(false);
        when(roleRepository.findByCode("USER")).thenReturn(Optional.of(role));
        when(passwordEncoder.encode("pass123")).thenReturn("$hashed");
        when(appUserRepository.save(any(AppUser.class))).thenAnswer(inv -> inv.getArgument(0));

        AppUser result = userService.create(req);

        assertThat(result.getUsername()).isEqualTo("alice");
        assertThat(result.getEmail()).isEqualTo("alice@test.com");
        assertThat(result.getPasswordHash()).isEqualTo("$hashed");
        verify(appUserRepository).save(any(AppUser.class));
    }

    @Test
    void create_duplicateUsername_throwsBusinessRule() {
        when(appUserRepository.existsByUsername("alice")).thenReturn(true);

        assertThatThrownBy(() -> userService.create(buildCreateRequest("alice", "alice@test.com")))
                .isInstanceOf(BusinessRuleException.class);
    }

    @Test
    void create_duplicateEmail_throwsBusinessRule() {
        when(appUserRepository.existsByUsername("alice")).thenReturn(false);
        when(appUserRepository.existsByEmail("alice@test.com")).thenReturn(true);

        assertThatThrownBy(() -> userService.create(buildCreateRequest("alice", "alice@test.com")))
                .isInstanceOf(BusinessRuleException.class);
    }

    @Test
    void create_roleNotFound_throwsResourceNotFound() {
        when(appUserRepository.existsByUsername(anyString())).thenReturn(false);
        when(appUserRepository.existsByEmail(anyString())).thenReturn(false);
        when(roleRepository.findByCode("USER")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.create(buildCreateRequest("alice", "alice@test.com")))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── authenticate ──────────────────────────────────────────────────────────

    @Test
    void authenticate_validCredentials_returnsUser() {
        AppUser user = buildActiveVerifiedUser("alice@test.com", "$hashed");
        when(appUserRepository.findByEmail("alice@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("pass123", "$hashed")).thenReturn(true);

        AppUser result = userService.authenticate("alice@test.com", "pass123");

        assertThat(result.getEmail()).isEqualTo("alice@test.com");
    }

    /**
     * Anti-enumeración: cuando el email NO existe, devolvemos el MISMO mensaje
     * genérico "Credenciales inválidas" que cuando la contraseña es incorrecta.
     * Un atacante no debe poder distinguir ambos casos para enumerar emails.
     */
    @Test
    void authenticate_unknownEmail_throwsGenericInvalidCredentials() {
        when(appUserRepository.findByEmail("ghost@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.authenticate("ghost@test.com", "pass"))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Credenciales inválidas");
    }

    @Test
    void authenticate_wrongPassword_throwsGenericInvalidCredentials() {
        AppUser user = buildActiveVerifiedUser("alice@test.com", "$hashed");
        when(appUserRepository.findByEmail("alice@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "$hashed")).thenReturn(false);

        assertThatThrownBy(() -> userService.authenticate("alice@test.com", "wrong"))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Credenciales inválidas");
    }

    @Test
    void authenticate_emailNotVerified_throwsBusinessRule() {
        AppUser user = buildActiveVerifiedUser("alice@test.com", "$hashed");
        user.setEmailVerified(false);
        when(appUserRepository.findByEmail("alice@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("pass123", "$hashed")).thenReturn(true);

        assertThatThrownBy(() -> userService.authenticate("alice@test.com", "pass123"))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("EMAIL_NOT_VERIFIED");
    }

    @Test
    void authenticate_blockedUser_throwsBusinessRule() {
        AppUser user = buildActiveVerifiedUser("alice@test.com", "$hashed");
        user.setStatus(UserStatus.BLOCKED);
        when(appUserRepository.findByEmail("alice@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("pass123", "$hashed")).thenReturn(true);

        assertThatThrownBy(() -> userService.authenticate("alice@test.com", "pass123"))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("no está activo");
    }

    // ── findById ──────────────────────────────────────────────────────────────

    @Test
    void findById_existingUser_returnsUser() {
        AppUser user = buildActiveVerifiedUser("a@b.com", "$h");
        user.setId(42L);
        when(appUserRepository.findById(42L)).thenReturn(Optional.of(user));

        assertThat(userService.findById(42L).getId()).isEqualTo(42L);
    }

    @Test
    void findById_missingUser_throwsResourceNotFound() {
        when(appUserRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.findById(999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private CreateUserRequest buildCreateRequest(String username, String email) {
        return new CreateUserRequest(username, email, "pass123",
                "Alice", "Smith",
                null, null, null, null, null, null, null, null, null);
    }

    private AppUser buildActiveVerifiedUser(String email, String passwordHash) {
        AppUser u = new AppUser();
        u.setUsername("alice");
        u.setEmail(email);
        u.setPasswordHash(passwordHash);
        u.setFirstName("Alice");
        u.setLastName("Smith");
        u.setStatus(UserStatus.ACTIVE);
        u.setEmailVerified(true);
        u.setPreferredLanguage("es");
        u.setTimeZone("UTC");
        u.setRoles(Set.of());
        return u;
    }
}
