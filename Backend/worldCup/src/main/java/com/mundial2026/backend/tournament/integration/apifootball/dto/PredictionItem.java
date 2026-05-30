package com.mundial2026.backend.tournament.integration.apifootball.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record PredictionItem(Predictions predictions) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Predictions(
            Winner winner,
            @JsonProperty("win_or_draw") Boolean winOrDraw,
            String advice,
            Percent percent
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Winner(Long id, String name, String comment) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Percent(String home, String draw, String away) {
    }
}
