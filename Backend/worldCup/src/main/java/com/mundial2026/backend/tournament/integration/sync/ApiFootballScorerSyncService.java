package com.mundial2026.backend.tournament.integration.sync;

import com.mundial2026.backend.tournament.domain.Fixture;
import com.mundial2026.backend.tournament.domain.FixtureStatus;
import com.mundial2026.backend.tournament.domain.MatchEvent;
import com.mundial2026.backend.tournament.integration.port.ExternalMatchEvent;
import com.mundial2026.backend.tournament.integration.port.MatchEventDataPort;
import com.mundial2026.backend.tournament.repository.FixtureRepository;
import com.mundial2026.backend.tournament.repository.MatchEventRepository;
import com.mundial2026.backend.tournament.repository.TeamRepository;
import com.mundial2026.backend.tournament.service.MatchEventService;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;

/**
 * Persiste los goleadores (nombre + minuto) desde API-Football para partidos
 * FINALIZADOS recientes que aún no tengan eventos de fuente API en la BD.
 *
 * <p>Es el equivalente API-Football del flujo de football-data.org
 * ({@code ExternalFixtureService.syncScorersForRecentlyFinished}): delega en
 * {@link MatchEventService#syncFromApi} la comparación/corrección contra los
 * goles que el admin haya cargado manualmente.
 *
 * <p>NOTA: a propósito NO usa {@code CoverageService.canFetchEvents()}.
 * El 11/06/2026 (día inaugural) {@code /fixtures/events} ya devolvía los
 * eventos reales de los partidos del Mundial mientras {@code /leagues}
 * seguía declarando {@code coverage.fixtures.events=false} — metadato
 * desactualizado del proveedor que habría bloqueado este sync para siempre.
 * El gasto de cuota queda acotado por otras dos vías: solo se consultan
 * partidos finalizados en las últimas 24 h que aún no tengan eventos API,
 * y cada fixture tiene un cooldown de 30 min entre reintentos.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ApiFootballScorerSyncService {

    private final FixtureRepository fixtureRepository;
    private final TeamRepository teamRepository;
    private final MatchEventRepository matchEventRepository;
    private final MatchEventDataPort matchEventDataPort;
    private final MatchEventService matchEventService;

    /** Cooldown por fixture: si la API aún no publica eventos, reintentar a los 30 min. */
    private final Cache<Long, Boolean> recentlyAttempted = Caffeine.newBuilder()
            .expireAfterWrite(Duration.ofMinutes(30))
            .maximumSize(500)
            .build();

    @Transactional
    public void syncRecentlyFinished() {
        OffsetDateTime since = OffsetDateTime.now(ZoneOffset.UTC).minusHours(24);
        List<Fixture> candidates = fixtureRepository
                .findByStatusAndExternalProviderIdNotNullAndKickoffAtAfter(FixtureStatus.FINISHED, since);

        for (Fixture fixture : candidates) {
            if (recentlyAttempted.getIfPresent(fixture.getId()) != null) {
                continue;
            }
            recentlyAttempted.put(fixture.getId(), Boolean.TRUE);

            List<com.mundial2026.backend.tournament.domain.MatchEvent> existing =
                    matchEventRepository.findByFixtureIdAndSource(fixture.getId(), MatchEvent.Source.API);

            // Solo consideramos "ya sincronizados" los goles — las sustituciones
            // solo se capturan en vivo y pueden faltar aunque los goles ya estén.
            boolean goalsAlreadySynced = existing.stream()
                    .anyMatch(e -> "GOAL".equals(e.getEventType())
                            || "OWN_GOAL".equals(e.getEventType())
                            || "PENALTY_GOAL".equals(e.getEventType()));
            boolean subsAlreadySynced = existing.stream()
                    .anyMatch(e -> "SUBSTITUTION".equals(e.getEventType()));
            boolean shootoutAlreadySynced = existing.stream()
                    .anyMatch(e -> "SHOOTOUT_GOAL".equals(e.getEventType())
                            || "SHOOTOUT_MISSED".equals(e.getEventType()));
            boolean cardsAlreadySynced = existing.stream()
                    .anyMatch(e -> "YELLOW_CARD".equals(e.getEventType())
                            || "RED_CARD".equals(e.getEventType()));
            // La tanda solo se exige si el partido se definió por penales (homePenalty != null),
            // así no re-sincronizamos para siempre los partidos que no fueron a penales.
            boolean shootoutNeeded = fixture.getHomePenalty() != null && !shootoutAlreadySynced;
            boolean missingSomething = !goalsAlreadySynced || !subsAlreadySynced
                    || !cardsAlreadySynced || shootoutNeeded;

            // Ventana de reconciliación (~3h tras el final ≈ kickoff + 5h): dentro de ella
            // re-consultamos la API y REEMPLAZAMOS los eventos (refleja correcciones, cambios
            // y bajas). Fuera de la ventana solo rellenamos lo que falte, sin re-consultar de
            // más (cuida la cuota); a esa altura los datos del proveedor ya están firmes.
            boolean withinReconcileWindow = fixture.getKickoffAt() != null
                    && fixture.getKickoffAt().isAfter(OffsetDateTime.now(ZoneOffset.UTC).minusHours(5));

            if (withinReconcileWindow || missingSomething) {
                syncOne(fixture, withinReconcileWindow);
            }
        }
    }

    /**
     * Re-sincroniza los eventos de TODOS los partidos finalizados, SIN la ventana de
     * 24h y con reemplazo completo (reconcile=true). Pensado para disparo manual desde
     * el panel admin: completa partidos viejos que quedaron fuera de la ventana o que
     * no se capturaron en vivo. Devuelve la cantidad de partidos procesados.
     */
    @Transactional
    public int syncAllFinishedEvents() {
        List<Fixture> finished = fixtureRepository.findByStatus(FixtureStatus.FINISHED).stream()
                .filter(f -> f.getExternalProviderId() != null)
                .toList();
        int processed = 0;
        for (Fixture fixture : finished) {
            syncOne(fixture, true); // reconcile=true → reemplazo completo de eventos auto-capturados
            recentlyAttempted.put(fixture.getId(), Boolean.TRUE);
            processed++;
        }
        log.info("[ScorerSync/ApiFootball] Backfill manual de eventos: {} partidos finalizados procesados", processed);
        return processed;
    }

    private void syncOne(Fixture fixture, boolean reconcile) {
        try {
            List<ExternalMatchEvent> events =
                    matchEventDataPort.fetchEventsByFixture(fixture.getExternalProviderId());
            Long fid = fixture.getId();

            // Goles: syncFromApi ya reconcilia (reemplaza los de API / corrige los manuales).
            List<MatchEventService.ApiGoal> goals = events.stream()
                    .filter(e -> "goal".equalsIgnoreCase(e.type()))
                    .filter(e -> !e.isPenaltyShootout())
                    .filter(e -> e.detail() == null || !e.detail().toLowerCase().contains("missed"))
                    .filter(e -> e.playerName() != null)
                    .map(e -> new MatchEventService.ApiGoal(
                            e.playerName(), totalMinute(e), resolveInternalTeamId(e.teamId())))
                    .toList();
            if (!goals.isEmpty()) {
                matchEventService.syncFromApi(fid, goals);
            }

            // Reconciliación SEGURA: solo reemplazamos los tipos que la API REPORTA ahora
            // (>=1 evento). Si la API no devuelve un tipo (p.ej. dropea la tanda de penales,
            // cosa que API-Football hace de forma intermitente), NO lo borramos: evita perder
            // datos buenos por una respuesta parcial del proveedor.
            if (reconcile) {
                java.util.Set<String> typesToReplace = new java.util.HashSet<>();
                if (events.stream().anyMatch(e -> e.type() != null && e.type().toLowerCase().startsWith("subst")))
                    typesToReplace.add("SUBSTITUTION");
                if (events.stream().anyMatch(e -> "card".equalsIgnoreCase(e.type()))) {
                    typesToReplace.add("YELLOW_CARD");
                    typesToReplace.add("RED_CARD");
                }
                if (events.stream().anyMatch(ExternalMatchEvent::isPenaltyShootout)) {
                    typesToReplace.add("SHOOTOUT_GOAL");
                    typesToReplace.add("SHOOTOUT_MISSED");
                }
                if (events.stream().anyMatch(e -> "var".equalsIgnoreCase(e.type())))
                    typesToReplace.add("VAR_REVIEW");
                if (!typesToReplace.isEmpty()) {
                    matchEventService.deleteApiEventsOfTypes(fid, typesToReplace);
                }
            }

            // Sustituciones
            events.stream()
                    .filter(e -> e.type() != null && e.type().toLowerCase().startsWith("subst"))
                    .filter(e -> e.playerName() != null && !e.playerName().isBlank())
                    .forEach(sub -> matchEventService.persistLiveSub(fid, sub.playerName(),
                            sub.assistPlayerName(), resolveInternalTeamId(sub.teamId()),
                            sub.elapsedMinute(), sub.extraMinute()));

            // Tarjetas
            events.stream()
                    .filter(e -> "card".equalsIgnoreCase(e.type()))
                    .filter(e -> e.playerName() != null && !e.playerName().isBlank())
                    .forEach(c -> {
                        String d = c.detail() != null ? c.detail().toLowerCase() : "";
                        String type = d.contains("red") ? "RED_CARD" : "YELLOW_CARD";
                        matchEventService.persistLiveCard(fid, c.playerName(),
                                resolveInternalTeamId(c.teamId()), c.elapsedMinute(), c.extraMinute(), type);
                    });

            // Penales de tanda (type="Goal" + comments="Penalty Shootout")
            events.stream()
                    .filter(ExternalMatchEvent::isPenaltyShootout)
                    .filter(e -> e.playerName() != null && !e.playerName().isBlank())
                    .forEach(pen -> matchEventService.persistShootoutPenalty(fid, pen.playerName(),
                            resolveInternalTeamId(pen.teamId()), pen.elapsedMinute(), pen.extraMinute(),
                            pen.isMissedShootoutPenalty()));

            // VAR (type="Var": gol anulado, penal revisado…)
            events.stream()
                    .filter(e -> "var".equalsIgnoreCase(e.type()))
                    .forEach(v -> matchEventService.persistVarReview(fid, v.playerName(),
                            resolveInternalTeamId(v.teamId()), v.elapsedMinute(), v.extraMinute(), v.detail()));

            // Re-sincroniza el marcador de la tanda (home_penalty/away_penalty) desde los
            // goles de tanda ya persistidos, para que el encabezado "Penales X-Y" SIEMPRE
            // coincida con la tarjeta de penales. Corrige el caso en que el score.penalty
            // se capturó a media tanda (p.ej. 2-3) y no se actualizó al final (2-4).
            reconcilePenaltyScoreFromEvents(fixture);

            log.info("[ScorerSync/ApiFootball] Eventos sincronizados (reconcile={}) para fixture {} (extId={})",
                    reconcile, fid, fixture.getExternalProviderId());
        } catch (Exception ex) {
            log.warn("[ScorerSync/ApiFootball] Error al sincronizar eventos para extId={}: {}",
                    fixture.getExternalProviderId(), ex.getMessage());
        }
    }

    /**
     * Ajusta el marcador de la tanda del fixture (home_penalty / away_penalty) al conteo
     * REAL de goles de tanda (SHOOTOUT_GOAL) por equipo. Solo actúa si el partido tuvo
     * tanda (hay eventos de tanda); nunca la borra. Garantiza que el encabezado coincida
     * con la tarjeta y evita que el marcador quede pegado a un valor de media tanda.
     */
    private void reconcilePenaltyScoreFromEvents(Fixture fixture) {
        List<MatchEvent> events = matchEventRepository.findByFixtureIdAndSource(fixture.getId(), MatchEvent.Source.API);
        boolean hadShootout = events.stream().anyMatch(e ->
                "SHOOTOUT_GOAL".equals(e.getEventType()) || "SHOOTOUT_MISSED".equals(e.getEventType()));
        if (!hadShootout) return; // no fue a penales → no tocar el marcador

        Long homeId = fixture.getHomeTeam() != null ? fixture.getHomeTeam().getId() : null;
        Long awayId = fixture.getAwayTeam() != null ? fixture.getAwayTeam().getId() : null;
        int home = (int) events.stream().filter(e -> "SHOOTOUT_GOAL".equals(e.getEventType())
                && e.getTeam() != null && e.getTeam().getId().equals(homeId)).count();
        int away = (int) events.stream().filter(e -> "SHOOTOUT_GOAL".equals(e.getEventType())
                && e.getTeam() != null && e.getTeam().getId().equals(awayId)).count();

        boolean changed = false;
        if (!Integer.valueOf(home).equals(fixture.getHomePenalty())) { fixture.setHomePenalty(home); changed = true; }
        if (!Integer.valueOf(away).equals(fixture.getAwayPenalty())) { fixture.setAwayPenalty(away); changed = true; }
        if (changed) {
            fixtureRepository.save(fixture);
            log.info("[ScorerSync/ApiFootball] Marcador de penales re-sincronizado (fixture {}): {}-{}",
                    fixture.getId(), home, away);
        }
    }

    /** 90' + 3 de adición → 93. MatchEvent guarda un solo minuto. */
    private Integer totalMinute(ExternalMatchEvent e) {
        if (e.elapsedMinute() == null) return null;
        return e.elapsedMinute() + (e.extraMinute() != null ? e.extraMinute() : 0);
    }

    /** MatchEventService.resolveTeam espera el id INTERNO del equipo, no el de la API. */
    private Long resolveInternalTeamId(Long externalTeamId) {
        if (externalTeamId == null) return null;
        return teamRepository.findByExternalProviderId(externalTeamId)
                .map(t -> t.getId())
                .orElse(null);
    }
}
