package com.mundial2026.backend.tournament.integration.sync;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.mundial2026.backend.realtime.event.FixtureEventOccurredEvent;
import com.mundial2026.backend.realtime.payload.MatchEvent;
import com.mundial2026.backend.tournament.domain.Fixture;
import com.mundial2026.backend.tournament.domain.FixtureStatus;
import com.mundial2026.backend.tournament.domain.Team;
import com.mundial2026.backend.tournament.integration.port.ExternalMatchEvent;
import com.mundial2026.backend.tournament.integration.port.MatchEventDataPort;
import com.mundial2026.backend.tournament.repository.FixtureRepository;
import com.mundial2026.backend.tournament.repository.TeamRepository;
import com.mundial2026.backend.tournament.service.MatchEventService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

/**
 * Polls in-match events for fixtures currently LIVE.
 * Dedups in memory with Caffeine (TTL 6h, capped 20k entries) so restarts will
 * re-emit recent events at most once — tolerable for a UI timeline.
 *
 * <p>Self-gating: en lugar de un flag manual de Spring, este servicio consulta
 * {@link CoverageService#canFetchEvents()}. Cuando API-Football declara
 * {@code coverage.events=false} para la temporada activa (caso típico
 * pre-Mundial), el poll devuelve vacío sin tocar la API. Cuando el proveedor
 * activa el flag (el día del kick-off), el polling arranca solo sin
 * intervención manual ni redeploy.
 *
 * <p>Persistencia: los goles detectados durante el polling también se guardan
 * en la tabla match_event (source=API, verified=false) para que cualquier
 * cliente que abra la página después del gol lo vea sin depender del WebSocket.
 */
@Service
@Slf4j
public class LiveEventPollingService {

    private final FixtureRepository fixtureRepository;
    private final MatchEventDataPort matchEventDataPort;
    private final ApplicationEventPublisher events;
    private final CoverageService coverageService;
    private final TeamRepository teamRepository;
    private final MatchEventService matchEventService;

    private final Cache<String, Boolean> seenEvents;

    public LiveEventPollingService(FixtureRepository fixtureRepository,
                                   MatchEventDataPort matchEventDataPort,
                                   ApplicationEventPublisher events,
                                   CoverageService coverageService,
                                   TeamRepository teamRepository,
                                   MatchEventService matchEventService) {
        this.fixtureRepository = fixtureRepository;
        this.matchEventDataPort = matchEventDataPort;
        this.events = events;
        this.coverageService = coverageService;
        this.teamRepository = teamRepository;
        this.matchEventService = matchEventService;
        this.seenEvents = Caffeine.newBuilder()
                .expireAfterWrite(Duration.ofHours(6))
                .maximumSize(20000)
                .build();
    }

    public PollResult pollAllLive() {
        // Auto-gate por cobertura declarada por API-Football. Pre-Mundial el
        // proveedor reporta coverage.events=false → cero llamadas. El día del
        // kick-off lo flipea a true y este método empieza a llamar solo.
        if (!coverageService.canFetchEvents()) {
            return new PollResult(0, 0);
        }
        List<Fixture> liveFixtures = fixtureRepository.findByStatusOrderByKickoffAtAsc(FixtureStatus.LIVE);
        int polled = 0;
        int published = 0;
        for (Fixture f : liveFixtures) {
            if (f.getExternalProviderId() == null) {
                continue;
            }
            try {
                List<ExternalMatchEvent> apiEvents = matchEventDataPort.fetchEventsByFixture(f.getExternalProviderId());
                polled++;
                for (ExternalMatchEvent ext : apiEvents) {
                    String key = ext.dedupKey(f.getExternalProviderId());
                    if (seenEvents.getIfPresent(key) == null) {
                        seenEvents.put(key, Boolean.TRUE);
                        MatchEvent.Type mappedType = mapType(ext);
                        events.publishEvent(new FixtureEventOccurredEvent(toPayload(f.getId(), ext, mappedType)));
                        published++;
                        persistGoalIfNeeded(f.getId(), ext, mappedType);
                    }
                }
            } catch (Exception ex) {
                log.warn("Failed to poll events for fixture extId={}: {}",
                        f.getExternalProviderId(), ex.getMessage());
            }
        }
        if (published > 0 || polled > 0) {
            log.debug("Live event polling: polled={}, published={}", polled, published);
        }
        return new PollResult(polled, published);
    }

