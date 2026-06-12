package com.mundial2026.backend.user.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mundial2026.backend.security.JwtAuthenticationFilter;
import com.mundial2026.backend.security.JwtTokenProvider;
import com.mundial2026.backend.security.SecurityUtils;
import com.mundial2026.backend.user.api.dto.UserResponse;
import com.mundial2026.backend.user.api.mapper.UserMapper;
import com.mundial2026.backend.user.domain.AppUser;
import com.mundial2026.backend.user.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;
import java.util.Set;

import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
        value = UserController.class,
        excludeAutoConfiguration = {
                SecurityAutoConfiguration.class,
                SecurityFilterAutoConfiguration.class
        },
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = JwtAuthenticationFilter.class
        )
)
@AutoConfigureMockMvc(addFilters = false)
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class UserControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @MockitoBean
    UserService userService;

    @MockitoBean
    UserMapper userMapper;

    @MockitoBean
    JwtTokenProvider jwtTokenProvider;

    // SecurityUtils centraliza la validación anti-IDOR. Lo mockeamos para que
    // requireSelfOrAdmin(...) sea no-op en estos tests (cuando se necesite
    // validar el caso "acceso denegado" haz: doThrow(...).when(securityUtils)).
    @MockitoBean
    SecurityUtils securityUtils;

    // JwtAuthenticationFilter ahora carga roles desde la BD.
    @MockitoBean
    com.mundial2026.backend.user.repository.AppUserRepository appUserRepository;

    // UserController ahora gestiona equipos favoritos (límite Free/Premium).
    @MockitoBean
    com.mundial2026.backend.user.service.UserFavoriteTeamService favoriteTeamService;

    @Test
    void count_returnsOk() throws Exception {
        when(userService.count()).thenReturn(7L);

        mockMvc.perform(get("/api/v1/users/count"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").value(7));
    }

    @Test
    void findById_returnsUser() throws Exception {
        AppUser user = new AppUser();
        user.setId(3L);
        user.setUsername("jaime");

        UserResponse response = buildUserResponse(3L, "jaime", false);

        when(userService.findById(3L)).thenReturn(user);
        when(userMapper.toResponse(user)).thenReturn(response);

        mockMvc.perform(get("/api/v1/users/3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.username").value("jaime"));
    }

    // ── PUT /{id}/onboarding ──────────────────────────────────────────────────

    @Test
    void completeOnboarding_returnsOkWithFlagTrue() throws Exception {
        AppUser user = new AppUser();
        user.setId(3L);
        user.setUsername("jaime");
        user.setOnboardingCompleted(true);

        when(userService.completeOnboarding(3L)).thenReturn(user);
        when(userMapper.toResponse(user)).thenReturn(buildUserResponse(3L, "jaime", true));

        mockMvc.perform(put("/api/v1/users/3/onboarding"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.onboardingCompleted").value(true));

        verify(userService).completeOnboarding(3L);
    }

    /** Anti-IDOR: un usuario no puede marcar el onboarding de otro. */
    @Test
    void completeOnboarding_otherUser_isRejected() throws Exception {
        doThrow(new com.mundial2026.backend.common.exception.BusinessRuleException(
                "Acceso denegado: el userId no corresponde al usuario autenticado"))
                .when(securityUtils).requireSelfOrAdmin(99L);

        mockMvc.perform(put("/api/v1/users/99/onboarding"))
                .andExpect(status().isUnprocessableEntity());

        verify(userService, never()).completeOnboarding(99L);
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private UserResponse buildUserResponse(Long id, String username, boolean onboardingCompleted) {
        return new UserResponse(
                id,
                username,
                username + "@test.com",
                "Jaime",
                "R",
                "Peru",
                "Lima",
                "Lima",
                "es",
                "UTC",
                "ACTIVE",
                true,
                Set.of("USER"),
                OffsetDateTime.now(),
                false,
                null,
                null,
                onboardingCompleted
        );
    }
}