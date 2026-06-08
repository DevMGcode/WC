package com.mundial2026.backend.tournament.api;

import com.mundial2026.backend.common.response.ApiResponse;
import com.mundial2026.backend.security.SecurityUtils;
import com.mundial2026.backend.subscription.service.PremiumGuard;
import com.mundial2026.backend.tournament.api.dto.SquadPlayerResponse;
import com.mundial2026.backend.tournament.service.SquadService;
import com.mundial2026.backend.user.domain.AppUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Plantilla del equipo — soft-auth.
 *
 * Reglas Free/Premium:
 *   - Anonimo / Free → solo los primeros 11 jugadores (titulares aproximados)
 *   - Premium        → plantilla completa (suplentes + cuerpo tecnico)
 *
 * El endpoint sigue siendo publico por compatibilidad con vistas RSC y
 * prefetching. Si llega un JWT valido, lo respetamos para Premium.
 */
@RestController
@RequestMapping("/api/v1/public/teams")
@RequiredArgsConstructor
public class SquadController {

    private final SquadService squadService;
    private final SecurityUtils securityUtils;
    private final PremiumGuard premiumGuard;

    @GetMapping("/{teamId}/squad")
    public ResponseEntity<ApiResponse<List<SquadPlayerResponse>>> squad(@PathVariable Long teamId) {
        boolean isPremium = currentUserIsPremium();
        List<SquadPlayerResponse> result = isPremium
                ? squadService.findByTeam(teamId)
                : squadService.findByTeamForFree(teamId);
        return ResponseEntity.ok(ApiResponse.ok("Team squad", result));
    }

    /** Soft-check: detecta usuario autenticado y Premium sin lanzar para anonimos. */
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
