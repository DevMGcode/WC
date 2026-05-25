package com.mundial2026.backend.tournament.integration.apifootball.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record TeamItem(TeamBlock team, VenueBlock venue) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record TeamBlock(
            Long id,
            String name,
            String code,
            String country,
            Integer founded,
            Boolean national,
            String logo
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record VenueBlock(
            Long id,
            String name,
            String address,
            String city,
            Integer capacity,
            String surface,
            String image
    ) {
    }
}
