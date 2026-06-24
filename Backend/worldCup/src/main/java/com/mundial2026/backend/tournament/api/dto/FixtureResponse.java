package com.mundial2026.backend.tournament.api.dto;

import java.time.OffsetDateTime;
import java.util.List;

public record FixtureResponse(
        Long id,
        String name,
        String tournamentName,
        String stageName,
        String groupCode,
        TeamResponse homeTeam,
        TeamResponse awayTeam,
        String hostCity,
        String hostCountry,
        String stadiumName,
        OffsetDateTime kickoffAt,
        OffsetDateTime predictionLockedAt,
        String status,
        Integer homeScore,
        Integer awayScore,
        /** Minutos de reposición (90' + X). Fuente: API-Football o botón EXTENDER del admin. */
        Integer extraMinutes,
        /** Minuto de juego en curso (status.elapsed). null si el partido no está en vivo. */
        Integer elapsedMinutes,
        Long externalProviderId,
        List<MatchEventResponse> scorers
) {
    public record TeamResponse(
            Long id,
            String name,
            String shortName,
            String fifaCode,
            String flagUrl
    ) {}
}
