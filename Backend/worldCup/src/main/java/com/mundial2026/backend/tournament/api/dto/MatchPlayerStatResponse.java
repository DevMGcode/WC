package com.mundial2026.backend.tournament.api.dto;

public record MatchPlayerStatResponse(
        Long teamId,
        String teamName,
        Long playerId,
        String playerName,
        String photoUrl,
        Integer minutes,
        Integer shirtNumber,
        String position,
        String rating,
        Boolean captain,
        Boolean substitute,
        Integer shotsTotal,
        Integer shotsOn,
        Integer goals,
        Integer assists,
        Integer yellowCards,
        Integer redCards
) {
}
