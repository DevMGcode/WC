package com.mundial2026.backend.tournament.api;

import com.mundial2026.backend.common.response.ApiResponse;
import com.mundial2026.backend.security.SecurityUtils;
import com.mundial2026.backend.subscription.service.PremiumGuard;
import com.mundial2026.backend.tournament.api.dto.PlayerStatResponse;
import com.mundial2026.backend.tournament.service.PlayerStatsService;
import com.mundial2026.backend.user.domain.AppUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/public/players")
@RequiredArgsConstructor
public class PlayerStatsController {

    private final PlayerStatsService playerStatsService;
    private final SecurityUtils securityUtils;
    private final PremiumGuard premiumGuard;

    /**
     * Top goleadores — soft-auth.
     *
     * Reglas:
     *   - Usuario Premium: hasta 50 jugadores + filtro opcional por equipo.
     *   - Usuario Free, anonimo o no autenticado: maximo 10, sin filtro.
     *
     * El endpoint es publico por compatibilidad (lo consume el frontend para
     * vitrinas). Si llega un JWT valido, lo respetamos para enriquecer la
     * respuesta de Premium.
     */
    @GetMapping("/topscorers")
    public ResponseEntity<ApiResponse<List<PlayerStatResponse>>> topScorers(
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) Long teamId
    ) {
        boolean isPremium = currentUserIsPremium();
        int effectiveLimit;
        Long effectiveTeam;

        if (isPremium) {
            effectiveLimit = Math.min(limit != null ? limit : PlayerStatsService.PREMIUM_TOP_LIMIT,
                                       PlayerStatsService.PREMIUM_TOP_LIMIT);
            effectiveTeam = teamId; // filtro permitido
        } else {
            effectiveLimit = PlayerStatsService.FREE_TOP_LIMIT; // forzamos cap
            effectiveTeam = null;                               // ignoramos filtro
        }

        List<PlayerStatResponse> scorers = playerStatsService.findTopScorers(effectiveLimit, effectiveTeam);
        return ResponseEntity.ok(ApiResponse.ok("Top scorers", scorers));
    }

    /** Top asistencias: exclusivo Premium (SecurityConfig fuerza JWT). Acepta limite y filtro. */
    @GetMapping("/topassists")
    public ResponseEntity<ApiResponse<List<PlayerStatResponse>>> topAssists(
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) Long teamId
    ) {
        premiumGuard.requirePremium(securityUtils.currentUser(), "ver top asistentes");
        int effectiveLimit = Math.min(limit != null ? limit : PlayerStatsService.PREMIUM_TOP_LIMIT,
                                       PlayerStatsService.PREMIUM_TOP_LIMIT);
        return ResponseEntity.ok(ApiResponse.ok(
                "Top assists",
                playerStatsService.findTopAssists(effectiveLimit, teamId)
        ));
    }

    /**
     * Detecta si hay un usuario autenticado y es Premium.
     * Soft-check: si no hay JWT o el usuario no existe, devuelve false sin lanzar.
     */
    private boolean currentUserIsPremium() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
                return false;
            }
            AppUser user = securityUtils.currentUser();
            return premiumGuard.isPremium(user);
        } catch (Exception ignored) {
            return false;
        }
    }
}
