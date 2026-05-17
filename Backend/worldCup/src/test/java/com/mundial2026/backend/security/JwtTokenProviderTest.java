package com.mundial2026.backend.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

class JwtTokenProviderTest {

    private JwtTokenProvider provider;

    @BeforeEach
    void setUp() {
        provider = new JwtTokenProvider();
        ReflectionTestUtils.setField(provider, "jwtSecret",
                "test-secret-key-long-enough-for-hmac-sha256-signing-algorithm-32bytes");
        ReflectionTestUtils.setField(provider, "jwtExpirationMs", 3_600_000L);
        ReflectionTestUtils.setField(provider, "jwtRefreshExpirationMs", 604_800_000L);
    }

    @Test
    void generateAccessToken_producesValidToken() {
        String token = provider.generateAccessToken("alice");

        assertThat(token).isNotBlank();
        assertThat(provider.validateToken(token)).isTrue();
    }

    @Test
    void generateRefreshToken_isDetectedAsRefresh() {
        String token = provider.generateRefreshToken("alice");

        assertThat(provider.isRefreshToken(token)).isTrue();
    }

    @Test
    void accessToken_isNotRefreshToken() {
        String token = provider.generateAccessToken("alice");

        assertThat(provider.isRefreshToken(token)).isFalse();
    }

    @Test
    void getUsernameFromToken_returnsCorrectSubject() {
        String token = provider.generateAccessToken("player99");

        assertThat(provider.getUsernameFromToken(token)).isEqualTo("player99");
    }

    @Test
    void generateToken_delegatesToAccessToken() {
        String via1 = provider.generateToken("u1");
        assertThat(provider.validateToken(via1)).isTrue();
        assertThat(provider.isRefreshToken(via1)).isFalse();
    }

    @Test
    void validateToken_withTamperedSignature_returnsFalse() {
        String token = provider.generateAccessToken("alice");
        String tampered = token.substring(0, token.length() - 6) + "XXXXXX";

        assertThat(provider.validateToken(tampered)).isFalse();
    }

    @Test
    void validateToken_withExpiredToken_returnsFalse() {
        ReflectionTestUtils.setField(provider, "jwtExpirationMs", 1L);
        String token = provider.generateAccessToken("alice");

        assertThat(provider.validateToken(token)).isFalse();
    }

    @Test
    void getUsernameFromToken_withGarbageInput_returnsNull() {
        assertThat(provider.getUsernameFromToken("not.a.jwt")).isNull();
    }
}
