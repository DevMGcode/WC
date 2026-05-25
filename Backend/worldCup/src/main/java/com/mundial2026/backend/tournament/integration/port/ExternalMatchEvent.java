package com.mundial2026.backend.tournament.integration.port;

public record ExternalMatchEvent(
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

    public String dedupKey(Long fixtureId) {
        return fixtureId + ":" + elapsedMinute + ":" + extraMinute
                + ":" + teamId + ":" + playerId + ":" + type + ":" + detail;
    }
}
