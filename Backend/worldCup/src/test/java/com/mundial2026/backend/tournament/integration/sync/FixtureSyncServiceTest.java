package com.mundial2026.backend.tournament.integration.sync;

import com.mundial2026.backend.realtime.event.FixtureScoreUpdatedEvent;
import com.mundial2026.backend.tournament.domain.Fixture;
import com.mundial2026.backend.tournament.domain.FixtureStatus;
import com.mundial2026.backend.tournament.domain.GroupStage;
import com.mundial2026.backend.tournament.domain.Stage;
import com.mundial2026.backend.tournament.domain.Team;
import com.mundial2026.backend.tournament.domain.Tournament;
import com.mundial2026.backend.tournament.integration.apifootball.ApiFootballClient;
import com.mundial2026.backend.tournament.integration.port.ExternalMatch;
import com.mundial2026.backend.tournament.integration.port.MatchDataPort;
import com.mundial2026.backend.tournament.integration.port.MatchStatus;
import com.mundial2026.backend.tournament.repository.FixtureRepository;
import com.mundial2026.backend.tournament.repository.GroupStageRepository;
import com.mundial2026.backend.tournament.repository.StageRepository;
import com.mundial2026.backend.tournament.repository.TeamRepository;
import com.mundial2026.backend.tournament.repository.TournamentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.context.ApplicationEventPublisher;

import java.time.Instant;
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
@MockitoSettings(strictness = Strictness.LENIENT)  // Permite stubs no usados (test legacy)
class FixtureSyncServiceTest {

    @Mock private MatchDataPort matchDataPort;
    @Mock private ApiFootballClient apiFootballClient;
    @Mock private FixtureRepository fixtureRepository;
    @Mock private TournamentRepository tournamentRepository;
    @Mock private StageRepository stageRepository;
    @Mock private GroupStageRepository groupStageRepository;
    @Mock private TeamRepository teamRepository;
    @Mock private ApplicationEventPublisher events;

    private FixtureSyncService subject;

    private Tournament tournament;
    private Stage groupStage;
    private Stage r16Stage;
    private GroupStage groupA;
    private Team mexico;
    private Team usa;

    @BeforeEach
    void setUp() {
        // Explicit constructor wiring — Mockito's @InjectMocks can't disambiguate
        // matchDataPort vs apiFootballClient since ApiFootballClient implements MatchDataPort
        // (parameter names aren't preserved without -parameters compile flag).
        subject = new FixtureSyncService(
                matchDataPort, apiFootballClient, fixtureRepository,
                tournamentRepository, stageRepository, groupStageRepository,
                teamRepository, events);

        tournament = new Tournament();
        tournament.setId(1L);
        tournament.setCode("WC2026");

        groupStage = new Stage();
        groupStage.setId(10L);
        // El servicio mapStageCode("Group Stage - X") devuelve "GROUPS" (no "GROUP").
        groupStage.setCode("GROUPS");
        groupStage.setTournament(tournament);

        r16Stage = new Stage();
        r16Stage.setId(11L);
        // El servicio mapStageCode("Round of 16") devuelve "OCTAVOS" (en español).
        r16Stage.setCode("OCTAVOS");
        r16Stage.setTournament(tournament);

        groupA = new GroupStage();
        groupA.setId(100L);
        groupA.setCode("A");
        groupA.setTournament(tournament);

        mexico = team(50L, 16L, "Mexico");
        usa = team(51L, 2384L, "USA");
    }

    @Test
    void persist_skipsAllWhenTournamentMissing() {
        when(matchDataPort.fetchLiveMatches()).thenReturn(List.of(extMatch("868053", null, null, MatchStatus.LIVE)));
        when(tournamentRepository.findByCode("WC2026")).thenReturn(Optional.empty());

        var result = subject.syncLiveFixtures();

        assertThat(result.inserted()).isEqualTo(0);
        assertThat(result.skipped()).isEqualTo(1);
        verify(fixtureRepository, never()).save(any());
        verify(events, never()).publishEvent(any());
    }

