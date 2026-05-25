package com.mundial2026.backend.tournament.api.dto;

import com.mundial2026.backend.tournament.integration.port.MatchStatus;

import java.time.Instant;

/**
 * Full REST snapshot of a fixture. Served by GET /api/v1/fixtures/{id}.
 * Includes stable fields (teams, venue, stage) so the frontend can hydrate
 * once and then apply WS deltas (MatchLiveDelta) without re-fetching.
 */
public record FixtureSnapshotResponse(
        Long id,
        TeamSummary homeTeam,
        TeamSummary awayTeam,
        Integer homeScore,
        Integer awayScore,
        Integer elapsedMinutes,
        MatchStatus status,
        Instant kickoffUtc,
        String venueName,
        String stage,
        String leagueRound
) {

    public record TeamSummary(Long id, String name, String logoUrl) {
    }
}
