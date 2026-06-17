package com.mundial2026.backend.achievement.service;

import com.mundial2026.backend.achievement.api.dto.AchievementResponse;
import com.mundial2026.backend.achievement.api.dto.AchievementSummaryResponse;
import com.mundial2026.backend.scoring.api.dto.PredictionScoreResponse;
import com.mundial2026.backend.scoring.api.dto.UserTournamentScoreResponse;
import com.mundial2026.backend.scoring.service.ScoringService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

/**
 * Tests del cálculo de rachas y logros (todo derivado del scoring existente).
 */
@ExtendWith(MockitoExtension.class)
class AchievementServiceTest {

    @Mock ScoringService scoringService;
    @InjectMocks AchievementService achievementService;

    private static final Long TID = 1L;
    private static final Long UID = 7L;

    // ─── Rachas ─────────────────────────────────────────────────────────────

    @Test
    void currentStreak_countsConsecutiveHitsFromMostRecent() {
        // Orden por fixtureId asc (cronológico): ✓ ✗ ✓ ✓ ✓  → racha actual = 3, mejor = 3
        when(scoringService.getUserScore(TID, UID)).thenReturn(summary(0, 0, 5, 0));
        when(scoringService.getPredictionScoreHistory(TID, UID)).thenReturn(List.of(
                scored(10L, 3, "EXACT_SCORE"),
                scored(11L, 0, "PARTIAL"),
                scored(12L, 1, "WINNER_ONLY"),
                scored(13L, 3, "EXACT_SCORE"),
                scored(14L, 1, "WINNER_ONLY")
        ));

        AchievementSummaryResponse r = achievementService.getAchievements(TID, UID);

        assertThat(r.currentStreak()).isEqualTo(3);
        assertThat(r.bestStreak()).isEqualTo(3);
    }

    @Test
    void currentStreak_isZeroWhenLastPredictionFailed() {
        when(scoringService.getUserScore(TID, UID)).thenReturn(summary(0, 0, 2, 0));
        when(scoringService.getPredictionScoreHistory(TID, UID)).thenReturn(List.of(
                scored(10L, 3, "EXACT_SCORE"),
                scored(11L, 0, "PARTIAL")
        ));

        AchievementSummaryResponse r = achievementService.getAchievements(TID, UID);

        assertThat(r.currentStreak()).isZero();
        assertThat(r.bestStreak()).isEqualTo(1);
    }

    @Test
    void pendingPredictions_doNotCountForStreaks() {
        // La porra PENDING (partido sin terminar) no rompe ni cuenta en la racha.
        when(scoringService.getUserScore(TID, UID)).thenReturn(summary(0, 0, 2, 0));
        when(scoringService.getPredictionScoreHistory(TID, UID)).thenReturn(List.of(
                scored(10L, 1, "WINNER_ONLY"),
                scored(11L, 3, "EXACT_SCORE"),
                scored(99L, 0, "PENDING")
        ));

        AchievementSummaryResponse r = achievementService.getAchievements(TID, UID);

        assertThat(r.currentStreak()).isEqualTo(2);
        assertThat(r.bestStreak()).isEqualTo(2);
    }

    // ─── Logros ─────────────────────────────────────────────────────────────

    @Test
    void exactScoreAchievements_unlockByThreshold() {
        // 5 exactas → "Primera sangre" y "Francotirador" desbloqueados, "Profeta" no (10).
        when(scoringService.getUserScore(TID, UID)).thenReturn(summary(15, 5, 5, 0));
        when(scoringService.getPredictionScoreHistory(TID, UID)).thenReturn(List.of());

        AchievementSummaryResponse r = achievementService.getAchievements(TID, UID);

        assertThat(unlocked(r, "FIRST_BLOOD")).isTrue();
        assertThat(unlocked(r, "SNIPER")).isTrue();
        assertThat(unlocked(r, "PROPHET")).isFalse();
        assertThat(find(r, "PROPHET").current()).isEqualTo(5);   // progreso 5/10
        assertThat(find(r, "PROPHET").target()).isEqualTo(10);
    }

