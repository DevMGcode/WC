package com.mundial2026.backend.security;

import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

class RateLimitingFilterTest {

    private RateLimitingFilter filter;

    @BeforeEach
    void setUp() {
        filter = new RateLimitingFilter();
        // Por defecto, sin confiar en proxy (igual que producción sin nginx).
        ReflectionTestUtils.setField(filter, "trustProxy", false);
    }

    private void hit(FilterChain chain, String remoteAddr, String xff, int expectedStatus) throws Exception {
        MockHttpServletRequest req = new MockHttpServletRequest("POST", "/api/v1/auth/login");
        req.setRemoteAddr(remoteAddr);
        if (xff != null) req.addHeader("X-Forwarded-For", xff);
        MockHttpServletResponse res = new MockHttpServletResponse();
        filter.doFilter(req, res, chain);
        assertThat(res.getStatus()).isEqualTo(expectedStatus);
    }

    @Test
    void nonAuthEndpoint_isNotRateLimited() throws Exception {
        MockHttpServletRequest req = new MockHttpServletRequest("GET", "/api/v1/public/health");
        req.setRemoteAddr("10.0.0.1");
        MockHttpServletResponse res = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(req, res, chain);

        assertThat(res.getStatus()).isEqualTo(200);
    }

    @Test
    void authEndpoint_whenLimitExceeded_returns429() throws Exception {
        FilterChain chain = mock(FilterChain.class);

        for (int i = 0; i < 10; i++) {
            MockHttpServletRequest req = new MockHttpServletRequest("POST", "/api/v1/auth/login");
            req.setRemoteAddr("10.0.0.2");
            MockHttpServletResponse res = new MockHttpServletResponse();
            filter.doFilter(req, res, chain);
            assertThat(res.getStatus()).isEqualTo(200);
        }

        MockHttpServletRequest blockedReq = new MockHttpServletRequest("POST", "/api/v1/auth/login");
        blockedReq.setRemoteAddr("10.0.0.2");
        MockHttpServletResponse blockedRes = new MockHttpServletResponse();

        filter.doFilter(blockedReq, blockedRes, chain);

        assertThat(blockedRes.getStatus()).isEqualTo(429);
    }

    /**
     * S5: sin trust-proxy, un atacante que rota X-Forwarded-For NO puede evadir
     * el límite — todas sus peticiones cuentan contra su IP de conexión real.
     */
    @Test
    void rotatingXForwardedFor_doesNotBypassLimit_whenProxyUntrusted() throws Exception {
        FilterChain chain = mock(FilterChain.class);

        // 10 peticiones desde la MISMA IP real, pero con XFF falsificado distinto cada vez
        for (int i = 0; i < 10; i++) {
            hit(chain, "203.0.113.9", "1.2.3." + i, 200);
        }
        // La 11ª, aunque cambie el XFF, sigue bloqueada (cuenta la IP real)
        hit(chain, "203.0.113.9", "9.9.9.9", 429);
    }

    /**
     * S5: con trust-proxy, se usa la ÚLTIMA IP del XFF (la que añade nuestro nginx),
     * no la primera (que el cliente puede falsificar).
     */
    @Test
    void trustProxy_usesLastForwardedIp() throws Exception {
        ReflectionTestUtils.setField(filter, "trustProxy", true);
        FilterChain chain = mock(FilterChain.class);

        // El cliente falsifica la 1ª IP, pero nginx añade la real al final (=70.0.0.1)
        for (int i = 0; i < 10; i++) {
            hit(chain, "10.0.0.254", "6.6.6." + i + ", 70.0.0.1", 200);
        }
        // Misma IP real al final → bloqueada pese a 1ª IP distinta
        hit(chain, "10.0.0.254", "8.8.8.8, 70.0.0.1", 429);
    }
}