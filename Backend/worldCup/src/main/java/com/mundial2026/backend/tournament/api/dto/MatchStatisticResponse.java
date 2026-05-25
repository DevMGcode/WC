package com.mundial2026.backend.tournament.api.dto;

import java.util.Map;

public record MatchStatisticResponse(
        Long teamId,
        String teamName,
        String teamLogoUrl,
        Map<String, String> statistics
) {
}
