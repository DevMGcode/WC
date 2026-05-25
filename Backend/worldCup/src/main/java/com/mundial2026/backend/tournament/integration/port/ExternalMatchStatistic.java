package com.mundial2026.backend.tournament.integration.port;

import java.util.Map;

public record ExternalMatchStatistic(
        Long teamId,
        String teamName,
        String teamLogoUrl,
        Map<String, String> statistics
) {
}
