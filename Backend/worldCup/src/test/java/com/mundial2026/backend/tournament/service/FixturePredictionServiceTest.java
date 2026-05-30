package com.mundial2026.backend.tournament.service;

import com.mundial2026.backend.tournament.api.dto.FixturePredictionResponse;
import com.mundial2026.backend.tournament.domain.Fixture;
import com.mundial2026.backend.tournament.integration.port.ExternalPrediction;
import com.mundial2026.backend.tournament.integration.port.PredictionDataPort;
import com.mundial2026.backend.tournament.repository.FixtureRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FixturePredictionServiceTest {

    @Mock private PredictionDataPort port;
    @Mock private FixtureRepository fixtureRepository;

    private FixturePredictionService subject;

    @BeforeEach
    void setUp() {
        subject = new FixturePredictionService(port, fixtureRepository);
    }

    @Test
    void findByFixture_callsPortWithin24hWindow() {
        OffsetDateTime kickoff20hAhead = OffsetDateTime.now(ZoneOffset.UTC).plusHours(20);
        when(fixtureRepository.findByExternalProviderId(868053L))
                .thenReturn(Optional.of(fixtureWithKickoff(kickoff20hAhead)));
        when(port.fetchPredictionByFixture(868053L)).thenReturn(Optional.of(prediction()));

        Optional<FixturePredictionResponse> result = subject.findByFixture(868053L);

        assertThat(result).isPresent();
        verify(port).fetchPredictionByFixture(868053L);
    }

    @Test
    void findByFixture_returnsEmptyWhenMoreThan24hBefore() {
        OffsetDateTime kickoffInOneWeek = OffsetDateTime.now(ZoneOffset.UTC).plusDays(7);
        when(fixtureRepository.findByExternalProviderId(868053L))
                .thenReturn(Optional.of(fixtureWithKickoff(kickoffInOneWeek)));

        Optional<FixturePredictionResponse> result = subject.findByFixture(868053L);

        assertThat(result).isEmpty();
        verify(port, never()).fetchPredictionByFixture(any());
    }

    @Test
    void findByFixture_returnsEmptyWhenMoreThan3hAfter() {
        OffsetDateTime kickoffYesterday = OffsetDateTime.now(ZoneOffset.UTC).minusDays(1);
        when(fixtureRepository.findByExternalProviderId(868053L))
                .thenReturn(Optional.of(fixtureWithKickoff(kickoffYesterday)));

        Optional<FixturePredictionResponse> result = subject.findByFixture(868053L);

        assertThat(result).isEmpty();
        verify(port, never()).fetchPredictionByFixture(any());
    }

    @Test
    void findByFixture_allowsWhenFixtureNotInDb() {
        when(fixtureRepository.findByExternalProviderId(999L)).thenReturn(Optional.empty());
        when(port.fetchPredictionByFixture(999L)).thenReturn(Optional.of(prediction()));

        Optional<FixturePredictionResponse> result = subject.findByFixture(999L);

        assertThat(result).isPresent();
        verify(port).fetchPredictionByFixture(999L);
    }

    private Fixture fixtureWithKickoff(OffsetDateTime kickoff) {
        Fixture f = new Fixture();
        f.setKickoffAt(kickoff);
        return f;
    }

    private ExternalPrediction prediction() {
        return new ExternalPrediction(16L, "Mexico", "Win or draw", true,
                "Combo Double chance", "55%", "20%", "25%");
    }
}
