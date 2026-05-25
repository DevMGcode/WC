package com.mundial2026.backend.tournament.api.dto;

public record FixturePredictionResponse(
        Long winnerTeamId,
        String winnerTeamName,
        String winnerComment,
        Boolean winOrDraw,
        String advice,
        String homeWinPercent,
        String drawPercent,
        String awayWinPercent
) {
}
