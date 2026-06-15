package com.mundial2026.backend.league.api.dto;

import java.time.OffsetDateTime;
import java.util.List;

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
        Boolean isPremium,
        /** Códigos de logros DESBLOQUEADOS del miembro (tira compacta en el ranking de liga). */
        List<String> unlockedAchievements
) {
}
