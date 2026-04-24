package com.mundial2026.backend.tournament.api.dto;

public record TournamentResponse(
        Long id,
        String code,
        String name,
        String hostCountries,
        String status
) {
}
