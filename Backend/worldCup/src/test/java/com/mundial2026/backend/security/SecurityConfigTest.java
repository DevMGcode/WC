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
    void corsConfiguration_devOrigins_includesLocalhostAndFrontendUrl() {
        SecurityConfig config = new SecurityConfig(mock(JwtAuthenticationFilter.class));
        ReflectionTestUtils.setField(config, "frontendUrl", "https://mi-front.com");
        ReflectionTestUtils.setField(config, "allowDevOrigins", true);

        CorsConfigurationSource source = config.corsConfigurationSource();
        var cors = source.getCorsConfiguration(new MockHttpServletRequest("GET", "/api/v1/public/users/count"));

        assertThat(cors).isNotNull();
        // El código usa allowedOriginPatterns (no allowedOrigins) por los wildcards ngrok.
        assertThat(cors.getAllowedOriginPatterns())
                .contains(
                        "http://localhost:3000",
                        "http://127.0.0.1:3000",
                        "https://*.ngrok-free.app",
                        "https://mi-front.com",
                        "https://www.mi-front.com"
                );
        assertThat(cors.getAllowedMethods())
                .contains("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS");
    }

    /** S7: en producción (allow-dev-origins=false) solo se permite el dominio real. */
    @Test
    void corsConfiguration_prod_excludesDevAndNgrokOrigins() {
        SecurityConfig config = new SecurityConfig(mock(JwtAuthenticationFilter.class));
        ReflectionTestUtils.setField(config, "frontendUrl", "https://mi-front.com");
        ReflectionTestUtils.setField(config, "allowDevOrigins", false);

        CorsConfigurationSource source = config.corsConfigurationSource();
        var cors = source.getCorsConfiguration(new MockHttpServletRequest("GET", "/api/v1/public/users/count"));

        assertThat(cors).isNotNull();
        assertThat(cors.getAllowedOriginPatterns())
                .containsExactlyInAnyOrder("https://mi-front.com", "https://www.mi-front.com")
                .doesNotContain("http://localhost:3000", "https://*.ngrok-free.app");
    }
}