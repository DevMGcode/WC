package com.mundial2026.backend.tournament.integration.sync;

import com.mundial2026.backend.tournament.domain.Team;
import com.mundial2026.backend.tournament.integration.port.ExternalTeam;
import com.mundial2026.backend.tournament.integration.port.TeamDataPort;
import com.mundial2026.backend.tournament.repository.TeamRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TeamSyncServiceTest {

    @Mock
    private TeamDataPort teamDataPort;
    @Mock
    private TeamRepository teamRepository;

    @InjectMocks
    private TeamSyncService subject;

    private ExternalTeam mexicoExt;
    private ExternalTeam usaExt;

    @BeforeEach
    void setUp() {
        mexicoExt = new ExternalTeam(16L, "Mexico", "MEX", "Mexico", 1927, true, "https://flag/mx", 17L, "Azteca", "Mexico City");
        usaExt = new ExternalTeam(2384L, "United States", "USA", "United States", 1913, true, "https://flag/us", 18L, "MetLife", "East Rutherford");
    }

    @Test
    void syncAll_insertsNewTeams() {
        when(teamDataPort.fetchTournamentTeams()).thenReturn(List.of(mexicoExt, usaExt));
        when(teamRepository.findByExternalProviderId(any())).thenReturn(Optional.empty());

        var result = subject.syncAll();

        assertThat(result.inserted()).isEqualTo(2);
        assertThat(result.updated()).isEqualTo(0);
        verify(teamRepository, times(2)).save(any(Team.class));
    }

    @Test
    void syncAll_updatesWhenFieldsChanged() {
        Team existing = teamWith(16L, "Mexico", "MEX", "old-flag.png");
        when(teamDataPort.fetchTournamentTeams()).thenReturn(List.of(mexicoExt));
        when(teamRepository.findByExternalProviderId(16L)).thenReturn(Optional.of(existing));

        var result = subject.syncAll();

        assertThat(result.inserted()).isEqualTo(0);
        assertThat(result.updated()).isEqualTo(1);
        ArgumentCaptor<Team> captor = ArgumentCaptor.forClass(Team.class);
        verify(teamRepository).save(captor.capture());
        assertThat(captor.getValue().getFlagUrl()).isEqualTo("https://flag/mx");
    }

    @Test
    void syncAll_doesNotSaveWhenNothingChanged() {
        Team unchanged = teamWith(16L, "Mexico", "MEX", "https://flag/mx");
        unchanged.setCountryName("Mexico");
        when(teamDataPort.fetchTournamentTeams()).thenReturn(List.of(mexicoExt));
        when(teamRepository.findByExternalProviderId(16L)).thenReturn(Optional.of(unchanged));

        var result = subject.syncAll();

        assertThat(result.inserted()).isEqualTo(0);
        assertThat(result.updated()).isEqualTo(0);
        verify(teamRepository, never()).save(any());
    }

    @Test
    void syncAll_skipsTeamsWithoutExternalId() {
        ExternalTeam noId = new ExternalTeam(null, "Ghost", "GHO", "Nowhere", null, true, null, null, null, null);
        when(teamDataPort.fetchTournamentTeams()).thenReturn(List.of(noId));

        var result = subject.syncAll();

        assertThat(result.inserted()).isEqualTo(0);
        assertThat(result.updated()).isEqualTo(0);
        verify(teamRepository, never()).save(any());
        verify(teamRepository, never()).findByExternalProviderId(any());
    }

    @Test
    void syncAll_emptyExternalListReturnsZeros() {
        when(teamDataPort.fetchTournamentTeams()).thenReturn(List.of());

        var result = subject.syncAll();

        assertThat(result.inserted()).isEqualTo(0);
        assertThat(result.updated()).isEqualTo(0);
        verify(teamRepository, never()).save(any());
    }

    private Team teamWith(Long extId, String name, String code, String flag) {
        Team t = new Team();
        t.setExternalProviderId(extId);
        t.setName(name);
        t.setShortName(code);
        t.setFifaCode(code);
        t.setFlagUrl(flag);
        return t;
    }
}
