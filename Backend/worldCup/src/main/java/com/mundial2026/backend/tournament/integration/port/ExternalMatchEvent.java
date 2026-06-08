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

    /**
     * Penalty shootout events are regular "Goal"/"Missed Penalty" entries in the API-Football
     * response — the only way to distinguish them from in-match penalties is by checking
     * comments == "Penalty Shootout" (observed in 2022 World Cup data).
     */
    public boolean isPenaltyShootout() {
        return "Penalty Shootout".equals(comments);
    }

    public boolean isMissedShootoutPenalty() {
        return isPenaltyShootout() && "Missed Penalty".equals(detail);
    }
}
