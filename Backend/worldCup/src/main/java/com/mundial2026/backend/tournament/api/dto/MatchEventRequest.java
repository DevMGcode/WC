package com.mundial2026.backend.tournament.api.dto;

public record MatchEventRequest(
        String playerName,
        Long teamId,
        Integer minute,
        String eventType   // "GOAL" por defecto si viene null
) {}
