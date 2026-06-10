package com.mundial2026.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@Order(1)
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final int MAX_REQUESTS = 10;
    private static final long WINDOW_MS = 60_000L;

    /**
     * Solo cuando la app corre detrás de un proxy confiable (nginx) que setea
     * X-Forwarded-For. En ese caso confiamos en la IP que NUESTRO proxy añade.
     * En dev/sin proxy queda en false: ignoramos X-Forwarded-For por completo,
     * porque el cliente lo controla y podría rotar IPs falsas para evadir el límite.
     */
    @Value("${app.security.trust-proxy:false}")
    private boolean trustProxy;

    private final ConcurrentHashMap<String, Deque<Long>> requestLog = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String uri = request.getRequestURI();
        if (!uri.startsWith("/api/v1/auth/")) {
            chain.doFilter(request, response);
            return;
        }

        String ip = resolveClientIp(request);
        long now = System.currentTimeMillis();

        Deque<Long> timestamps = requestLog.computeIfAbsent(ip, k -> new ArrayDeque<>());
        synchronized (timestamps) {
            while (!timestamps.isEmpty() && now - timestamps.peekFirst() > WINDOW_MS) {
                timestamps.pollFirst();
            }
            if (timestamps.size() >= MAX_REQUESTS) {
                log.warn("[RateLimit] IP {} blocked on {}", ip, uri);
                response.setStatus(429);
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write(
                    "{\"error\":\"Demasiadas solicitudes. Intenta de nuevo en un minuto.\",\"status\":429}"
                );
                return;
            }
            timestamps.addLast(now);
        }

        chain.doFilter(request, response);
    }

    private String resolveClientIp(HttpServletRequest request) {
        // Sin proxy confiable: NUNCA usar X-Forwarded-For (el cliente lo controla
        // y podría rotar IPs falsas para evadir el rate limit).
        if (!trustProxy) {
            return request.getRemoteAddr();
        }
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            // Detrás de un único proxy (nginx con $proxy_add_x_forwarded_for), la IP
            // que NUESTRO proxy añade es la ÚLTIMA del header; las anteriores podrían
            // venir falsificadas por el cliente. Tomamos la última.
            String[] parts = forwarded.split(",");
            return parts[parts.length - 1].trim();
        }
        return request.getRemoteAddr();
    }
}
