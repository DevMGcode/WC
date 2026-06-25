package com.mundial2026.backend.tournament.api.dto;

public record MatchEventResponse(
        Long id,
        Long fixtureId,
        String playerName,
        String playerOut,
        Long teamId,
        String teamName,
        String teamFifaCode,
        Integer minute,
        Integer extraMinute,
        String eventType,
        String detail,
        String source,
        Boolean verified,
        String apiPlayerName,
        Boolean mismatch,
        Integer homeScoreAtEvent,
        Integer awayScoreAtEvent
) {}
