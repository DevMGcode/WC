package com.mundial2026.backend.scoring.api;

import com.mundial2026.backend.common.response.ApiResponse;
import com.mundial2026.backend.common.response.PaginatedResponse;
import com.mundial2026.backend.scoring.api.dto.UserRankPositionResponse;
import com.mundial2026.backend.scoring.api.dto.UserTournamentScoreResponse;
import com.mundial2026.backend.scoring.service.ScoringService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/public/rankings")
@RequiredArgsConstructor
public class RankingController {

    private final ScoringService scoringService;

    @GetMapping("/global/{tournamentId}")
    public ResponseEntity<ApiResponse<PaginatedResponse<UserTournamentScoreResponse>>> getGlobalRanking(
            @PathVariable Long tournamentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int pageSize
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Ranking global encontrado",
                scoringService.getGlobalRanking(tournamentId, page, pageSize)
        ));
    }

    @GetMapping("/user/{tournamentId}/position")
    public ResponseEntity<ApiResponse<UserRankPositionResponse>> getUserPosition(
            @PathVariable Long tournamentId,
            @RequestParam(defaultValue = "3") Long userId
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Posición del usuario encontrada",
                scoringService.getUserRankPosition(tournamentId, userId)
        ));
    }
}
