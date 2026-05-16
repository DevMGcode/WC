package com.mundial2026.backend.tournament.api.dto;

public record TeamResponse(
        Long id,
        String name,
        String shortName,
        String fifaCode,
        String countryName,
        String flagUrl
) {
}