package com.mundial2026.backend.tournament.integration.apifootball.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record SquadItem(TeamRef team, List<PlayerRef> players) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record TeamRef(Long id, String name, String logo) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record PlayerRef(
            Long id,
            String name,
            Integer age,
            Integer number,
            String position,
            String photo
    ) {
    }
}
