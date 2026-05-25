package com.mundial2026.backend.realtime.payload;

import com.mundial2026.backend.tournament.integration.port.MatchStatus;

import java.time.Instant;

/**
 * Minimal WS payload pushed on /topic/matches/{id}/live.
 * Only volatile fields. Stable data (team names, logos, venue) is served by REST.
 */
public record MatchLiveDelta(
        Long matchId,
        Integer homeScore,
        Integer awayScore,
        Integer elapsedMinutes,
        MatchStatus status,
        Instant updatedAt
) {
}
