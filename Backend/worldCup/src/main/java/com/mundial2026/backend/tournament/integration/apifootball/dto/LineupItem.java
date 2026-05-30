package com.mundial2026.backend.tournament.integration.apifootball.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record LineupItem(
        TeamBlock team,
        CoachBlock coach,
        String formation,
        List<PlayerWrapper> startXI,
        List<PlayerWrapper> substitutes
) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record TeamBlock(Long id, String name, String logo) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record CoachBlock(Long id, String name, String photo) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record PlayerWrapper(PlayerBlock player) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record PlayerBlock(
            Long id,
            String name,
            Integer number,
            String pos,
            String grid
    ) {
    }
}
