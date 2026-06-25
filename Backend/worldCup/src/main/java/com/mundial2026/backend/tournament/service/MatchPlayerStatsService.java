package com.mundial2026.backend.tournament.service;

import com.mundial2026.backend.config.CacheConfig;
import com.mundial2026.backend.tournament.api.dto.MatchPlayerStatResponse;
import com.mundial2026.backend.tournament.integration.port.ExternalMatchPlayerStat;
import com.mundial2026.backend.tournament.integration.port.MatchPlayerStatsDataPort;
import com.mundial2026.backend.tournament.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class MatchPlayerStatsService {

    private final MatchPlayerStatsDataPort matchPlayerStatsDataPort;
    private final TeamRepository teamRepository;

    @Cacheable(value = CacheConfig.MATCH_PLAYER_STATS, key = "#fixtureExternalId", unless = "#result.isEmpty()")
    public List<MatchPlayerStatResponse> findByFixture(Long fixtureExternalId) {
        List<ExternalMatchPlayerStat> stats =
                matchPlayerStatsDataPort.fetchPlayerStatsByFixture(fixtureExternalId);

        // API-Football devuelve el ID de equipo de su propio catálogo (externo),
        // pero el frontend filtra los jugadores por el ID interno de la BD. Sin
        // esta traducción, ningún jugador coincide con su equipo y la tabla sale
        // vacía aunque los datos lleguen. Resolvemos cada ID externo una sola vez
        // (no por jugador) consultando team.external_provider_id.
        Map<Long, Long> externalToInternal = new HashMap<>();
        stats.stream()
                .map(ExternalMatchPlayerStat::teamId)
                .filter(Objects::nonNull)
                .distinct()
                .forEach(extId -> teamRepository.findByExternalProviderId(extId)
                        .ifPresent(team -> externalToInternal.put(extId, team.getId())));

        return stats.stream()
                .map(e -> toResponse(e, externalToInternal))
                .toList();
    }

    private MatchPlayerStatResponse toResponse(ExternalMatchPlayerStat e,
                                               Map<Long, Long> externalToInternal) {
        // Si no encontramos el equipo en la BD, dejamos el ID externo como
        // fallback (mismo comportamiento que antes) en vez de romper la respuesta.
        Long internalTeamId = e.teamId() == null
                ? null
                : externalToInternal.getOrDefault(e.teamId(), e.teamId());
        return new MatchPlayerStatResponse(
                internalTeamId,
                e.teamName(),
                e.playerId(),
                e.playerName(),
                e.photoUrl(),
                e.minutes(),
                e.shirtNumber(),
                e.position(),
                e.rating(),
                e.captain(),
                e.substitute(),
                e.shotsTotal(),
                e.shotsOn(),
                e.goals(),
                e.assists(),
                e.yellowCards(),
                e.redCards()
        );
    }
}
