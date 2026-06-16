package com.mundial2026.backend.push.service;

import com.mundial2026.backend.prediction.domain.UserPrediction;
import com.mundial2026.backend.prediction.repository.UserPredictionRepository;
import com.mundial2026.backend.tournament.domain.Fixture;
import com.mundial2026.backend.tournament.domain.FixtureStatus;
import com.mundial2026.backend.tournament.domain.Team;
import com.mundial2026.backend.tournament.repository.FixtureRepository;
import com.mundial2026.backend.user.domain.AppUser;
import com.mundial2026.backend.user.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Dispara las notificaciones push automáticas de la Fase C, respetando las
 * preferencias de cada usuario (los toggles de Configuración) y sin duplicar
 * (banderas reminder_notified / result_notified por partido).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationDispatchService {

    /** Cuánto antes del partido se manda el recordatorio (ventana hacia adelante). */
    private static final int REMINDER_WINDOW_MINUTES = 60;

    private final FixtureRepository fixtureRepository;
    private final AppUserRepository appUserRepository;
    private final UserPredictionRepository predictionRepository;
    private final PushService pushService;

    // ─── Recordatorio de partido ───────────────────────────────────────────────

    /**
     * Avisa a los usuarios cuyo equipo favorito juega dentro de ~1h
     * (y tienen el recordatorio activado). Marca el partido como notificado.
     */
    @Transactional
    public int dispatchMatchReminders() {
        OffsetDateTime now = OffsetDateTime.now();
        List<Fixture> upcoming = fixtureRepository
                .findByStatusAndReminderNotifiedFalseAndKickoffAtBetween(
                        FixtureStatus.SCHEDULED, now, now.plusMinutes(REMINDER_WINDOW_MINUTES));

        int total = 0;
        for (Fixture f : upcoming) {
            List<Long> teamIds = new ArrayList<>();
            if (f.getHomeTeam() != null) teamIds.add(f.getHomeTeam().getId());
            if (f.getAwayTeam() != null) teamIds.add(f.getAwayTeam().getId());

            if (!teamIds.isEmpty()) {
                List<AppUser> fans = appUserRepository
                        .findByFavoriteTeamIdInAndNotifyFixtureRemindersTrue(teamIds);
                String title = "⚽ " + teamName(f.getHomeTeam()) + " vs " + teamName(f.getAwayTeam());
                String body  = "Empieza pronto. ¿Ya hiciste tu porra?";
                String url   = "/fixtures/" + f.getId();
                for (AppUser fan : fans) {
                    total += pushService.sendToUser(fan.getId(), title, body, url);
                }
            }
            f.setReminderNotified(true);
        }
        if (total > 0) log.info("[Push] Recordatorios de partido enviados: {}", total);
        return total;
    }

    // ─── Resultado de partido ──────────────────────────────────────────────────

    /**
     * Avisa el resultado a quienes predijeron un partido ya finalizado
     * (y tienen el aviso de resultados activado), indicando sus puntos.
     */
    @Transactional
    public int dispatchResultNotifications() {
        List<Fixture> finished = fixtureRepository
                .findByStatusAndResultNotifiedFalseAndHomeScoreIsNotNullAndAwayScoreIsNotNull(
                        FixtureStatus.FINISHED);

        int total = 0;
        for (Fixture f : finished) {
            String scoreLine = teamName(f.getHomeTeam()) + " " + f.getHomeScore()
                    + "-" + f.getAwayScore() + " " + teamName(f.getAwayTeam());
            String url = "/fixtures/" + f.getId();

            for (UserPrediction p : predictionRepository.findByFixtureId(f.getId())) {
                AppUser user = p.getUser();
                if (user == null || !Boolean.TRUE.equals(user.getNotifyResultNotifications())) continue;

                int points = points(p.getPredictedHomeScore(), p.getPredictedAwayScore(),
                        f.getHomeScore(), f.getAwayScore());
                String body = switch (points) {
                    case 3 -> "🎯 ¡Marcador exacto! +3 pts";
                    case 1 -> "✅ Acertaste el resultado +1 pt";
                    default -> "❌ No acertaste esta vez";
                };
                total += pushService.sendToUser(user.getId(), scoreLine, body, url);
            }
            f.setResultNotified(true);
        }
        if (total > 0) log.info("[Push] Avisos de resultado enviados: {}", total);
        return total;
    }

    // ─── Helpers ────────────────────────────────────────────────────────────────

    /** Mismo cálculo que el scoring: exacto=3, resultado correcto=1, fallo=0. */
    private int points(int ph, int pa, int ah, int aa) {
        if (ph == ah && pa == aa) return 3;
        boolean predHome = ph > pa, predAway = pa > ph, predDraw = ph == pa;
        boolean realHome = ah > aa, realAway = aa > ah, realDraw = ah == aa;
        if ((predHome && realHome) || (predAway && realAway) || (predDraw && realDraw)) return 1;
        return 0;
    }

    private String teamName(Team team) {
        if (team == null) return "?";
        return team.getShortName() != null ? team.getShortName() : team.getName();
    }
}
