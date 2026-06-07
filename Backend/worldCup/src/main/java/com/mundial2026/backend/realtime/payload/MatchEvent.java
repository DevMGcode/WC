package com.mundial2026.backend.realtime.payload;

import java.time.Instant;

/**
 * Discrete in-match event pushed on /topic/matches/{id}/events.
 * The client looks up team/player details via REST cache using the IDs.
 */
public record MatchEvent(
        Long matchId,
        Type type,
        Long teamId,
        Long playerId,
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
