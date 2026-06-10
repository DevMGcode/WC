package com.mundial2026.backend.tournament.integration.apifootball.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDate;
import java.util.List;

/**
 * Response item for GET /leagues?id={id}&season={season}.
 * The `seasons[].coverage` block declares which data types the plan can fetch
 * for this competition (fixtures.events, fixtures.lineups, standings, players, etc.).
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record LeagueItem(LeagueBlock league, CountryBlock country, List<SeasonBlock> seasons) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record LeagueBlock(Long id, String name, String type, String logo) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record CountryBlock(String name, String code, String flag) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record SeasonBlock(
            Integer year,
            LocalDate start,
            LocalDate end,
            Boolean current,
            Coverage coverage
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Coverage(
            FixturesCoverage fixtures,
            Boolean standings,
            Boolean players,
            @JsonProperty("top_scorers") Boolean topScorers,
            @JsonProperty("top_assists") Boolean topAssists,
            @JsonProperty("top_cards")   Boolean topCards,
            Boolean injuries,
            Boolean predictions,
            Boolean odds
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record FixturesCoverage(
            Boolean events,
            Boolean lineups,
            @JsonProperty("statistics_fixtures") Boolean statisticsFixtures,
            @JsonProperty("statistics_players")  Boolean statisticsPlayers
    ) {
    }
}
