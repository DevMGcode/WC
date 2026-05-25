package com.mundial2026.backend.tournament.integration.apifootball.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record MatchEventEntryItem(
        TimeBlock time,
        TeamRef team,
        PlayerRef player,
        PlayerRef assist,
        String type,
        String detail,
        String comments
) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record TimeBlock(Integer elapsed, Integer extra) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record TeamRef(Long id, String name, String logo) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record PlayerRef(Long id, String name) {
    }
}
