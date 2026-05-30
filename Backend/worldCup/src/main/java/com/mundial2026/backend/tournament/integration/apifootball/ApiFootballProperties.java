package com.mundial2026.backend.tournament.integration.apifootball;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "apifootball")
public record ApiFootballProperties(
        @NotBlank String baseUrl,
        String apiKey,
        @NotNull Mode mode,
        @NotBlank String rapidapiHost,
        @NotNull Integer leagueId,
        @NotNull Integer season,
        @Positive Integer timeoutMs,
        @Positive Integer connectTimeoutMs
) {
    public enum Mode {
        DIRECT,
        RAPIDAPI
    }
}