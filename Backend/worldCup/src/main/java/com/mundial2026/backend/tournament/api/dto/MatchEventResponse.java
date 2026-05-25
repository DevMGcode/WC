package com.mundial2026.backend.tournament.api.dto;

public record MatchEventResponse(
        Integer elapsedMinute,
        Integer extraMinute,
        Long teamId,
        String teamName,
        Long playerId,
        String playerName,
        Long assistPlayerId,
        String assistPlayerName,
        String type,
        String detail,
        String comments
) {
}
