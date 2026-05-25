package com.mundial2026.backend.tournament.integration.port;

public record ExternalSquadPlayer(
        Long teamId,
        String teamName,
        Long playerId,
        String playerName,
        Integer shirtNumber,
        String position,
        Integer age,
        String photoUrl
) {
}
