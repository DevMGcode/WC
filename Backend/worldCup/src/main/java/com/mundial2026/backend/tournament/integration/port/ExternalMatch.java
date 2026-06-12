package com.mundial2026.backend.tournament.integration.port;

import java.time.Instant;

/**
 * Vista neutral de un partido devuelto por cualquier proveedor externo.
 *
 * <p>Sobre los campos de venue: API-Football suele dejar {@code venueExternalId=null}
 * para estadios que no participan en una liga regular indexada (estilo NFL/MLS en EE.UU.,
 * todos los de Qatar 2022). Por eso este DTO transporta también {@code venueName} y
 * {@code venueCity}, que sirven como llave compuesta de fallback al persistir.
 */
public record ExternalMatch(
        String externalId,
        Long homeTeamId,
        String homeTeamName,
        Long awayTeamId,
        String awayTeamName,
        Integer homeScore,
        Integer awayScore,
        Integer elapsedMinutes,
        Integer stoppageMinutes,
        MatchStatus status,
        Instant kickoffUtc,
        Long venueExternalId,
        String venueName,
        String venueCity,
        String leagueRound
) {
}
