package com.mundial2026.backend.tournament.integration.apifootball.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ApiFootballEnvelope<T>(
        String get,
        Object parameters,
        Object errors,
        Integer results,
        Paging paging,
        List<T> response
) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Paging(Integer current, Integer total) {
    }
}