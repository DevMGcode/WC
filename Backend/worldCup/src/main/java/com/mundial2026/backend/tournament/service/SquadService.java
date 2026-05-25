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

    private final PlayerDataPort playerDataPort;

    @Cacheable(value = CacheConfig.SQUAD, key = "#teamId")
    public List<SquadPlayerResponse> findByTeam(Long teamId) {
        return playerDataPort.fetchSquad(teamId).stream()
                .map(this::toResponse)
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