    @Test
    void persist_insertsNewFixtureWithGroupStage() {
        when(matchDataPort.fetchLiveMatches()).thenReturn(List.of(extMatch("868053", 1, 0, MatchStatus.LIVE)));
        whenStandardDepsResolve();
        when(fixtureRepository.findByExternalProviderId(868053L)).thenReturn(Optional.empty());

        var result = subject.syncLiveFixtures();

        assertThat(result.inserted()).isEqualTo(1);
        ArgumentCaptor<Fixture> captor = ArgumentCaptor.forClass(Fixture.class);
        verify(fixtureRepository).save(captor.capture());
        Fixture saved = captor.getValue();
        assertThat(saved.getExternalProviderId()).isEqualTo(868053L);
        assertThat(saved.getStage()).isEqualTo(groupStage);
        assertThat(saved.getGroupStage()).isEqualTo(groupA);
        assertThat(saved.getHomeTeam()).isEqualTo(mexico);
        assertThat(saved.getAwayTeam()).isEqualTo(usa);
        assertThat(saved.getStatus()).isEqualTo(FixtureStatus.LIVE);
        assertThat(saved.getName()).isEqualTo("Mexico vs USA");
        // NEW fixtures don't publish delta events
        verify(events, never()).publishEvent(any());
    }

    @Test
    void persist_skipsWhenTeamMissing() {
        when(matchDataPort.fetchLiveMatches()).thenReturn(List.of(extMatch("868053", 1, 0, MatchStatus.LIVE)));
        when(tournamentRepository.findByCode("WC2026")).thenReturn(Optional.of(tournament));
        when(stageRepository.findByTournamentIdAndCode(1L, "GROUPS")).thenReturn(Optional.of(groupStage));
        when(groupStageRepository.findByTournamentIdAndCode(1L, "A")).thenReturn(Optional.of(groupA));
        when(teamRepository.findByExternalProviderId(16L)).thenReturn(Optional.of(mexico));
        when(teamRepository.findByExternalProviderId(2384L)).thenReturn(Optional.empty());

        var result = subject.syncLiveFixtures();

        assertThat(result.skipped()).isEqualTo(1);
        verify(fixtureRepository, never()).save(any());
    }

    @Test
    void persist_skipsWhenExternalIdNotNumeric() {
        ExternalMatch bad = new ExternalMatch("not-a-number", 16L, "Mexico", 2384L, "USA",
                null, null, null, MatchStatus.SCHEDULED, Instant.parse("2026-06-11T20:00:00Z"),
                "Azteca", "Group Stage - A");
        when(matchDataPort.fetchLiveMatches()).thenReturn(List.of(bad));
        when(tournamentRepository.findByCode("WC2026")).thenReturn(Optional.of(tournament));

        var result = subject.syncLiveFixtures();

        assertThat(result.skipped()).isEqualTo(1);
        verify(fixtureRepository, never()).save(any());
    }

    @Test
    void persist_updatesAndPublishesDeltaWhenStatusChanges() {
        Fixture existing = existingFixture(868053L, FixtureStatus.SCHEDULED);
        when(matchDataPort.fetchLiveMatches()).thenReturn(List.of(extMatch("868053", 1, 0, MatchStatus.LIVE)));
        whenStandardDepsResolve();
        when(fixtureRepository.findByExternalProviderId(868053L)).thenReturn(Optional.of(existing));

        var result = subject.syncLiveFixtures();

        assertThat(result.updated()).isEqualTo(1);
        assertThat(existing.getStatus()).isEqualTo(FixtureStatus.LIVE);
        verify(fixtureRepository).save(existing);

        ArgumentCaptor<Object> evCaptor = ArgumentCaptor.forClass(Object.class);
        verify(events).publishEvent(evCaptor.capture());
        FixtureScoreUpdatedEvent ev = (FixtureScoreUpdatedEvent) evCaptor.getValue();
        assertThat(ev.delta().matchId()).isEqualTo(existing.getId());
        assertThat(ev.delta().status()).isEqualTo(MatchStatus.LIVE);
        assertThat(ev.delta().homeScore()).isEqualTo(1);
        assertThat(ev.delta().awayScore()).isEqualTo(0);
    }

    @Test
    void persist_doesNotPublishWhenStatusIsScheduled() {
        Fixture existing = existingFixture(868053L, FixtureStatus.SCHEDULED);
        // kickoff changes but status stays SCHEDULED → no WS push
        ExternalMatch reschedule = new ExternalMatch("868053", 16L, "Mexico", 2384L, "USA",
                null, null, null, MatchStatus.SCHEDULED, Instant.parse("2026-06-12T20:00:00Z"),
                "Azteca", "Group Stage - A");
        when(matchDataPort.fetchLiveMatches()).thenReturn(List.of(reschedule));
        whenStandardDepsResolve();
        when(fixtureRepository.findByExternalProviderId(868053L)).thenReturn(Optional.of(existing));

        var result = subject.syncLiveFixtures();

        assertThat(result.updated()).isEqualTo(1);
        verify(events, never()).publishEvent(any());
    }

