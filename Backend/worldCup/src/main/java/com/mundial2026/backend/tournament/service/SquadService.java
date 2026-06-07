package com.mundial2026.backend.tournament.service;

import com.mundial2026.backend.config.CacheConfig;
import com.mundial2026.backend.tournament.api.dto.SquadPlayerResponse;
import com.mundial2026.backend.tournament.integration.port.ExternalSquadPlayer;
import com.mundial2026.backend.tournament.integration.port.PlayerDataPort;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SquadService {

    /** Cuantos jugadores ve un usuario Free (11 titulares — sin suplentes ni cuerpo). */
    public static final int FREE_SQUAD_LIMIT = 11;

    private final PlayerDataPort playerDataPort;

    /** Plantilla completa cacheada — el controller decide cuantos devolver. */
    @Cacheable(value = CacheConfig.SQUAD, key = "#teamId")
    public List<SquadPlayerResponse> findByTeam(Long teamId) {
        return playerDataPort.fetchSquad(teamId).stream()
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
