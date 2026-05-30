package com.mundial2026.backend.tournament.integration.apifootball.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDate;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record PlayerStatsItem(Player player, List<Statistics> statistics) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Player(
            Long id,
            String name,
            String firstname,
            String lastname,
            Integer age,
            Birth birth,
            String nationality,
            String height,
            String weight,
            Boolean injured,
            String photo
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Birth(LocalDate date, String place, String country) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Statistics(
            TeamRef team,
            LeagueRef league,
            Games games,
            Shots shots,
            Goals goals,
            Cards cards
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record TeamRef(Long id, String name, String logo) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record LeagueRef(Long id, String name, String country, String logo, String flag, Integer season) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Games(
            Integer appearences,
            Integer lineups,
            Integer minutes,
            Integer number,
            String position,
            String rating,
            Boolean captain
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Shots(Integer total, Integer on) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Goals(Integer total, Integer conceded, Integer assists, Integer saves) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Cards(Integer yellow, Integer yellowred, Integer red) {
    }
}
