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

            if (!goalsAlreadySynced || !subsAlreadySynced) {
                syncOne(fixture, !goalsAlreadySynced, !subsAlreadySynced);
            }
        }
    }

    private void syncOne(Fixture fixture, boolean syncGoals, boolean syncSubs) {
        try {
            List<ExternalMatchEvent> events =
                    matchEventDataPort.fetchEventsByFixture(fixture.getExternalProviderId());

            if (syncGoals) {
                List<MatchEventService.ApiGoal> goals = events.stream()
                        .filter(e -> "goal".equalsIgnoreCase(e.type()))
                        .filter(e -> !e.isPenaltyShootout())
                        .filter(e -> e.detail() == null || !e.detail().toLowerCase().contains("missed"))
                        .filter(e -> e.playerName() != null)
                        .map(e -> new MatchEventService.ApiGoal(
                                e.playerName(),
                                totalMinute(e),
                                resolveInternalTeamId(e.teamId())))
                        .toList();

                if (!goals.isEmpty()) {
                    matchEventService.syncFromApi(fixture.getId(), goals);
                    log.info("[ScorerSync/ApiFootball] {} goles sincronizados para fixture {} (extId={})",
                            goals.size(), fixture.getId(), fixture.getExternalProviderId());
                }
            }

            if (syncSubs) {
                List<ExternalMatchEvent> subs = events.stream()
                        .filter(e -> e.type() != null && e.type().toLowerCase().startsWith("subst"))
                        .filter(e -> e.playerName() != null && !e.playerName().isBlank())
                        .toList();

                for (ExternalMatchEvent sub : subs) {
                    Long teamId = resolveInternalTeamId(sub.teamId());
                    matchEventService.persistLiveSub(fixture.getId(), sub.playerName(),
                            sub.assistPlayerName(), teamId, totalMinute(sub));
                }
                if (!subs.isEmpty()) {
                    log.info("[ScorerSync/ApiFootball] {} sustituciones sincronizadas para fixture {} (extId={})",
                            subs.size(), fixture.getId(), fixture.getExternalProviderId());
                }
            }
        } catch (Exception ex) {
            log.warn("[ScorerSync/ApiFootball] Error al sincronizar eventos para extId={}: {}",
                    fixture.getExternalProviderId(), ex.getMessage());
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
