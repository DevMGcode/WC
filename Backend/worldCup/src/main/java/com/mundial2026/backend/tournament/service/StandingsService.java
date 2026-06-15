package com.mundial2026.backend.tournament.service;

import com.mundial2026.backend.config.CacheConfig;
import com.mundial2026.backend.tournament.api.dto.StandingResponse;
import com.mundial2026.backend.tournament.integration.port.ExternalStanding;
import com.mundial2026.backend.tournament.integration.port.StandingsDataPort;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StandingsService {

    /**
     * API-Football, para el Mundial 2026 (formato 48 equipos), devuelve una
     * fila auxiliar con groupName="Ranking of third-placed teams" que lista
     * los 12 mejores 3ros lugares (de los cuales 8 clasifican). Esa fila
     * NO es un grupo real y dispara duplicados si se mezcla con los grupos
     * A-L (ej. en "mejor defensa" o en cualquier listado plano).
     *
     * 2018 y 2022 no devuelven esta fila — el filtro es no-op para esas
     * temporadas, así que es retrocompatible.
     */
    private static final String THIRD_PLACED_RANKING_GROUP = "Ranking of third-placed teams";

    private final StandingsDataPort standingsDataPort;

    /** Filtra la fila auxiliar "Ranking of third-placed teams" que solo aparece en 2026. */
    private static boolean isRealGroup(ExternalStanding s) {
        return s.groupName() != null
            && !THIRD_PLACED_RANKING_GROUP.equalsIgnoreCase(s.groupName().trim());
    }

    @Cacheable(CacheConfig.STANDINGS)
    public List<StandingResponse> findAll() {
        return standingsDataPort.fetchStandings().stream()
                .filter(StandingsService::isRealGroup)
                .map(this::toResponse)
                .toList();
    }

    public List<StandingResponse> findByGroup(String groupCode) {
        String target = "Group " + groupCode.toUpperCase();
        return findAll().stream()
                .filter(s -> target.equalsIgnoreCase(s.groupName()))
                .toList();
    }

    public List<StandingResponse> findFewestGoalsAgainst(int limit) {
        return findAll().stream()
                .filter(s -> s.goalsAgainst() != null && s.teamId() != null)
                .collect(Collectors.toMap(
                        StandingResponse::teamId,
                        s -> s,
                        (a, b) -> a   // API-Football 2026 devuelve cada equipo duplicado; conservar la primera aparición
                ))
                .values().stream()
                .sorted(Comparator.comparingInt(StandingResponse::goalsAgainst))
                .limit(limit)
                .toList();
    }

    private StandingResponse toResponse(ExternalStanding e) {
        return new StandingResponse(
                e.groupName(),
                e.rank(),
                e.teamId(),
                e.teamName(),
                e.teamLogoUrl(),
                e.played(),
                e.won(),
                e.drawn(),
                e.lost(),
                e.goalsFor(),
                e.goalsAgainst(),
                e.goalDifference(),
                e.points(),
                e.form(),
                e.description(),
                e.lastUpdate(),
                e.homePlayed(),
                e.homeWon(),
                e.homeDrawn(),
                e.homeLost(),
                e.homeGoalsFor(),
                e.homeGoalsAgainst(),
                e.awayPlayed(),
                e.awayWon(),
                e.awayDrawn(),
                e.awayLost(),
                e.awayGoalsFor(),
                e.awayGoalsAgainst()
        );
    }
}
