package com.mundial2026.backend.achievement.api;

import com.mundial2026.backend.achievement.api.dto.AchievementSummaryResponse;
import com.mundial2026.backend.achievement.service.AchievementService;
import com.mundial2026.backend.common.response.ApiResponse;
import com.mundial2026.backend.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/achievements")
@RequiredArgsConstructor
public class AchievementController {

    private final AchievementService achievementService;
    private final SecurityUtils securityUtils;

    /** Rachas + logros del usuario en un torneo. */
    @GetMapping("/{tournamentId}")
    public ResponseEntity<ApiResponse<AchievementSummaryResponse>> getAchievements(
            @PathVariable Long tournamentId,
            @RequestParam Long userId
    ) {
        // Anti-IDOR: solo el propio usuario o ADMIN pueden ver sus logros.
        securityUtils.requireSelfOrAdmin(userId);
        return ResponseEntity.ok(ApiResponse.ok(
                "Logros del usuario encontrados",
                achievementService.getAchievements(tournamentId, userId)
        ));
    }
}
