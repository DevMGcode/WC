package com.mundial2026.backend.scoring.service;

import com.mundial2026.backend.prediction.domain.UserPrediction;
import com.mundial2026.backend.prediction.repository.UserPredictionRepository;
import com.mundial2026.backend.scoring.api.dto.PredictionScoreResponse;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ScoringServiceTest {

    @Mock UserPredictionRepository userPredictionRepository;
    @Mock AppUserRepository appUserRepository;

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
