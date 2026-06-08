package com.mundial2026.backend.tournament.service;

import com.mundial2026.backend.config.CacheConfig;
import com.mundial2026.backend.tournament.api.dto.SquadPlayerResponse;
import com.mundial2026.backend.tournament.domain.Team;
import com.mundial2026.backend.tournament.integration.port.ExternalSquadPlayer;
import com.mundial2026.backend.tournament.integration.port.PlayerDataPort;
import com.mundial2026.backend.tournament.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SquadService {

    /** Cuantos jugadores ve un usuario Free (11 titulares — sin suplentes ni cuerpo). */
    public static final int FREE_SQUAD_LIMIT = 11;

    private final PlayerDataPort playerDataPort;
    private final TeamRepository teamRepository;

    /**
     * Plantilla completa cacheada — el controller decide cuantos devolver.
     *
     * <p>Recibe el {@code teamId} interno de la BD. Resuelve a {@code externalProviderId}
     * antes de llamar al proveedor — API-Football usa sus propios ids (distintos del
     * id de nuestra BD). Sin este lookup, llamamos {@code /players/squads?team=<idBD>}
     * y recibimos la plantilla de un equipo random cuyo externalId coincide con
     * nuestro id interno (bug latente que descubrimos al construir la pantalla
     * "Equipos" en el frontend).
     */
    @Cacheable(value = CacheConfig.SQUAD, key = "#teamId")
    public List<SquadPlayerResponse> findByTeam(Long teamId) {
        Team team = teamRepository.findById(teamId).orElse(null);
        if (team == null || team.getExternalProviderId() == null) {
            log.warn("Cannot fetch squad: team id={} not found in DB or has no externalProviderId", teamId);
            return List.of();
        }
        return playerDataPort.fetchSquad(team.getExternalProviderId()).stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Plantilla limitada para Free (los primeros 11 — titulares aproximados).
     * Premium recibe la lista completa via findByTeam(teamId).
     */
    public List<SquadPlayerResponse> findByTeamForFree(Long teamId) {
        return findByTeam(teamId).stream()
                .limit(FREE_SQUAD_LIMIT)
                .toList();
    }

    private SquadPlayerResponse toResponse(ExternalSquadPlayer e) {
        return new SquadPlayerResponse(
                e.teamId(),
                e.teamName(),
                e.playerId(),
                e.playerName(),
                e.shirtNumber(),
                e.position(),
                e.age(),
                e.photoUrl()
        );
    }
}
