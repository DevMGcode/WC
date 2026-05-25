package com.mundial2026.backend.tournament.service;

import com.mundial2026.backend.tournament.api.dto.LineupResponse;
import com.mundial2026.backend.tournament.domain.Fixture;
import com.mundial2026.backend.tournament.integration.port.ExternalLineup;
import com.mundial2026.backend.tournament.integration.port.LineupDataPort;
import com.mundial2026.backend.tournament.repository.FixtureRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LineupServiceTest {

    @Mock private LineupDataPort port;
    @Mock private FixtureRepository fixtureRepository;

    private LineupService subject;

    @BeforeEach
    void setUp() {
        subject = new LineupService(port, fixtureRepository);
    }

    @Test
    void findByFixture_callsPortWhenWithinWindow() {
        OffsetDateTime kickoffInOneHour = OffsetDateTime.now(ZoneOffset.UTC).plusHours(1);
        when(fixtureRepository.findByExternalProviderId(868053L))
                .thenReturn(Optional.of(fixtureWithKickoff(kickoffInOneHour)));
        when(port.fetchLineupsByFixture(868053L)).thenReturn(List.of(lineup()));

        List<LineupResponse> result = subject.findByFixture(868053L);

        assertThat(result).hasSize(1);
        verify(port).fetchLineupsByFixture(868053L);
    }

    @Test
    void findByFixture_returnsEmptyWhenTooEarly() {
        OffsetDateTime kickoffInOneWeek = OffsetDateTime.now(ZoneOffset.UTC).plusDays(7);
        when(fixtureRepository.findByExternalProviderId(868053L))
                .thenReturn(Optional.of(fixtureWithKickoff(kickoffInOneWeek)));

        List<LineupResponse> result = subject.findByFixture(868053L);

        assertThat(result).isEmpty();
        verify(port, never()).fetchLineupsByFixture(any());
    }

    @Test
    void findByFixture_returnsEmptyWhenTooLate() {
        OffsetDateTime kickoffOneWeekAgo = OffsetDateTime.now(ZoneOffset.UTC).minusDays(7);
        when(fixtureRepository.findByExternalProviderId(868053L))
                .thenReturn(Optional.of(fixtureWithKickoff(kickoffOneWeekAgo)));

        List<LineupResponse> result = subject.findByFixture(868053L);

        assertThat(result).isEmpty();
        verify(port, never()).fetchLineupsByFixture(any());
    }

    @Test
    void findByFixture_allowsWhenFixtureNotInDb() {
        // Fallback: if we don't know the fixture, allow the call (don't hide data).
        when(fixtureRepository.findByExternalProviderId(999L)).thenReturn(Optional.empty());
        when(port.fetchLineupsByFixture(999L)).thenReturn(List.of(lineup()));

        List<LineupResponse> result = subject.findByFixture(999L);

        assertThat(result).hasSize(1);
        verify(port).fetchLineupsByFixture(999L);
    }

    @Test
    void findByFixture_callsPortDuringLiveMatch() {
        OffsetDateTime liveKickoff = OffsetDateTime.now(ZoneOffset.UTC).minusMinutes(45);
        when(fixtureRepository.findByExternalProviderId(868053L))
                .thenReturn(Optional.of(fixtureWithKickoff(liveKickoff)));
        when(port.fetchLineupsByFixture(868053L)).thenReturn(List.of(lineup()));

        subject.findByFixture(868053L);

        verify(port).fetchLineupsByFixture(868053L);
    }

    private Fixture fixtureWithKickoff(OffsetDateTime kickoff) {
        Fixture f = new Fixture();
        f.setKickoffAt(kickoff);
        return f;
    }

    private ExternalLineup lineup() {
        return new ExternalLineup(16L, "Mexico", null, 1L, "DT", null, "4-3-3", List.of(), List.of());
    }
}
