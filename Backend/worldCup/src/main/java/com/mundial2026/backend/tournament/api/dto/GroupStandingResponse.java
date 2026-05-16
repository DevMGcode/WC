package com.mundial2026.backend.tournament.api.dto;

public record GroupStandingResponse(
        Long teamId,
        String teamName,
        String teamShortName,
        String teamFifaCode,
        String teamFlagUrl,
        Integer position,
        Integer played,
        Integer won,
        Integer drawn,
        Integer lost,
        Integer goalsFor,
        Integer goalsAgainst,
        Integer goalDifference,
        Integer points
) {}
