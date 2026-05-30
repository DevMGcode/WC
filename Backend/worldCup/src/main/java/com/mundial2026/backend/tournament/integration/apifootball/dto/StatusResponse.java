package com.mundial2026.backend.tournament.integration.apifootball.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record StatusResponse(
        Account account,
        Subscription subscription,
        Requests requests
) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Account(String firstname, String lastname, String email) {
    }

    /**
     * `end` is kept as String because api-football is inconsistent — some plans return
     * "yyyy-MM-dd", others "yyyy-MM-ddTHH:mm:ss+ZZ:ZZ". String shields us from breaking
     * when the provider changes shape.
     */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Subscription(String plan, String end, Boolean active) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Requests(
            Integer current,
            @JsonProperty("limit_day") Integer limitDay
    ) {
    }
}