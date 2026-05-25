package com.mundial2026.backend.tournament.integration.apifootball.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;

@JsonIgnoreProperties(ignoreUnknown = true)
public record FixtureItem(
        FixtureBlock fixture,
        LeagueBlock league,
        TeamsBlock teams,
        GoalsBlock goals,
        ScoreBlock score
) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record FixtureBlock(
            Long id,
            String referee,
            String timezone,
            Instant date,
            Long timestamp,
            VenueBlock venue,
            StatusBlock status
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record StatusBlock(
            @JsonProperty("long") String longText,
            @JsonProperty("short") String shortCode,
            Integer elapsed
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record VenueBlock(Long id, String name, String city) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record LeagueBlock(
            Long id,
            String name,
            String country,
            String logo,
            String flag,
            Integer season,
            String round
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record TeamsBlock(TeamRef home, TeamRef away) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record TeamRef(Long id, String name, String logo, Boolean winner) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record GoalsBlock(Integer home, Integer away) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record ScoreBlock(
            ScorePair halftime,
            ScorePair fulltime,
            ScorePair extratime,
            ScorePair penalty
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record ScorePair(Integer home, Integer away) {
    }
}