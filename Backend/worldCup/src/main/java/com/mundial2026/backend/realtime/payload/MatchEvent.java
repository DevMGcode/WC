package com.mundial2026.backend.realtime.payload;

import java.time.Instant;

/**
 * Discrete in-match event pushed on /topic/matches/{id}/events.
 * playerName/teamFifaCode are populated for manual admin entries; null for external API events
 * (where the client refetches via REST to get full scorer details).
 */
public record MatchEvent(
        Long matchId,
        Type type,
        Long teamId,
        Long playerId,
        String playerName,
        String playerOut,
        String teamFifaCode,
        Integer minute,
        Integer extraMinute,
        String detail,
        Instant occurredAt
) {
    public enum Type {
        GOAL,
        OWN_GOAL,
        PENALTY_GOAL,
        PENALTY_MISSED,
        SHOOTOUT_GOAL,
        SHOOTOUT_MISSED,
        YELLOW_CARD,
        RED_CARD,
        SUBSTITUTION,
        VAR_REVIEW,
        STATUS_CHANGE
    }
}
