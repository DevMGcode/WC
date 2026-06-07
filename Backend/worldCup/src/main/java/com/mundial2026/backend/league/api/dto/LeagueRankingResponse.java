package com.mundial2026.backend.league.api.dto;

import java.time.OffsetDateTime;

public record LeagueRankingResponse(
        Integer rankPosition,
        Long userId,
        String username,
        String fullName,
        Integer totalPoints,
        Integer exactScores,
        Integer winnerHits,
        Integer bonusPoints,
        Integer matchesScored,
        OffsetDateTime lastScoredAt,
        Boolean isPremium
) {
}
