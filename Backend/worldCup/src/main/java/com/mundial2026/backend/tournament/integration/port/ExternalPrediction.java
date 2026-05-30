package com.mundial2026.backend.tournament.integration.port;

public record ExternalPrediction(
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
