package com.mundial2026.backend.tournament.integration.port;

public record ExternalTeam(
        Long externalId,
        String name,
        String code,
        String country,
        Integer founded,
        Boolean national,
        String logoUrl,
        Long venueId,
        String venueName,
        String venueCity
) {
}
