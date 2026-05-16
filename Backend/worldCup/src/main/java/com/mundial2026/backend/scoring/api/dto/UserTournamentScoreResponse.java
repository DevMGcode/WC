package com.mundial2026.backend.scoring.api.dto;

import java.time.OffsetDateTime;

public record UserTournamentScoreResponse(
        Long userId,
        String username,
        String fullName,
        Long tournamentId,
        Integer totalPoints,
        Integer exactScores,
        Integer winnerHits,
        Integer bonusPoints,
        Integer matchesScored,
        Integer rankPosition,
        OffsetDateTime lastScoredAt
) {
}
