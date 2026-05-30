package com.mundial2026.backend.tournament.service;

import com.mundial2026.backend.tournament.api.dto.StandingResponse;
import com.mundial2026.backend.tournament.integration.port.ExternalStanding;
import com.mundial2026.backend.tournament.integration.port.StandingsDataPort;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StandingsServiceTest {

    @Mock
    private StandingsDataPort port;

    private StandingsService subject;

    @BeforeEach
    void setUp() {
        subject = new StandingsService(port);
    }

    @Test
    void findAll_mapsAllEntries() {
        when(port.fetchStandings()).thenReturn(List.of(
                std("Group A", 1, 16L, "Mexico", 7, 5, 1),
                std("Group A", 2, 2384L, "USA", 4, 3, 2),
                std("Group B", 1, 6L, "Brazil", 9, 7, 1)));

        List<StandingResponse> result = subject.findAll();

        assertThat(result).hasSize(3);
        assertThat(result).extracting(StandingResponse::teamName)
                .containsExactly("Mexico", "USA", "Brazil");
    }

    @Test
    void findByGroup_filtersByGroupCode() {
        when(port.fetchStandings()).thenReturn(List.of(
                std("Group A", 1, 16L, "Mexico", 7, 5, 1),
                std("Group A", 2, 2384L, "USA", 4, 3, 2),
                std("Group B", 1, 6L, "Brazil", 9, 7, 1)));

        List<StandingResponse> result = subject.findByGroup("A");

        assertThat(result).hasSize(2);
        assertThat(result).extracting(StandingResponse::groupName).containsOnly("Group A");
    }

    @Test
    void findByGroup_isCaseInsensitive() {
        when(port.fetchStandings()).thenReturn(List.of(std("Group A", 1, 16L, "Mexico", 7, 5, 1)));

        assertThat(subject.findByGroup("a")).hasSize(1);
    }

    @Test
    void findFewestGoalsAgainst_sortsAscendingAndLimits() {
        when(port.fetchStandings()).thenReturn(List.of(
                std("Group A", 1, 16L, "Mexico", 7, 5, 1),
                std("Group A", 2, 2384L, "USA", 4, 3, 2),
                std("Group B", 1, 6L, "Brazil", 9, 7, 1),
                std("Group B", 2, 10L, "France", 3, 2, 4)));

        List<StandingResponse> result = subject.findFewestGoalsAgainst(2);

        assertThat(result).hasSize(2);
        assertThat(result).extracting(StandingResponse::teamName).containsExactly("Mexico", "Brazil");
    }

    @Test
    void findFewestGoalsAgainst_skipsNullGoalsAgainst() {
        when(port.fetchStandings()).thenReturn(List.of(
                std("Group A", 1, 16L, "Mexico", 7, 5, 1),
                stdNullGa("Group A", 2, 2384L, "USA")));

        List<StandingResponse> result = subject.findFewestGoalsAgainst(10);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).teamName()).isEqualTo("Mexico");
    }

    private ExternalStanding std(String group, int rank, long teamId, String name, int points, int gf, int ga) {
        return new ExternalStanding(group, rank, teamId, name, null,
                3, 2, 1, 0, gf, ga, gf - ga, points, "WWD", null, Instant.now());
    }

    private ExternalStanding stdNullGa(String group, int rank, long teamId, String name) {
        return new ExternalStanding(group, rank, teamId, name, null,
                3, 1, 0, 2, 3, null, null, 3, "LLD", null, Instant.now());
    }
}