    @Test
    void persist_resolvesRoundOf16WithoutGroupStage() {
        ExternalMatch r16 = new ExternalMatch("900000", 16L, "Mexico", 2384L, "USA",
                null, null, null, MatchStatus.SCHEDULED, Instant.parse("2026-07-01T20:00:00Z"),
                "Azteca", "Round of 16");
        when(matchDataPort.fetchLiveMatches()).thenReturn(List.of(r16));
        when(tournamentRepository.findByCode("WC2026")).thenReturn(Optional.of(tournament));
        // mapStageCode("Round of 16") = "OCTAVOS".
        when(stageRepository.findByTournamentIdAndCode(1L, "OCTAVOS")).thenReturn(Optional.of(r16Stage));
        when(teamRepository.findByExternalProviderId(16L)).thenReturn(Optional.of(mexico));
        when(teamRepository.findByExternalProviderId(2384L)).thenReturn(Optional.of(usa));
        when(fixtureRepository.findByExternalProviderId(900000L)).thenReturn(Optional.empty());

        var result = subject.syncLiveFixtures();

        assertThat(result.inserted()).isEqualTo(1);
        ArgumentCaptor<Fixture> captor = ArgumentCaptor.forClass(Fixture.class);
        verify(fixtureRepository).save(captor.capture());
        Fixture saved = captor.getValue();
        assertThat(saved.getStage().getCode()).isEqualTo("OCTAVOS");
        assertThat(saved.getGroupStage()).isNull();
    }

    @Test
    void persist_skipsFixtureWithUnknownRound() {
        ExternalMatch unknown = new ExternalMatch("900001", 16L, "Mexico", 2384L, "USA",
                null, null, null, MatchStatus.SCHEDULED, Instant.parse("2026-07-01T20:00:00Z"),
                "Azteca", "Some Weird Round Name");
        when(matchDataPort.fetchLiveMatches()).thenReturn(List.of(unknown));
        when(tournamentRepository.findByCode("WC2026")).thenReturn(Optional.of(tournament));
        when(teamRepository.findByExternalProviderId(16L)).thenReturn(Optional.of(mexico));
        when(teamRepository.findByExternalProviderId(2384L)).thenReturn(Optional.of(usa));

        var result = subject.syncLiveFixtures();

        assertThat(result.skipped()).isEqualTo(1);
        verify(fixtureRepository, never()).save(any());
    }

    // ---------- helpers ----------

    private void whenStandardDepsResolve() {
        when(tournamentRepository.findByCode("WC2026")).thenReturn(Optional.of(tournament));
        // mapStageCode("Group Stage - A") = "GROUPS" según FixtureSyncService.
        when(stageRepository.findByTournamentIdAndCode(1L, "GROUPS")).thenReturn(Optional.of(groupStage));
        when(groupStageRepository.findByTournamentIdAndCode(1L, "A")).thenReturn(Optional.of(groupA));
        when(teamRepository.findByExternalProviderId(16L)).thenReturn(Optional.of(mexico));
        when(teamRepository.findByExternalProviderId(2384L)).thenReturn(Optional.of(usa));
    }

    private ExternalMatch extMatch(String externalId, Integer homeScore, Integer awayScore, MatchStatus status) {
        return new ExternalMatch(externalId, 16L, "Mexico", 2384L, "USA",
                homeScore, awayScore, 23, status,
                Instant.parse("2026-06-11T20:00:00Z"), "Azteca", "Group Stage - A");
    }

    private Fixture existingFixture(Long extId, FixtureStatus status) {
        Fixture f = new Fixture();
        f.setId(999L);
        f.setExternalProviderId(extId);
        f.setTournament(tournament);
        f.setStage(groupStage);
        f.setGroupStage(groupA);
        f.setHomeTeam(mexico);
        f.setAwayTeam(usa);
        f.setName("Mexico vs USA");
        OffsetDateTime kickoff = OffsetDateTime.parse("2026-06-11T20:00:00Z");
        f.setKickoffAt(kickoff);
        f.setPredictionLockMinutesBefore(5);
        f.setPredictionLockedAt(kickoff.minusMinutes(5));
        f.setStatus(status);
        return f;
    }

    private Team team(Long id, Long extId, String name) {
        Team t = new Team();
        t.setId(id);
        t.setExternalProviderId(extId);
        t.setName(name);
        return t;
    }

    static {
        // Ensure ZoneOffset.UTC is loaded before any OffsetDateTime parse in static initializers.
        var __ = ZoneOffset.UTC;
    }
}
