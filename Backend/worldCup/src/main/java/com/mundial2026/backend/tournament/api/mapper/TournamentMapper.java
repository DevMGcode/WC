package com.mundial2026.backend.tournament.api.mapper;

import com.mundial2026.backend.tournament.api.dto.FixtureResponse;
import com.mundial2026.backend.tournament.api.dto.TeamResponse;
import com.mundial2026.backend.tournament.api.dto.TournamentResponse;
import com.mundial2026.backend.tournament.domain.Fixture;
import com.mundial2026.backend.tournament.domain.Team;
import com.mundial2026.backend.tournament.domain.Tournament;
import org.springframework.stereotype.Component;

@Component
public class TournamentMapper {

    public TournamentResponse toResponse(Tournament tournament) {
        return new TournamentResponse(
                tournament.getId(),
                tournament.getCode(),
                tournament.getName(),
                tournament.getHostCountries(),
                tournament.getStatus().name()
        );
    }

    public FixtureResponse toResponse(Fixture fixture) {
        return new FixtureResponse(
                fixture.getId(),
                fixture.getName(),
                fixture.getTournament().getName(),
                fixture.getStage().getName(),
                fixture.getGroupStage() != null ? fixture.getGroupStage().getCode() : null,
                toFixtureTeamResponse(fixture.getHomeTeam()),
                toFixtureTeamResponse(fixture.getAwayTeam()),
                fixture.getVenue() != null ? fixture.getVenue().getCityName() : null,
                fixture.getVenue() != null ? fixture.getVenue().getCountryName() : null,
                fixture.getVenue() != null ? fixture.getVenue().getName() : null,
                fixture.getKickoffAt(),
                fixture.getPredictionLockedAt(),
                fixture.getStatus().name(),
                fixture.getHomeScore(),
                fixture.getAwayScore(),
                fixture.getExternalProviderId()
        );
    }

    public TeamResponse toTeamResponse(Team team) {
        return new TeamResponse(
                team.getId(),
                team.getName(),
                team.getShortName(),
                team.getFifaCode(),
                team.getCountryName(),
                team.getFlagUrl()
        );
    }

    private FixtureResponse.TeamResponse toFixtureTeamResponse(Team team) {
        return new FixtureResponse.TeamResponse(
                team.getId(),
                team.getName(),
                team.getShortName(),
                team.getFifaCode(),
                team.getFlagUrl()
        );
    }
}
