package com.mundial2026.backend.tournament.integration.sync;

import com.mundial2026.backend.tournament.repository.FixtureRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "tournament.sync.enabled", havingValue = "true")
public class SyncScheduler {

    private final TeamSyncService teamSyncService;
    private final FixtureSyncService fixtureSyncService;
    private final LiveEventPollingService liveEventPollingService;
    private final ApiFootballScorerSyncService apiFootballScorerSyncService;
    private final FixtureRepository fixtureRepository;

    @Scheduled(initialDelayString = "PT30S", fixedDelayString = "PT24H")
    public void teamsDaily() {
        try {
            teamSyncService.syncAll();
        } catch (Exception ex) {
            log.error("Team sync failed: {}", ex.getMessage(), ex);
        }
    }

    @Scheduled(initialDelayString = "PT60S", fixedDelayString = "PT24H")
    public void fixturesDaily() {
        try {
            fixtureSyncService.syncAllTournamentFixtures();
        } catch (Exception ex) {
            log.error("Full fixture sync failed: {}", ex.getMessage(), ex);
        }
    }

    /**
     * Polls live fixtures only when there is a fixture window active
     * (any fixture kicking off in next 5 min OR started within last 3h).
     * Outside that window the job is a no-op = ~1 cheap DB query, zero api-football traffic.
     */
    @Scheduled(initialDelayString = "PT90S",
               fixedDelayString = "${tournament.sync.live-poll-ms:5000}")
    public void liveFixturesPolling() {
        if (!hasActiveFixtureWindow()) {
            return;
        }
        try {
            fixtureSyncService.syncLiveFixtures();
        } catch (Exception ex) {
            log.error("Live fixture sync failed: {}", ex.getMessage(), ex);
        }
    }

    /**
     * Polls in-match events for fixtures LIVE in DB.
     * 15s cadence: with max 4 simultaneous live fixtures = 16 req/min, well under any plan.
     * Skipped entirely when no fixture window is active.
     */
    @Scheduled(initialDelayString = "PT2M",
               fixedDelayString = "${tournament.sync.event-poll-ms:15000}")
    public void liveEventPolling() {
        if (!hasActiveFixtureWindow()) {
            return;
        }
        try {
            liveEventPollingService.pollAllLive();
        } catch (Exception ex) {
            log.error("Live event polling failed: {}", ex.getMessage(), ex);
        }
    }

    /**
     * Persists scorers (name + minute) for recently finished fixtures.
     * Cheap when idle: one DB query; API calls only for fixtures finished in
     * the last 24h that still lack API-sourced events.
     */
    @Scheduled(initialDelayString = "PT3M", fixedDelayString = "PT5M")
    public void finishedScorersSync() {
        try {
            apiFootballScorerSyncService.syncRecentlyFinished();
        } catch (Exception ex) {
            log.error("Finished-fixture scorer sync failed: {}", ex.getMessage(), ex);
        }
    }

    private boolean hasActiveFixtureWindow() {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        return fixtureRepository.existsByKickoffAtBetween(now.minusHours(3), now.plusMinutes(5));
    }
}
