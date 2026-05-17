package com.mundial2026.backend.tournament.api.dto;

public record MatchEventResponse(
        Long id,
        Long fixtureId,
        String playerName,
        Long teamId,
        String teamName,
        String teamFifaCode,
        Integer minute,
        String eventType,
        String source,
        Boolean verified,
        String apiPlayerName,
        Boolean mismatch
) {}
