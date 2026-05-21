package com.mundial2026.backend.security;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.cors.CorsConfigurationSource;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

class SecurityConfigTest {

    @Test
    void passwordEncoder_isBCryptAndWorks() {
        SecurityConfig config = new SecurityConfig(mock(JwtAuthenticationFilter.class));
        PasswordEncoder encoder = config.passwordEncoder();

        String raw = "pass123";
        String encoded = encoder.encode(raw);

        assertThat(encoded).isNotBlank();
        assertThat(encoder.matches(raw, encoded)).isTrue();
    }

    @Test
    void corsConfiguration_includesLocalhostAndFrontendUrl() {
        SecurityConfig config = new SecurityConfig(mock(JwtAuthenticationFilter.class));
        ReflectionTestUtils.setField(config, "frontendUrl", "https://mi-front.com");

        CorsConfigurationSource source = config.corsConfigurationSource();

        MockHttpServletRequest request = new MockHttpServletRequest(
                "GET",
                "/api/v1/public/users/count"
        );
        request.addHeader("Origin", "http://localhost:3000");

        var cors = source.getCorsConfiguration(request);

        assertThat(cors).isNotNull();

        assertThat(cors.getAllowedOrigins())
                .contains(
                        "http://localhost:3000",
                        "http://127.0.0.1:3000",
                        "https://mi-front.com"
                );

        assertThat(cors.getAllowedMethods())
                .contains(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                );
    }
}