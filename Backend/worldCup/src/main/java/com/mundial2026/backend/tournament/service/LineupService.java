package com.mundial2026.backend.tournament.service;

import com.mundial2026.backend.config.CacheConfig;
import com.mundial2026.backend.tournament.api.dto.LineupResponse;
import com.mundial2026.backend.tournament.integration.port.ExternalLineup;
import com.mundial2026.backend.tournament.integration.port.LineupDataPort;
import com.mundial2026.backend.tournament.repository.FixtureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LineupService {

    private static final Duration PRE_KICKOFF_WINDOW = Duration.ofHours(3);

    private final LineupDataPort lineupDataPort;
    private final FixtureRepository fixtureRepository;

    @Cacheable(value = CacheConfig.LINEUPS, key = "#fixtureExternalId", unless = "#result.isEmpty()")
    public List<LineupResponse> findByFixture(Long fixtureExternalId) {
        if (!isWithinUsefulWindow(fixtureExternalId)) {
            return List.of();
        }
        return lineupDataPort.fetchLineupsByFixture(fixtureExternalId).stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Las alineaciones se publican ~1h antes del kickoff: consultar antes de la
     * ventana previa es gastar cuota en vacío. DESPUÉS del partido son dato
     * histórico estable que la API conserva — siempre se pueden consultar
     * (y quedan cacheadas). Solo se bloquea el "demasiado pronto".
     */
    private boolean isWithinUsefulWindow(Long fixtureExternalId) {
        return fixtureRepository.findByExternalProviderId(fixtureExternalId)
                .map(f -> !OffsetDateTime.now(ZoneOffset.UTC)
                        .isBefore(f.getKickoffAt().minus(PRE_KICKOFF_WINDOW)))
                .orElse(true);
    }

    private LineupResponse toResponse(ExternalLineup e) {
        return new LineupResponse(
                e.teamId(),
                e.teamName(),
                e.teamLogoUrl(),
                e.coachId(),
                e.coachName(),
                e.coachPhotoUrl(),
                e.formation(),
                e.startXI().stream()
                        .map(p -> new LineupResponse.LineupPlayer(
                                p.playerId(), p.playerName(), p.shirtNumber(), p.position(), p.grid()))
                        .toList(),
                e.substitutes().stream()
                        .map(p -> new LineupResponse.LineupPlayer(
                                p.playerId(), p.playerName(), p.shirtNumber(), p.position(), p.grid()))
                        .toList()
        );
    }
}
