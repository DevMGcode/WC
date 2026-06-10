package com.mundial2026.backend.security;

import com.mundial2026.backend.user.repository.AppUserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;
    private final AppUserRepository appUserRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String jwt = getJwtFromRequest(request);

            if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt) && !tokenProvider.isRefreshToken(jwt)) {
                String username = tokenProvider.getUsernameFromToken(jwt);
                var userOpt = appUserRepository.findByUsername(username);

                // Invalidación por versión: si el token quedó obsoleto tras un
                // cambio de contraseña (tokenVersion incrementado), no autenticamos.
                if (userOpt.isPresent()) {
                    Integer currentVersion = userOpt.get().getTokenVersion();
                    int tokenVersion = tokenProvider.getTokenVersion(jwt);
                    if (currentVersion != null && currentVersion != tokenVersion) {
                        log.debug("JWT con versión obsoleta para {} (token={}, actual={})",
                                username, tokenVersion, currentVersion);
                        filterChain.doFilter(request, response);
                        return;
                    }
                }

                // Carga roles desde BD para que hasRole(...) en SecurityConfig funcione.
                List<SimpleGrantedAuthority> authorities = userOpt
                        .map(u -> u.getRoles().stream()
                                .map(r -> new SimpleGrantedAuthority("ROLE_" + r.getCode()))
                                .collect(Collectors.toList()))
                        .orElse(List.of());
                UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(username, null, authorities);
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception ex) {
            log.error("Error procesando JWT: {}", ex.getMessage());
        }
        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
