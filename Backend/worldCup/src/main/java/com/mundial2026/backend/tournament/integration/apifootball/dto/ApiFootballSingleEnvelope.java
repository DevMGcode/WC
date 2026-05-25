package com.mundial2026.backend.tournament.integration.apifootball.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Envelope used by endpoints that return a single object (not a list) inside `response`.
 * Currently only /status. All other endpoints use {@link ApiFootballEnvelope}.
 *
 * `parameters` and `errors` are typed as Object because api-football returns them as
 * either an empty array `[]` or an object `{ key: value }`.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record ApiFootballSingleEnvelope<T>(
        String get,
        Object parameters,
        Object errors,
        Integer results,
        T response
) {
}
