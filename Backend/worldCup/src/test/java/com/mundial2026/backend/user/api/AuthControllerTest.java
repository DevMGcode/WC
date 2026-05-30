package com.mundial2026.backend.user.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mundial2026.backend.common.exception.BusinessRuleException;
import com.mundial2026.backend.common.exception.ResourceNotFoundException;
import com.mundial2026.backend.security.JwtTokenProvider;
import com.mundial2026.backend.user.repository.AppUserRepository;
import com.mundial2026.backend.user.api.dto.AuthUserResponse;
import java.time.OffsetDateTime;
import com.mundial2026.backend.user.api.mapper.UserMapper;
import com.mundial2026.backend.user.domain.AppUser;
import com.mundial2026.backend.user.domain.UserStatus;
import com.mundial2026.backend.user.service.EmailService;
import com.mundial2026.backend.user.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;
import java.util.Set;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        value = AuthController.class,
        excludeAutoConfiguration = {SecurityAutoConfiguration.class, SecurityFilterAutoConfiguration.class}
)
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class AuthControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @MockitoBean UserService userService;
    @MockitoBean JwtTokenProvider tokenProvider;
    @MockitoBean UserMapper userMapper;
    @MockitoBean EmailService emailService;
    // JwtAuthenticationFilter ahora carga roles desde la BD, así que necesita
    // AppUserRepository en el contexto incluso cuando el filtro está deshabilitado.
    @MockitoBean AppUserRepository appUserRepository;

    private static final String LOGIN_URL = "/api/v1/auth/login";

    // ── POST /login ───────────────────────────────────────────────────────────

    @Test
    void login_validCredentials_returns200WithTokens() throws Exception {
        AppUser user = buildUser("alice");
        AuthUserResponse authUser = new AuthUserResponse("1", "alice@test.com",
                "Alice Smith", "ACTIVE", OffsetDateTime.now());

        when(userService.authenticate("alice@test.com", "pass123")).thenReturn(user);
        when(tokenProvider.generateAccessToken("alice")).thenReturn("access-tok");
        when(tokenProvider.generateRefreshToken("alice")).thenReturn("refresh-tok");
        when(userMapper.toAuthResponse(user)).thenReturn(authUser);

        mockMvc.perform(post(LOGIN_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("email", "alice@test.com", "password", "pass123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").value("access-tok"))
                .andExpect(jsonPath("$.data.refreshToken").value("refresh-tok"))
                .andExpect(jsonPath("$.data.user.displayName").value("Alice Smith"));
    }

    @Test
    void login_wrongPassword_returns422() throws Exception {
        when(userService.authenticate(anyString(), anyString()))
                .thenThrow(new BusinessRuleException("Credenciales inválidas"));

        mockMvc.perform(post(LOGIN_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("email", "alice@test.com", "password", "wrong"))))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.message").value("Credenciales inválidas"));
    }

    /**
     * Anti-enumeración: cuando el usuario no existe, devolvemos el MISMO 422 con
     * mensaje genérico "Credenciales inválidas" (no 404 que delataría que el email
     * no está registrado). El test confirma que la API no distingue ambos casos.
     */
    @Test
    void login_userNotFound_returnsGenericInvalidCredentials() throws Exception {
        when(userService.authenticate(anyString(), anyString()))
                .thenThrow(new BusinessRuleException("Credenciales inválidas"));

        mockMvc.perform(post(LOGIN_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("email", "ghost@test.com", "password", "pass"))))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.message").value("Credenciales inválidas"));
    }

    @Test
    void login_invalidEmailFormat_returns400() throws Exception {
        mockMvc.perform(post(LOGIN_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("email", "not-an-email", "password", "pass123"))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void login_missingPassword_returns400() throws Exception {
        mockMvc.perform(post(LOGIN_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"alice@test.com\"}"))
                .andExpect(status().isBadRequest());
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private AppUser buildUser(String username) {
        AppUser u = new AppUser();
        u.setId(1L);
        u.setUsername(username);
        u.setEmail(username + "@test.com");
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
