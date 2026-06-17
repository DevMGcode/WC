package com.mundial2026.backend.push.service;

import com.mundial2026.backend.prediction.domain.UserPrediction;
import com.mundial2026.backend.prediction.repository.UserPredictionRepository;
import com.mundial2026.backend.tournament.domain.Fixture;
import com.mundial2026.backend.tournament.domain.FixtureStatus;
import com.mundial2026.backend.tournament.domain.Team;
import com.mundial2026.backend.tournament.repository.FixtureRepository;
import com.mundial2026.backend.user.domain.AppUser;
import com.mundial2026.backend.user.repository.AppUserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotificationDispatchServiceTest {

    @Mock FixtureRepository fixtureRepository;
    @Mock AppUserRepository appUserRepository;
    @Mock UserPredictionRepository predictionRepository;
    @Mock PushService pushService;

    @InjectMocks NotificationDispatchService service;

    // ── Recordatorios ───────────────────────────────────────────────────────

    @Test
    void matchReminders_sendsToFansAndMarksNotified() {
        Fixture f = fixture(10L, team(1L, "ARG"), team(2L, "BRA"), null, null, FixtureStatus.SCHEDULED);
        when(fixtureRepository.findByStatusAndReminderNotifiedFalseAndKickoffAtBetween(
                eq(FixtureStatus.SCHEDULED), any(), any())).thenReturn(List.of(f));
        AppUser fan = user(7L, true, true);
        when(appUserRepository.findByFavoriteTeamIdInAndNotifyFixtureRemindersTrue(anyList()))
                .thenReturn(List.of(fan));
        when(pushService.sendToUser(eq(7L), any(), any(), any())).thenReturn(1);

        int sent = service.dispatchMatchReminders();

        assertThat(sent).isEqualTo(1);
        verify(pushService).sendToUser(eq(7L), contains("ARG"), any(), eq("/fixtures/10"));
        assertThat(f.getReminderNotified()).isTrue();
    }

    // ── Resultados ──────────────────────────────────────────────────────────

    @Test
    void resultNotifications_sendsExactToPredictorAndMarksNotified() {
        Fixture f = fixture(20L, team(1L, "ESP"), team(2L, "POR"), 2, 1, FixtureStatus.FINISHED);
        when(fixtureRepository.findByStatusAndResultNotifiedFalseAndHomeScoreIsNotNullAndAwayScoreIsNotNull(
                FixtureStatus.FINISHED)).thenReturn(List.of(f));
        // Predictor con marcador EXACTO 2-1 y toggle activado → +3 pts
        when(predictionRepository.findByFixtureId(20L)).thenReturn(List.of(
                prediction(user(7L, true, true), 2, 1)));
        when(pushService.sendToUser(eq(7L), any(), any(), any())).thenReturn(1);

        int sent = service.dispatchResultNotifications();

        assertThat(sent).isEqualTo(1);
        verify(pushService).sendToUser(eq(7L), contains("ESP"), contains("exacto"), eq("/fixtures/20"));
        assertThat(f.getResultNotified()).isTrue();
    }

    @Test
    void resultNotifications_skipsUsersWithToggleOff() {
        Fixture f = fixture(20L, team(1L, "ESP"), team(2L, "POR"), 2, 1, FixtureStatus.FINISHED);
        when(fixtureRepository.findByStatusAndResultNotifiedFalseAndHomeScoreIsNotNullAndAwayScoreIsNotNull(
                FixtureStatus.FINISHED)).thenReturn(List.of(f));
        // Predictor con el aviso de resultados DESACTIVADO → no se le envía
        when(predictionRepository.findByFixtureId(20L)).thenReturn(List.of(
                prediction(user(8L, true, false), 2, 1)));

        int sent = service.dispatchResultNotifications();

        assertThat(sent).isZero();
        verify(pushService, never()).sendToUser(eq(8L), any(), any(), any());
        assertThat(f.getResultNotified()).isTrue(); // igual se marca para no reintentar
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private Team team(Long id, String shortName) {
        Team t = new Team();
        t.setId(id);
        t.setShortName(shortName);
        return t;
    }

    private Fixture fixture(Long id, Team home, Team away, Integer hs, Integer as, FixtureStatus st) {
        Fixture f = new Fixture();
        f.setId(id);
        f.setHomeTeam(home);
        f.setAwayTeam(away);
        f.setHomeScore(hs);
        f.setAwayScore(as);
        f.setStatus(st);
        f.setKickoffAt(OffsetDateTime.now().plusMinutes(30));
        f.setReminderNotified(false);
        f.setResultNotified(false);
        return f;
    }

    private AppUser user(Long id, boolean reminders, boolean results) {
        AppUser u = new AppUser();
        u.setId(id);
        u.setNotifyFixtureReminders(reminders);
        u.setNotifyResultNotifications(results);
        return u;
    }

    private UserPrediction prediction(AppUser user, int ph, int pa) {
        UserPrediction p = new UserPrediction();
        p.setUser(user);
        p.setPredictedHomeScore(ph);
        p.setPredictedAwayScore(pa);
        return p;
    }
}