    @Test
    void rankAchievements_unlockByPodiumPosition() {
        // rankPosition = 1 → "Al podio" (top 3) y "Líder" (#1) desbloqueados.
        when(scoringService.getUserScore(TID, UID)).thenReturn(summaryWithRank(1));
        when(scoringService.getPredictionScoreHistory(TID, UID)).thenReturn(List.of());

        AchievementSummaryResponse r = achievementService.getAchievements(TID, UID);

        assertThat(unlocked(r, "PODIUM")).isTrue();
        assertThat(unlocked(r, "LEADER")).isTrue();
    }

    @Test
    void rankAchievements_lockedWhenNoMatchesPlayed() {
        // Usuario sin porras: el rankPosition placeholder (1) NO debe desbloquear
        // podio/líder. Regla: sin partidos jugados no hay posición real.
        when(scoringService.getUserScore(TID, UID)).thenReturn(new UserTournamentScoreResponse(
                UID, "user", "User Test", TID,
                0, 0, 0, 0, 0, 1,   // matchesScored=0 pero rankPosition=1 (placeholder)
                OffsetDateTime.now(), false));
        when(scoringService.getPredictionScoreHistory(TID, UID)).thenReturn(List.of());

        AchievementSummaryResponse r = achievementService.getAchievements(TID, UID);

        assertThat(unlocked(r, "PODIUM")).isFalse();
        assertThat(unlocked(r, "LEADER")).isFalse();
    }

    @Test
    void leader_lockedWhenNotFirst() {
        when(scoringService.getUserScore(TID, UID)).thenReturn(summaryWithRank(3));
        when(scoringService.getPredictionScoreHistory(TID, UID)).thenReturn(List.of());

        AchievementSummaryResponse r = achievementService.getAchievements(TID, UID);

        assertThat(unlocked(r, "PODIUM")).isTrue();  // top 3 sí
        assertThat(unlocked(r, "LEADER")).isFalse(); // #1 no
    }

    @Test
    void unlockedCount_matchesUnlockedAchievements() {
        when(scoringService.getUserScore(TID, UID)).thenReturn(summary(100, 10, 10, 0));
        when(scoringService.getPredictionScoreHistory(TID, UID)).thenReturn(List.of(
                scored(10L, 3, "EXACT_SCORE"),
                scored(11L, 3, "EXACT_SCORE"),
                scored(12L, 1, "WINNER_ONLY")
        ));

        AchievementSummaryResponse r = achievementService.getAchievements(TID, UID);

        long actualUnlocked = r.achievements().stream().filter(AchievementResponse::unlocked).count();
        assertThat(r.unlockedCount()).isEqualTo((int) actualUnlocked);
        assertThat(r.totalCount()).isEqualTo(r.achievements().size());
    }

    // ─── Helpers ────────────────────────────────────────────────────────────

    private boolean unlocked(AchievementSummaryResponse r, String code) {
        return find(r, code).unlocked();
    }

    private AchievementResponse find(AchievementSummaryResponse r, String code) {
        return r.achievements().stream()
                .filter(a -> a.code().equals(code))
                .findFirst()
                .orElseThrow(() -> new AssertionError("Logro no encontrado: " + code));
    }

    private UserTournamentScoreResponse summary(int totalPoints, int exactScores, int matches, int winnerHits) {
        return new UserTournamentScoreResponse(
                UID, "user", "User Test", TID,
                totalPoints, exactScores, winnerHits, 0, matches, 0,
                OffsetDateTime.now(), false
        );
    }

    private UserTournamentScoreResponse summaryWithRank(int rankPosition) {
        return new UserTournamentScoreResponse(
                UID, "user", "User Test", TID,
                10, 1, 1, 0, 3, rankPosition,
                OffsetDateTime.now(), false
        );
    }

    private PredictionScoreResponse scored(Long fixtureId, int points, String ruleCode) {
        return new PredictionScoreResponse(
                fixtureId, UID, "user", fixtureId, "Match " + fixtureId, TID,
                points, ruleCode, OffsetDateTime.now()
        );
    }
}
