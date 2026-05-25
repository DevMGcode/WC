package com.mundial2026.backend.tournament.integration.sync;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.mundial2026.backend.realtime.event.FixtureEventOccurredEvent;
import com.mundial2026.backend.realtime.payload.MatchEvent;
import com.mundial2026.backend.tournament.domain.Fixture;
import com.mundial2026.backend.tournament.domain.FixtureStatus;
import com.mundial2026.backend.tournament.integration.port.ExternalMatchEvent;
import com.mundial2026.backend.tournament.integration.port.MatchEventDataPort;
import com.mundial2026.backend.tournament.repository.FixtureRepository;
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
 */
@Service
@Slf4j
public class LiveEventPollingService {

    private final FixtureRepository fixtureRepository;
    private final MatchEventDataPort matchEventDataPort;
    private final ApplicationEventPublisher events;

    private final Cache<String, Boolean> seenEvents;

    public LiveEventPollingService(FixtureRepository fixtureRepository,
                                   MatchEventDataPort matchEventDataPort,
                                   ApplicationEventPublisher events) {
        this.fixtureRepository = fixtureRepository;
        this.matchEventDataPort = matchEventDataPort;
        this.events = events;
        this.seenEvents = Caffeine.newBuilder()
                .expireAfterWrite(Duration.ofHours(6))
                .maximumSize(20000)
                .build();
    }

    public PollResult pollAllLive() {
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
                        events.publishEvent(new FixtureEventOccurredEvent(toPayload(f.getId(), ext)));
                        published++;
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

    private MatchEvent toPayload(Long internalMatchId, ExternalMatchEvent ext) {
        return new MatchEvent(
                internalMatchId,
                mapType(ext.type(), ext.detail()),
                ext.teamId(),
                ext.playerId(),
                ext.elapsedMinute(),
                ext.extraMinute(),
                ext.detail(),
                Instant.now()
        );
    }

    private MatchEvent.Type mapType(String type, String detail) {
        if (type == null) {
            return MatchEvent.Type.STATUS_CHANGE;
        }
        String t = type.toLowerCase();
        String d = detail != null ? detail.toLowerCase() : "";
        if (t.equals("goal")) {
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
