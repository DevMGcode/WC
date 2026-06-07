package com.mundial2026.backend.tournament.api;

import com.mundial2026.backend.common.response.ApiResponse;
import com.mundial2026.backend.security.SecurityUtils;
import com.mundial2026.backend.subscription.service.PremiumGuard;
import com.mundial2026.backend.tournament.api.dto.PlayerStatResponse;
import com.mundial2026.backend.tournament.service.PlayerStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/public/players")
@RequiredArgsConstructor
public class PlayerStatsController {

    private final PlayerStatsService playerStatsService;
    private final SecurityUtils securityUtils;
    private final PremiumGuard premiumGuard;

    /** Top goleadores: público para todos (es vitrina informativa del Mundial). */
    @GetMapping("/topscorers")
    public ResponseEntity<ApiResponse<List<PlayerStatResponse>>> topScorers() {
        return ResponseEntity.ok(ApiResponse.ok("Top scorers", playerStatsService.findTopScorers()));
    }

    /** Top asistencias: exclusivo Premium. */
    @GetMapping("/topassists")
    public ResponseEntity<ApiResponse<List<PlayerStatResponse>>> topAssists() {
        premiumGuard.requirePremium(securityUtils.currentUser(), "ver top asistentes");
        return ResponseEntity.ok(ApiResponse.ok("Top assists", playerStatsService.findTopAssists()));
    }
}
