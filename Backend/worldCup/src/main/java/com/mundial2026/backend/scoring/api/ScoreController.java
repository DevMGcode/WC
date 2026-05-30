package com.mundial2026.backend.scoring.api;

import com.mundial2026.backend.common.response.ApiResponse;
import com.mundial2026.backend.scoring.api.dto.PredictionScoreResponse;
import com.mundial2026.backend.scoring.api.dto.UserTournamentScoreResponse;
import com.mundial2026.backend.scoring.service.ScoringService;
import com.mundial2026.backend.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/scores")
@RequiredArgsConstructor
public class ScoreController {

    private final ScoringService scoringService;
    private final SecurityUtils securityUtils;

    @GetMapping("/user/{tournamentId}")
    public ResponseEntity<ApiResponse<UserTournamentScoreResponse>> getUserScore(
            @PathVariable Long tournamentId,
            @RequestParam Long userId
    ) {
        // Anti-IDOR: solo el dueño o ADMIN pueden ver su score
        securityUtils.requireSelfOrAdmin(userId);
        return ResponseEntity.ok(ApiResponse.ok("Score del usuario encontrado", scoringService.getUserScore(tournamentId, userId)));
    }

    @GetMapping("/history/{tournamentId}")
    public ResponseEntity<ApiResponse<List<PredictionScoreResponse>>> getHistory(
            @PathVariable Long tournamentId,
            @RequestParam Long userId
    ) {
        // Anti-IDOR: solo el dueño o ADMIN pueden ver su historial
        securityUtils.requireSelfOrAdmin(userId);
        return ResponseEntity.ok(ApiResponse.ok("Historial de puntuación encontrado", scoringService.getPredictionScoreHistory(tournamentId, userId)));
    }
}
