package com.mundial2026.backend.tournament.api.dto;

public record PlayerStatResponse(
        Long playerId,
        String playerName,
        String firstName,
        String lastName,
        String nationality,
        String photoUrl,
        Integer age,
        String position,
        Long teamId,
        String teamName,
        String teamLogoUrl,
        Integer appearances,
        Integer minutesPlayed,
        Integer goals,
        Integer assists,
        Integer shotsTotal,
        Integer shotsOnTarget,
        Integer yellowCards,
        Integer redCards,
        String rating
) {
}
