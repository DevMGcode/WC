package com.mundial2026.backend.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.assertThatCode;

class JwtTokenProviderTest {

    // 64-char secret (≥32 bytes for HS256 — Keys.hmacShaKeyFor requirement)
    private static final String SECRET = "test-jwt-secret-test-jwt-secret-test-jwt-secret-test-jwt-secret!";

    private JwtTokenProvider subject;

    @BeforeEach
    void setUp() {
        subject = new JwtTokenProvider();
        ReflectionTestUtils.setField(subject, "jwtSecret", SECRET);
        ReflectionTestUtils.setField(subject, "jwtExpirationMs", 60_000L);
    }

    @Test
    void generateToken_producesThreeSegmentJwt() {
        String token = subject.generateToken("admin");

        assertThat(token).isNotBlank();
        assertThat(token.split("\\.")).hasSize(3);
    }

    @Test
    void getUsernameFromToken_roundtripsSubject() {
        String token = subject.generateToken("juan.perez");

        assertThat(subject.getUsernameFromToken(token)).isEqualTo("juan.perez");
    }

    @Test
    void validateToken_acceptsValidToken() {
        String token = subject.generateToken("admin");

        assertThat(subject.validateToken(token)).isTrue();
    }

    @Test
    void validateToken_rejectsTamperedSignature() {
        String token = subject.generateToken("admin");
        String tampered = token.substring(0, token.length() - 4) + "AAAA";

        assertThat(subject.validateToken(tampered)).isFalse();
    }

    @Test
    void validateToken_rejectsGarbage() {
        assertThat(subject.validateToken("not.a.real.jwt")).isFalse();
        assertThat(subject.validateToken("")).isFalse();
    }

    @Test
    void getUsernameFromToken_returnsNullForGarbage() {
        assertThat(subject.getUsernameFromToken("garbage")).isNull();
    }

    @Test
    void validateToken_rejectsExpiredToken() throws Exception {
        ReflectionTestUtils.setField(subject, "jwtExpirationMs", 1L);
        String token = subject.generateToken("admin");
        Thread.sleep(50);

        assertThat(subject.validateToken(token)).isFalse();
    }

    // ── Validación del secret al arrancar (S2) ──────────────────────────────────

    private JwtTokenProvider providerWithSecret(String secret) {
        JwtTokenProvider p = new JwtTokenProvider();
        ReflectionTestUtils.setField(p, "jwtSecret", secret);
        return p;
    }

    @Test
    void validateSecret_rejectsBlank() {
        assertThatThrownBy(() -> providerWithSecret("").validateSecret())
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void validateSecret_rejectsPlaceholder() {
        assertThatThrownBy(() ->
                providerWithSecret("change-this-secret-key-change-this-secret-key").validateSecret())
                .isInstanceOf(IllegalStateException.class);
        assertThatThrownBy(() ->
                providerWithSecret("REEMPLAZA_CON_openssl_rand_base64_48_aaaaaaaaaa").validateSecret())
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void validateSecret_rejectsTooShort() {
        assertThatThrownBy(() -> providerWithSecret("short-secret").validateSecret())
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void validateSecret_acceptsStrongSecret() {
        assertThatCode(() -> providerWithSecret(SECRET).validateSecret())
                .doesNotThrowAnyException();
    }
}
