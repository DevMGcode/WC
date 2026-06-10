package com.mundial2026.backend.scoring.service;

import com.mundial2026.backend.common.exception.ResourceNotFoundException;
import com.mundial2026.backend.common.response.PaginatedResponse;
import com.mundial2026.backend.league.api.dto.LeagueRankingResponse;
import com.mundial2026.backend.prediction.domain.UserPrediction;
import com.mundial2026.backend.prediction.repository.UserPredictionRepository;
import com.mundial2026.backend.scoring.api.dto.PredictionScoreResponse;
import com.mundial2026.backend.scoring.api.dto.UserRankPositionResponse;
import com.mundial2026.backend.scoring.api.dto.UserTournamentScoreResponse;
import com.mundial2026.backend.subscription.service.PremiumGuard;
import com.mundial2026.backend.tournament.domain.Fixture;
import com.mundial2026.backend.tournament.domain.FixtureStatus;
import com.mundial2026.backend.tournament.domain.Tournament;
import com.mundial2026.backend.user.domain.AppUser;
import com.mundial2026.backend.user.repository.AppUserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Method;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ScoringServiceTest {

    @Mock UserPredictionRepository userPredictionRepository;
    @Mock AppUserRepository appUserRepository;
    @Mock PremiumGuard premiumGuard;

    @InjectMocks ScoringService scoringService;

    // ── calculatePoints (via reflection — pure business logic) ────────────────

    @Test
    void calculatePoints_exactScore_returns3() throws Exception {
        assertThat(invokeCalculatePoints(2, 1, 2, 1)).isEqualTo(3);
    }

    @Test
    void calculatePoints_exactDraw_returns3() throws Exception {
        assertThat(invokeCalculatePoints(0, 0, 0, 0)).isEqualTo(3);
    }

    @Test
    void calculatePoints_correctWinnerHomeWin_returns1() throws Exception {
        assertThat(invokeCalculatePoints(3, 0, 1, 0)).isEqualTo(1);
    }

    @Test
    void calculatePoints_correctWinnerAwayWin_returns1() throws Exception {
        assertThat(invokeCalculatePoints(0, 2, 0, 4)).isEqualTo(1);
    }

    @Test
    void calculatePoints_correctWinnerDraw_returns1() throws Exception {
        assertThat(invokeCalculatePoints(1, 1, 2, 2)).isEqualTo(1);
    }

    @Test
    void calculatePoints_wrongResultEntirely_returns0() throws Exception {
        assertThat(invokeCalculatePoints(2, 0, 0, 1)).isEqualTo(0);
    }

    @Test
    void calculatePoints_predictedWinnerButActualDraw_returns0() throws Exception {
        assertThat(invokeCalculatePoints(2, 0, 1, 1)).isEqualTo(0);
    }

    // ── getPredictionScoreHistory (integration with mocked repository) ────────

    @Test
    void getPredictionScoreHistory_finishedFixtureExactScore_returnsPoints3() {
        AppUser user = buildUser(1L);
        Tournament tournament = buildTournament(1L);
        Fixture fixture = buildFinishedFixture(10L, tournament, 2, 1);

        UserPrediction prediction = buildPrediction(user, fixture, 2, 1);
        when(userPredictionRepository.findByUserIdAndFixtureTournamentIdOrderBySubmittedAtDesc(1L, 1L))
                .thenReturn(List.of(prediction));

        List<PredictionScoreResponse> history = scoringService.getPredictionScoreHistory(1L, 1L);

        assertThat(history).hasSize(1);
        assertThat(history.get(0).pointsAwarded()).isEqualTo(3);
        assertThat(history.get(0).ruleCode()).isEqualTo("EXACT_SCORE");
    }

    @Test
    void getPredictionScoreHistory_correctWinnerWrongScore_returnsPoints1() {
        AppUser user = buildUser(1L);
        Tournament tournament = buildTournament(1L);
        Fixture fixture = buildFinishedFixture(10L, tournament, 3, 0);

        UserPrediction prediction = buildPrediction(user, fixture, 1, 0);
        when(userPredictionRepository.findByUserIdAndFixtureTournamentIdOrderBySubmittedAtDesc(1L, 1L))
                .thenReturn(List.of(prediction));

        List<PredictionScoreResponse> history = scoringService.getPredictionScoreHistory(1L, 1L);

        assertThat(history.get(0).pointsAwarded()).isEqualTo(1);
        assertThat(history.get(0).ruleCode()).isEqualTo("WINNER_ONLY");
    }

    @Test
    void getPredictionScoreHistory_wrongPrediction_returnsPoints0() {
        AppUser user = buildUser(1L);
        Tournament tournament = buildTournament(1L);
        Fixture fixture = buildFinishedFixture(10L, tournament, 0, 2);

        UserPrediction prediction = buildPrediction(user, fixture, 2, 0);
        when(userPredictionRepository.findByUserIdAndFixtureTournamentIdOrderBySubmittedAtDesc(1L, 1L))
                .thenReturn(List.of(prediction));

        List<PredictionScoreResponse> history = scoringService.getPredictionScoreHistory(1L, 1L);

        assertThat(history.get(0).pointsAwarded()).isEqualTo(0);
        assertThat(history.get(0).ruleCode()).isEqualTo("PARTIAL");
    }

    @Test
    void getPredictionScoreHistory_pendingFixture_returnsPointsPending() {
        AppUser user = buildUser(1L);
        Tournament tournament = buildTournament(1L);

        Fixture fixture = new Fixture();
        fixture.setId(10L);
        fixture.setName("Brasil vs Argentina");
        fixture.setTournament(tournament);
        fixture.setStatus(FixtureStatus.SCHEDULED);
        fixture.setHomeScore(null);
        fixture.setAwayScore(null);

        UserPrediction prediction = buildPrediction(user, fixture, 1, 0);
        when(userPredictionRepository.findByUserIdAndFixtureTournamentIdOrderBySubmittedAtDesc(1L, 1L))
                .thenReturn(List.of(prediction));

        List<PredictionScoreResponse> history = scoringService.getPredictionScoreHistory(1L, 1L);

        assertThat(history.get(0).pointsAwarded()).isEqualTo(0);
        assertThat(history.get(0).ruleCode()).isEqualTo("PENDING");
    }

    @Test
    void getPredictionScoreHistory_noHistory_returnsEmptyList() {
        when(userPredictionRepository.findByUserIdAndFixtureTournamentIdOrderBySubmittedAtDesc(1L, 1L))
                .thenReturn(List.of());

        assertThat(scoringService.getPredictionScoreHistory(1L, 1L)).isEmpty();
    }

    // ── getUserScore ──────────────────────────────────────────────────────────

    @Test
    void getUserScore_userHasPredictions_returnsAccumulatedScore() {
        AppUser user = buildUser(1L);
        Tournament tournament = buildTournament(1L);
        Fixture fixture = buildFinishedFixture(10L, tournament, 2, 1);
        UserPrediction prediction = buildPrediction(user, fixture, 2, 1);

        when(userPredictionRepository.findByFixtureTournamentIdOrderBySubmittedAtDesc(1L))
                .thenReturn(List.of(prediction));

        UserTournamentScoreResponse score = scoringService.getUserScore(1L, 1L);

        assertThat(score.userId()).isEqualTo(1L);
        assertThat(score.totalPoints()).isEqualTo(3);
        assertThat(score.exactScores()).isEqualTo(1);
    }

    @Test
    void getUserScore_userNotInRanking_returnsEmptyScore() {
        AppUser user = buildUser(99L);
        when(userPredictionRepository.findByFixtureTournamentIdOrderBySubmittedAtDesc(1L))
                .thenReturn(List.of());
        when(appUserRepository.findById(99L)).thenReturn(Optional.of(user));

        UserTournamentScoreResponse score = scoringService.getUserScore(1L, 99L);

        assertThat(score.userId()).isEqualTo(99L);
        assertThat(score.totalPoints()).isEqualTo(0);
    }

    @Test
    void getUserScore_userNotFound_throwsException() {
        when(userPredictionRepository.findByFixtureTournamentIdOrderBySubmittedAtDesc(1L))
                .thenReturn(List.of());
        when(appUserRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> scoringService.getUserScore(1L, 999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── getGlobalRanking ──────────────────────────────────────────────────────

    @Test
    void getGlobalRanking_firstPage_returnsCorrectSlice() {
        AppUser user = buildUser(1L);
        Tournament tournament = buildTournament(1L);
        Fixture fixture = buildFinishedFixture(10L, tournament, 1, 0);
        UserPrediction prediction = buildPrediction(user, fixture, 1, 0);

        when(userPredictionRepository.findByFixtureTournamentIdOrderBySubmittedAtDesc(1L))
                .thenReturn(List.of(prediction));

        PaginatedResponse<UserTournamentScoreResponse> result = scoringService.getGlobalRanking(1L, 0, 10);

        assertThat(result.data()).hasSize(1);
        assertThat(result.pagination().total()).isEqualTo(1);
        assertThat(result.pagination().page()).isEqualTo(0);
    }

    @Test
    void getGlobalRanking_emptyRanking_returnsEmptyPage() {
        when(userPredictionRepository.findByFixtureTournamentIdOrderBySubmittedAtDesc(1L))
                .thenReturn(List.of());

        PaginatedResponse<UserTournamentScoreResponse> result = scoringService.getGlobalRanking(1L, 0, 10);

        assertThat(result.data()).isEmpty();
        assertThat(result.pagination().total()).isEqualTo(0);
        assertThat(result.pagination().totalPages()).isEqualTo(0);
    }

    @Test
    void getGlobalRanking_pageSizeZero_safelyHandled() {
        when(userPredictionRepository.findByFixtureTournamentIdOrderBySubmittedAtDesc(1L))
                .thenReturn(List.of());

        PaginatedResponse<UserTournamentScoreResponse> result = scoringService.getGlobalRanking(1L, 0, 0);

        assertThat(result.data()).isEmpty();
    }

    // ── getUserRankPosition ───────────────────────────────────────────────────

    @Test
    void getUserRankPosition_userInRanking_returnsCorrectPosition() {
        AppUser user1 = buildUser(1L);
        AppUser user2 = buildUser(2L);
        Tournament tournament = buildTournament(1L);
        Fixture fixture = buildFinishedFixture(10L, tournament, 2, 1);
        UserPrediction p1 = buildPrediction(user1, fixture, 2, 1); // exact → 3pts
        UserPrediction p2 = buildPrediction(user2, fixture, 1, 0); // winner → 1pt

        when(userPredictionRepository.findByFixtureTournamentIdOrderBySubmittedAtDesc(1L))
                .thenReturn(List.of(p1, p2));

        UserRankPositionResponse pos2 = scoringService.getUserRankPosition(1L, 2L);
        assertThat(pos2.rank()).isEqualTo(2);
        assertThat(pos2.totalUsers()).isEqualTo(2);
    }

    @Test
    void getUserRankPosition_userNotInRanking_returnsLastPlus1() {
        when(userPredictionRepository.findByFixtureTournamentIdOrderBySubmittedAtDesc(1L))
                .thenReturn(List.of());

        UserRankPositionResponse pos = scoringService.getUserRankPosition(1L, 999L);

        assertThat(pos.rank()).isEqualTo(1); // ranking.size()+1 = 0+1
        assertThat(pos.totalUsers()).isEqualTo(0);
    }

    // ── getLeagueRanking ──────────────────────────────────────────────────────

    @Test
    void getLeagueRanking_memberWithPredictions_returnsRankedList() {
        AppUser user = buildUser(1L);
        Tournament tournament = buildTournament(1L);
        Fixture fixture = buildFinishedFixture(10L, tournament, 2, 0);
        UserPrediction prediction = buildPrediction(user, fixture, 2, 0);

        when(userPredictionRepository.findByFixtureTournamentIdOrderBySubmittedAtDesc(1L))
                .thenReturn(List.of(prediction));
        // getOrDefault evaluates the default eagerly, so buildEmptyScore is always called
        when(appUserRepository.findById(1L)).thenReturn(Optional.of(user));

        List<LeagueRankingResponse> ranking = scoringService.getLeagueRanking(1L, 1L, List.of(1L));

        assertThat(ranking).hasSize(1);
        assertThat(ranking.get(0).userId()).isEqualTo(1L);
        assertThat(ranking.get(0).rankPosition()).isEqualTo(1);
        assertThat(ranking.get(0).totalPoints()).isEqualTo(3);
    }

    @Test
    void getLeagueRanking_memberWithoutPredictions_returnsEmptyScore() {
        AppUser user = buildUser(5L);
        when(userPredictionRepository.findByFixtureTournamentIdOrderBySubmittedAtDesc(1L))
                .thenReturn(List.of());
        when(appUserRepository.findById(5L)).thenReturn(Optional.of(user));

        List<LeagueRankingResponse> ranking = scoringService.getLeagueRanking(1L, 1L, List.of(5L));

        assertThat(ranking).hasSize(1);
        assertThat(ranking.get(0).totalPoints()).isEqualTo(0);
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private int invokeCalculatePoints(int ph, int pa, int ah, int aa) throws Exception {
        Method m = ScoringService.class.getDeclaredMethod(
                "calculatePoints", int.class, int.class, int.class, int.class);
        m.setAccessible(true);
        return (int) m.invoke(scoringService, ph, pa, ah, aa);
    }

    private AppUser buildUser(Long id) {
        AppUser u = new AppUser();
        u.setId(id);
        u.setUsername("player" + id);
        u.setFirstName("Player");
        u.setLastName("Test");
        return u;
    }

    private Tournament buildTournament(Long id) {
        Tournament t = new Tournament();
        t.setId(id);
        return t;
    }

    private Fixture buildFinishedFixture(Long id, Tournament tournament, int homeScore, int awayScore) {
        Fixture f = new Fixture();
        f.setId(id);
        f.setName("Fixture " + id);
        f.setTournament(tournament);
        f.setStatus(FixtureStatus.FINISHED);
        f.setHomeScore(homeScore);
        f.setAwayScore(awayScore);
        return f;
    }

    private UserPrediction buildPrediction(AppUser user, Fixture fixture, int homeScore, int awayScore) {
        UserPrediction p = new UserPrediction();
        p.setId(100L);
        p.setUser(user);
        p.setFixture(fixture);
        p.setTournament(fixture.getTournament());
        p.setPredictedHomeScore(homeScore);
        p.setPredictedAwayScore(awayScore);
        p.setSubmittedAt(OffsetDateTime.now().minusDays(1));
        p.setLockedAt(OffsetDateTime.now().minusHours(2));
        p.setIsLocked(false);
        return p;
    }
}
