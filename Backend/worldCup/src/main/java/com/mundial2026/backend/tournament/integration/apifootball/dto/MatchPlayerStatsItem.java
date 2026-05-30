package com.mundial2026.backend.tournament.integration.apifootball.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record MatchPlayerStatsItem(TeamRef team, List<PlayerEntry> players) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record TeamRef(Long id, String name, String logo) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record PlayerEntry(PlayerRef player, List<Statistics> statistics) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record PlayerRef(Long id, String name, String photo) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Statistics(
            Games games,
            Shots shots,
            Goals goals,
            Cards cards
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Games(
            Integer minutes,
            Integer number,
            String position,
            String rating,
            Boolean captain,
            Boolean substitute
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Shots(Integer total, Integer on) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Goals(Integer total, Integer conceded, Integer assists, Integer saves) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Cards(Integer yellow, Integer red) {
    }
}
