package com.mundial2026.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtTokenProvider {

    @Value("${app.security.jwt-secret}")
    private String jwtSecret;

    @Value("${app.security.jwt-expiration-ms}")
    private long jwtExpirationMs;

    @Value("${app.security.jwt-refresh-expiration-ms:604800000}")
    private long jwtRefreshExpirationMs;

    /** Mínimo de bytes exigido por HS256 (256 bits). */
    private static final int MIN_SECRET_BYTES = 32;

    /**
     * Valida el secret al arrancar. Si es nulo, demasiado corto o un placeholder
     * conocido, la aplicación NO debe iniciar: un secret débil o público permite
     * forjar tokens de cualquier usuario (incluido ADMIN).
     */
    @PostConstruct
    void validateSecret() {
        if (jwtSecret == null || jwtSecret.isBlank()) {
            throw new IllegalStateException(
                    "JWT_SECRET no configurado. Genera uno con: openssl rand -base64 48");
        }
        String normalized = jwtSecret.toLowerCase();
        if (normalized.contains("change") || normalized.contains("replace")
                || normalized.contains("reemplaza") || normalized.contains("changeme")) {
            throw new IllegalStateException(
                    "JWT_SECRET usa un valor placeholder inseguro. Define un secret real: openssl rand -base64 48");
        }
        int bytes = jwtSecret.getBytes(StandardCharsets.UTF_8).length;
        if (bytes < MIN_SECRET_BYTES) {
            throw new IllegalStateException(
                    "JWT_SECRET demasiado corto (" + bytes + " bytes). HS256 exige al menos "
                            + MIN_SECRET_BYTES + " bytes. Genera uno con: openssl rand -base64 48");
        }
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(String username) {
        return generateAccessToken(username, 0);
    }

    public String generateAccessToken(String username, int tokenVersion) {
        return buildToken(username, jwtExpirationMs, "access", tokenVersion);
    }

    public String generateRefreshToken(String username, int tokenVersion) {
        return buildToken(username, jwtRefreshExpirationMs, "refresh", tokenVersion);
    }

    private String buildToken(String username, long expirationMs, String type, int tokenVersion) {
        Date now = new Date();
        return Jwts.builder()
                .setSubject(username)
                .claim("type", type)
                .claim("tv", tokenVersion)
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + expirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Lee la versión de token (claim "tv") del JWT. Devuelve 0 si el token no la
     * lleva (tokens emitidos antes de introducir esta función) o si es inválido.
     */
    public int getTokenVersion(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(getSigningKey()).build()
                    .parseSignedClaims(token).getPayload();
            Integer tv = claims.get("tv", Integer.class);
            return tv != null ? tv : 0;
        } catch (Exception e) {
            return 0;
        }
    }

    public boolean isRefreshToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(getSigningKey()).build()
                    .parseSignedClaims(token).getPayload();
            return "refresh".equals(claims.get("type", String.class));
        } catch (Exception e) {
            return false;
        }
    }

    public String getUsernameFromToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return claims.getSubject();
        } catch (Exception e) {
            log.error("Error extrayendo username del token: {}", e.getMessage());
            return null;
        }
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            log.error("Error validando token: {}", e.getMessage());
            return false;
        }
    }
}





