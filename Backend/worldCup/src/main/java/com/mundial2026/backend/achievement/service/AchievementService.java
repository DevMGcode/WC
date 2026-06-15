package com.mundial2026.backend.achievement.service;

import com.mundial2026.backend.achievement.api.dto.AchievementResponse;
import com.mundial2026.backend.achievement.api.dto.AchievementSummaryResponse;
import com.mundial2026.backend.scoring.api.dto.PredictionScoreResponse;
import com.mundial2026.backend.scoring.api.dto.UserTournamentScoreResponse;
import com.mundial2026.backend.scoring.service.ScoringService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

/**
 * Calcula rachas y logros del usuario a partir del scoring que YA existe.
 *
 * No persiste nada (v1): todo se deriva al vuelo del historial de porras
 * (ScoringService) y del resumen del torneo. Por eso no requiere tablas nuevas.
 *
 * "Acierto" = una porra puntuada con puntos > 0 (marcador exacto = 3, resultado
 * correcto = 1). Las porras de partidos sin terminar (ruleCode PENDING) no
 * cuentan para rachas: aún no hay resultado.
 */
@Service
@RequiredArgsConstructor
public class AchievementService {

    private final ScoringService scoringService;

    @Transactional(readOnly = true)
    public AchievementSummaryResponse getAchievements(Long tournamentId, Long userId) {
        UserTournamentScoreResponse summary = scoringService.getUserScore(tournamentId, userId);

        // Solo porras ya puntuadas (partido terminado), en orden cronológico.
        // Usamos fixtureId asc como proxy de orden de juego: en el Mundial los
        // partidos están numerados en orden de calendario.
        List<PredictionScoreResponse> scored = scoringService.getPredictionScoreHistory(tournamentId, userId).stream()
                .filter(p -> !"PENDING".equals(p.ruleCode()))
                .sorted(Comparator.comparing(PredictionScoreResponse::fixtureId))
                .toList();

        int currentStreak = computeCurrentStreak(scored);
        int bestStreak    = computeBestStreak(scored);

        int totalPoints  = nz(summary.totalPoints());
        int exactScores  = nz(summary.exactScores());
        int matches      = nz(summary.matchesScored());
        int rankPosition = nz(summary.rankPosition());

        // Catálogo único (mismas reglas que usa el ranking de liga).
        List<AchievementResponse> achievements =
                AchievementCatalog.evaluate(exactScores, totalPoints, matches, rankPosition, bestStreak);

        int unlocked = (int) achievements.stream().filter(AchievementResponse::unlocked).count();

        return new AchievementSummaryResponse(
                currentStreak,
                bestStreak,
                totalPoints,
                exactScores,
                unlocked,
                achievements.size(),
                achievements
        );
    }

    // ─── Rachas ─────────────────────────────────────────────────────────────

    /** Aciertos seguidos contando desde la porra más reciente hacia atrás. */
    private int computeCurrentStreak(List<PredictionScoreResponse> scoredAsc) {
        int streak = 0;
        for (int i = scoredAsc.size() - 1; i >= 0; i--) {
            if (scoredAsc.get(i).pointsAwarded() > 0) streak++;
            else break;
        }
        return streak;
    }

    /** Racha de aciertos más larga del historial. */
    private int computeBestStreak(List<PredictionScoreResponse> scoredAsc) {
        int best = 0, run = 0;
        for (PredictionScoreResponse p : scoredAsc) {
            if (p.pointsAwarded() > 0) {
                run++;
                best = Math.max(best, run);
            } else {
                run = 0;
            }
        }
        return best;
    }

    // ─── Helpers ────────────────────────────────────────────────────────────

    private int nz(Integer v) {
        return v == null ? 0 : v;
    }
}
