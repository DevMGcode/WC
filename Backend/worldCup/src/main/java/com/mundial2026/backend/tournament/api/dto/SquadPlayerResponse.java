package com.mundial2026.backend.tournament.api.dto;

public record SquadPlayerResponse(
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
