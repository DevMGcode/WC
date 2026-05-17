package com.mundial2026.backend.prediction.service;

import com.mundial2026.backend.common.exception.BusinessRuleException;
import com.mundial2026.backend.common.exception.ResourceNotFoundException;
import com.mundial2026.backend.prediction.api.dto.CreatePredictionRequest;
import com.mundial2026.backend.prediction.api.dto.UpdatePredictionRequest;
import com.mundial2026.backend.prediction.domain.UserPrediction;
import com.mundial2026.backend.prediction.repository.UserPredictionRepository;
import com.mundial2026.backend.tournament.domain.Fixture;
import com.mundial2026.backend.tournament.domain.Team;
import com.mundial2026.backend.tournament.domain.Tournament;
import com.mundial2026.backend.tournament.repository.FixtureRepository;
import com.mundial2026.backend.user.domain.AppUser;
import com.mundial2026.backend.user.repository.AppUserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PredictionServiceTest {

    @Mock UserPredictionRepository userPredictionRepository;
    @Mock AppUserRepository appUserRepository;
    @Mock FixtureRepository fixtureRepository;

    @InjectMocks PredictionService predictionService;

    // ── create ────────────────────────────────────────────────────────────────

    @Test
    void create_validRequest_returnsNewPrediction() {
        var req = new CreatePredictionRequest(1L, 10L, 2, 1);

        when(userPredictionRepository.findByUserIdAndFixtureId(1L, 10L)).thenReturn(Optional.empty());
        when(appUserRepository.findById(1L)).thenReturn(Optional.of(buildUser(1L)));
        when(fixtureRepository.findById(10L)).thenReturn(Optional.of(buildOpenFixture(10L)));
        when(userPredictionRepository.save(any(UserPrediction.class))).thenAnswer(inv -> inv.getArgument(0));

        UserPrediction result = predictionService.create(req);

        assertThat(result.getPredictedHomeScore()).isEqualTo(2);
        assertThat(result.getPredictedAwayScore()).isEqualTo(1);
        assertThat(result.getIsLocked()).isFalse();
    }

    @Test
    void create_homeWin_resolvesPredictedWinnerToHomeTeam() {
        Fixture fixture = buildOpenFixture(10L);
        var req = new CreatePredictionRequest(1L, 10L, 3, 0);

        when(userPredictionRepository.findByUserIdAndFixtureId(1L, 10L)).thenReturn(Optional.empty());
        when(appUserRepository.findById(1L)).thenReturn(Optional.of(buildUser(1L)));
        when(fixtureRepository.findById(10L)).thenReturn(Optional.of(fixture));
        when(userPredictionRepository.save(any(UserPrediction.class))).thenAnswer(inv -> inv.getArgument(0));

        UserPrediction result = predictionService.create(req);

        assertThat(result.getPredictedWinnerTeam()).isEqualTo(fixture.getHomeTeam());
    }

    @Test
    void create_draw_predictedWinnerIsNull() {
        var req = new CreatePredictionRequest(1L, 10L, 1, 1);

        when(userPredictionRepository.findByUserIdAndFixtureId(1L, 10L)).thenReturn(Optional.empty());
        when(appUserRepository.findById(1L)).thenReturn(Optional.of(buildUser(1L)));
        when(fixtureRepository.findById(10L)).thenReturn(Optional.of(buildOpenFixture(10L)));
        when(userPredictionRepository.save(any(UserPrediction.class))).thenAnswer(inv -> inv.getArgument(0));

        UserPrediction result = predictionService.create(req);

        assertThat(result.getPredictedWinnerTeam()).isNull();
    }

    @Test
    void create_duplicatePrediction_throwsBusinessRule() {
        when(userPredictionRepository.findByUserIdAndFixtureId(1L, 10L))
                .thenReturn(Optional.of(new UserPrediction()));

        assertThatThrownBy(() -> predictionService.create(new CreatePredictionRequest(1L, 10L, 1, 0)))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("ya tiene una porra");
    }

    @Test
    void create_userNotFound_throwsResourceNotFound() {
        when(userPredictionRepository.findByUserIdAndFixtureId(1L, 10L)).thenReturn(Optional.empty());
        when(appUserRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> predictionService.create(new CreatePredictionRequest(1L, 10L, 1, 0)))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Usuario");
    }

    @Test
    void create_fixtureNotFound_throwsResourceNotFound() {
        when(userPredictionRepository.findByUserIdAndFixtureId(1L, 10L)).thenReturn(Optional.empty());
        when(appUserRepository.findById(1L)).thenReturn(Optional.of(buildUser(1L)));
        when(fixtureRepository.findById(10L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> predictionService.create(new CreatePredictionRequest(1L, 10L, 1, 0)))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Partido");
    }

    @Test
    void create_lockedFixture_throwsBusinessRule() {
        Fixture locked = buildOpenFixture(10L);
        locked.setPredictionLockedAt(OffsetDateTime.now().minusMinutes(10));

        when(userPredictionRepository.findByUserIdAndFixtureId(1L, 10L)).thenReturn(Optional.empty());
        when(appUserRepository.findById(1L)).thenReturn(Optional.of(buildUser(1L)));
        when(fixtureRepository.findById(10L)).thenReturn(Optional.of(locked));

        assertThatThrownBy(() -> predictionService.create(new CreatePredictionRequest(1L, 10L, 2, 0)))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("bloqueada");
    }

    // ── update ────────────────────────────────────────────────────────────────

    @Test
    void update_validRequest_updatesScores() {
        UserPrediction existing = buildSavedPrediction(5L, buildOpenFixture(10L));
        when(userPredictionRepository.findWithUserAndFixtureById(5L)).thenReturn(Optional.of(existing));
        when(userPredictionRepository.save(any(UserPrediction.class))).thenAnswer(inv -> inv.getArgument(0));

        UserPrediction result = predictionService.update(5L, new UpdatePredictionRequest(0, 2));

        assertThat(result.getPredictedHomeScore()).isEqualTo(0);
        assertThat(result.getPredictedAwayScore()).isEqualTo(2);
    }

    @Test
    void update_lockedPrediction_throwsBusinessRule() {
        Fixture locked = buildOpenFixture(10L);
        locked.setPredictionLockedAt(OffsetDateTime.now().minusMinutes(5));
        UserPrediction existing = buildSavedPrediction(5L, locked);
        existing.setLockedAt(OffsetDateTime.now().minusMinutes(5));

        when(userPredictionRepository.findWithUserAndFixtureById(5L)).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> predictionService.update(5L, new UpdatePredictionRequest(1, 1)))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("bloqueada");
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private AppUser buildUser(Long id) {
        AppUser u = new AppUser();
        u.setId(id);
        u.setUsername("player" + id);
        u.setFirstName("Player");
        u.setLastName("Test");
        return u;
    }

    private Fixture buildOpenFixture(Long id) {
        Tournament tournament = new Tournament();
        tournament.setId(1L);

        Team home = new Team();
        home.setId(1L);
        home.setName("Brasil");

        Team away = new Team();
        away.setId(2L);
        away.setName("Argentina");

        Fixture f = new Fixture();
        f.setId(id);
        f.setName("Brasil vs Argentina");
        f.setTournament(tournament);
        f.setHomeTeam(home);
        f.setAwayTeam(away);
        f.setKickoffAt(OffsetDateTime.now().plusHours(2));
        f.setPredictionLockedAt(OffsetDateTime.now().plusHours(1));
        return f;
    }

    private UserPrediction buildSavedPrediction(Long id, Fixture fixture) {
        UserPrediction p = new UserPrediction();
        p.setId(id);
        p.setUser(buildUser(1L));
        p.setFixture(fixture);
        p.setTournament(fixture.getTournament());
        p.setPredictedHomeScore(1);
        p.setPredictedAwayScore(0);
        p.setSubmittedAt(OffsetDateTime.now().minusMinutes(30));
        p.setLockedAt(fixture.getPredictionLockedAt());
        p.setIsLocked(false);
        return p;
    }
}
