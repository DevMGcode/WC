package com.mundial2026.backend.tournament.integration.sync;

import com.mundial2026.backend.tournament.repository.FixtureRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SyncSchedulerTest {

    @Mock private TeamSyncService teamSyncService;
    @Mock private FixtureSyncService fixtureSyncService;
    @Mock private LiveEventPollingService liveEventPollingService;
    @Mock private FixtureRepository fixtureRepository;

    private SyncScheduler subject;

    @BeforeEach
    void setUp() {
        subject = new SyncScheduler(teamSyncService, fixtureSyncService,
                liveEventPollingService, fixtureRepository);
    }

    @Test
    void liveFixturesPolling_skipsApiCallWhenNoActiveWindow() {
        when(fixtureRepository.existsByKickoffAtBetween(any(OffsetDateTime.class), any(OffsetDateTime.class)))
                .thenReturn(false);

        subject.liveFixturesPolling();

        verify(fixtureSyncService, never()).syncLiveFixtures();
    }

    @Test
    void liveFixturesPolling_callsSyncWhenActiveWindow() {
        when(fixtureRepository.existsByKickoffAtBetween(any(OffsetDateTime.class), any(OffsetDateTime.class)))
                .thenReturn(true);

        subject.liveFixturesPolling();

        verify(fixtureSyncService).syncLiveFixtures();
    }

    @Test
    void liveFixturesPolling_swallowsExceptions() {
        when(fixtureRepository.existsByKickoffAtBetween(any(), any())).thenReturn(true);
        when(fixtureSyncService.syncLiveFixtures()).thenThrow(new RuntimeException("api down"));

        // does not propagate — scheduler keeps ticking
        subject.liveFixturesPolling();
    }

    @Test
    void liveEventPolling_skipsApiCallWhenNoActiveWindow() {
        when(fixtureRepository.existsByKickoffAtBetween(any(), any())).thenReturn(false);

        subject.liveEventPolling();

        verify(liveEventPollingService, never()).pollAllLive();
    }

    @Test
    void liveEventPolling_callsServiceWhenActiveWindow() {
        when(fixtureRepository.existsByKickoffAtBetween(any(), any())).thenReturn(true);

        subject.liveEventPolling();

        verify(liveEventPollingService).pollAllLive();
    }

    @Test
    void teamsDaily_callsService() {
        subject.teamsDaily();
        verify(teamSyncService).syncAll();
    }

    @Test
    void fixturesDaily_callsService() {
        subject.fixturesDaily();
        verify(fixtureSyncService).syncAllTournamentFixtures();
    }

    @Test
    void teamsDaily_swallowsExceptions() {
        when(teamSyncService.syncAll()).thenThrow(new RuntimeException("db down"));
        subject.teamsDaily();
    }

    @Test
    void fixturesDaily_swallowsExceptions() {
        when(fixtureSyncService.syncAllTournamentFixtures()).thenThrow(new RuntimeException("api down"));
        subject.fixturesDaily();
    }
}
