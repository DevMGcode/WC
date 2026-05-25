package com.mundial2026.backend.tournament.integration.apifootball.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record StandingsResponse(LeagueBlock league) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record LeagueBlock(
            Long id,
            String name,
            String country,
            String logo,
            String flag,
            Integer season,
            List<List<StandingEntry>> standings
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record StandingEntry(
            Integer rank,
            TeamRef team,
            Integer points,
            Integer goalsDiff,
            String group,
            String form,
            String status,
            String description,
            Stats all,
            Stats home,
            Stats away,
            Instant update
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record TeamRef(Long id, String name, String logo) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Stats(Integer played, Integer win, Integer draw, Integer lose, Goals goals) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Goals(@JsonProperty("for") Integer goalsFor, Integer against) {
    }
}