    /** Persiste en BD solo los goles (no tarjetas ni sustituciones) para que
     *  clientes que abran la página después del gol lo vean sin WebSocket. */
    private void persistGoalIfNeeded(Long fixtureId, ExternalMatchEvent ext, MatchEvent.Type mappedType) {
        if (mappedType != MatchEvent.Type.GOAL
                && mappedType != MatchEvent.Type.OWN_GOAL
                && mappedType != MatchEvent.Type.PENALTY_GOAL) {
            return;
        }
        if (ext.playerName() == null || ext.playerName().isBlank()) return;

        Long internalTeamId = resolveInternalTeamId(ext.teamId());
        String eventTypeStr = switch (mappedType) {
            case OWN_GOAL     -> "OWN_GOAL";
            case PENALTY_GOAL -> "PENALTY_GOAL";
            default           -> "GOAL";
        };
        try {
            matchEventService.persistLiveGoal(fixtureId, ext.playerName(),
                    internalTeamId, ext.elapsedMinute(), eventTypeStr);
        } catch (Exception ex) {
            log.warn("No se pudo persistir gol en vivo (partido {}, jugador {}): {}",
                    fixtureId, ext.playerName(), ex.getMessage());
        }
    }

    private Long resolveInternalTeamId(Long externalTeamId) {
        if (externalTeamId == null) return null;
        return teamRepository.findByExternalProviderId(externalTeamId)
                .map(Team::getId)
                .orElse(null);
    }

    private MatchEvent toPayload(Long internalMatchId, ExternalMatchEvent ext, MatchEvent.Type mappedType) {
        return new MatchEvent(
                internalMatchId,
                mappedType,
                ext.teamId(),
                ext.playerId(),
                ext.playerName(),        // jugador que entra (o protagonista del evento)
                ext.assistPlayerName(),  // jugador que sale en sustituciones; null en goles/tarjetas
                null,                    // teamFifaCode: no disponible en eventos live
                ext.elapsedMinute(),
                ext.extraMinute(),
                ext.detail(),
                Instant.now()
        );
    }

    private MatchEvent.Type mapType(ExternalMatchEvent ext) {
        String type = ext.type();
        if (type == null) {
            return MatchEvent.Type.STATUS_CHANGE;
        }
        String t = type.toLowerCase();
        String d = ext.detail() != null ? ext.detail().toLowerCase() : "";
        if (t.equals("goal")) {
            // Penalty shootout events share type="Goal" with regular goals — only comments distinguishes them.
            if (ext.isPenaltyShootout()) {
                return ext.isMissedShootoutPenalty()
                        ? MatchEvent.Type.SHOOTOUT_MISSED
                        : MatchEvent.Type.SHOOTOUT_GOAL;
            }
            if (d.contains("own")) return MatchEvent.Type.OWN_GOAL;
            if (d.contains("missed")) return MatchEvent.Type.PENALTY_MISSED;
            if (d.contains("penalty")) return MatchEvent.Type.PENALTY_GOAL;
            return MatchEvent.Type.GOAL;
        }
        if (t.equals("card")) {
            if (d.contains("red")) return MatchEvent.Type.RED_CARD;
            return MatchEvent.Type.YELLOW_CARD;
        }
        if (t.startsWith("subst")) return MatchEvent.Type.SUBSTITUTION;
        if (t.equals("var")) return MatchEvent.Type.VAR_REVIEW;
        return MatchEvent.Type.STATUS_CHANGE;
    }

    public record PollResult(int polled, int published) {
    }
}
