package com.mundial2026.backend.tournament.api.mapper;

import com.mundial2026.backend.tournament.api.dto.FixtureResponse;
import com.mundial2026.backend.tournament.api.dto.TournamentResponse;
import com.mundial2026.backend.tournament.domain.Fixture;
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
                fixture.getHomeTeam().getName(),
                fixture.getAwayTeam().getName(),
                fixture.getKickoffAt(),
                fixture.getPredictionLockedAt(),
                fixture.getStatus().name()
        );
    }
}
