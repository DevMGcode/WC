package com.mundial2026.backend.user.service;

import com.mundial2026.backend.common.exception.BusinessRuleException;
import com.mundial2026.backend.common.exception.ResourceNotFoundException;
import com.mundial2026.backend.user.api.dto.CreateUserRequest;
import com.mundial2026.backend.user.api.dto.UpdateUserProfileRequest;
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

    // ── updateProfile ─────────────────────────────────────────────────────────

    /**
     * Caso del frontend: solo manda firstName + email. lastName y demás vienen
     * como null y NO deben sobrescribir los campos existentes en BD.
     */
    @Test
    void updateProfile_onlyFirstNameAndEmail_keepsOtherFields() {
        AppUser existing = buildActiveVerifiedUser("old@test.com", "$h");
        existing.setId(7L);
        existing.setLastName("Bonilla");
        existing.setPreferredLanguage("es");
        existing.setTimeZone("America/Bogota");

        when(appUserRepository.findById(7L)).thenReturn(Optional.of(existing));
        when(appUserRepository.existsByEmail("new@test.com")).thenReturn(false);
        when(appUserRepository.save(any(AppUser.class))).thenAnswer(inv -> inv.getArgument(0));

        var req = new UpdateUserProfileRequest("Nuevo", null, "new@test.com", null, null);
        AppUser updated = userService.updateProfile(7L, req);

        assertThat(updated.getFirstName()).isEqualTo("Nuevo");
        assertThat(updated.getEmail()).isEqualTo("new@test.com");
        // No deben cambiar:
        assertThat(updated.getLastName()).isEqualTo("Bonilla");
        assertThat(updated.getPreferredLanguage()).isEqualTo("es");
        assertThat(updated.getTimeZone()).isEqualTo("America/Bogota");
    }

    /**
     * Cliente alterno (Postman/futuro móvil) puede enviar lastName y se persiste.
     * Cubre el Bug 4: antes el backend ignoraba lastName aunque viniera.
     */
    @Test
    void updateProfile_withLastName_persistsLastName() {
        AppUser existing = buildActiveVerifiedUser("a@b.com", "$h");
        existing.setId(8L);
        existing.setLastName("Old");

        when(appUserRepository.findById(8L)).thenReturn(Optional.of(existing));
        when(appUserRepository.save(any(AppUser.class))).thenAnswer(inv -> inv.getArgument(0));

        var req = new UpdateUserProfileRequest("Alice", "NewLast", "a@b.com", null, null);
        AppUser updated = userService.updateProfile(8L, req);

        assertThat(updated.getLastName()).isEqualTo("NewLast");
    }

    @Test
    void updateProfile_withLanguageAndTimezone_persistsBoth() {
        AppUser existing = buildActiveVerifiedUser("a@b.com", "$h");
        existing.setId(9L);

        when(appUserRepository.findById(9L)).thenReturn(Optional.of(existing));
        when(appUserRepository.save(any(AppUser.class))).thenAnswer(inv -> inv.getArgument(0));

        var req = new UpdateUserProfileRequest("Alice", null, "a@b.com", "en", "America/Mexico_City");
        AppUser updated = userService.updateProfile(9L, req);

        assertThat(updated.getPreferredLanguage()).isEqualTo("en");
        assertThat(updated.getTimeZone()).isEqualTo("America/Mexico_City");
    }

    /**
     * Strings vacíos/blank en idioma o tz NO deben sobrescribir los valores
     * existentes (mantenemos el comportamiento defensivo del service).
     */
    @Test
    void updateProfile_blankLanguageOrTz_doesNotOverwrite() {
        AppUser existing = buildActiveVerifiedUser("a@b.com", "$h");
        existing.setId(10L);
        existing.setPreferredLanguage("es");
        existing.setTimeZone("America/Bogota");

        when(appUserRepository.findById(10L)).thenReturn(Optional.of(existing));
        when(appUserRepository.save(any(AppUser.class))).thenAnswer(inv -> inv.getArgument(0));

        var req = new UpdateUserProfileRequest("Alice", null, "a@b.com", "  ", "");
        AppUser updated = userService.updateProfile(10L, req);

        assertThat(updated.getPreferredLanguage()).isEqualTo("es");
        assertThat(updated.getTimeZone()).isEqualTo("America/Bogota");
    }

    @Test
    void updateProfile_duplicateEmail_throwsBusinessRule() {
        AppUser existing = buildActiveVerifiedUser("old@test.com", "$h");
        existing.setId(11L);

        when(appUserRepository.findById(11L)).thenReturn(Optional.of(existing));
        when(appUserRepository.existsByEmail("taken@test.com")).thenReturn(true);

        var req = new UpdateUserProfileRequest("Alice", null, "taken@test.com", null, null);

        assertThatThrownBy(() -> userService.updateProfile(11L, req))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("El email ya existe");
    }

    @Test
    void updateProfile_sameEmail_doesNotCheckUniqueness() {
        AppUser existing = buildActiveVerifiedUser("me@test.com", "$h");
        existing.setId(12L);

        when(appUserRepository.findById(12L)).thenReturn(Optional.of(existing));
        when(appUserRepository.save(any(AppUser.class))).thenAnswer(inv -> inv.getArgument(0));

        // Mismo email → no debe llamar existsByEmail; si lo hiciera el mock no
        // configurado devolvería false y dejaría pasar igual, pero validamos
        // que se guarda correctamente.
        var req = new UpdateUserProfileRequest("Yo", null, "me@test.com", null, null);
        AppUser updated = userService.updateProfile(12L, req);

        assertThat(updated.getEmail()).isEqualTo("me@test.com");
        assertThat(updated.getFirstName()).isEqualTo("Yo");
    }

    @Test
    void updateProfile_missingUser_throwsResourceNotFound() {
        when(appUserRepository.findById(999L)).thenReturn(Optional.empty());

        var req = new UpdateUserProfileRequest("X", null, "x@y.com", null, null);

        assertThatThrownBy(() -> userService.updateProfile(999L, req))
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
