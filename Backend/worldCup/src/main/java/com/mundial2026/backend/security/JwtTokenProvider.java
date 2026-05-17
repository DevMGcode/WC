package com.mundial2026.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
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

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    public String generateToken(String username) {
        return generateAccessToken(username);
    }

    public String generateAccessToken(String username) {
        return buildToken(username, jwtExpirationMs, "access");
    }

    public String generateRefreshToken(String username) {
        return buildToken(username, jwtRefreshExpirationMs, "refresh");
    }

    private String buildToken(String username, long expirationMs, String type) {
        Date now = new Date();
        return Jwts.builder()
                .setSubject(username)
                .claim("type", type)
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + expirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
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





