package com.mundial2026.backend.tournament.integration.sync;

import com.mundial2026.backend.tournament.domain.Fixture;
import com.mundial2026.backend.tournament.domain.FixtureStatus;
import com.mundial2026.backend.tournament.repository.FixtureRepository;
import com.mundial2026.backend.tournament.service.MatchEventService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Al arrancar la aplicación, inserta los STATUS_CHANGE (halftime / second half / fulltime)
 * en todos los partidos FINISHED que todavía no los tienen.
 * El marcador al descanso se reconstruye desde los goles en BD hasta el minuto 45.
 * Completamente idempotente: si un partido ya tiene STATUS_CHANGE se salta.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class StatusChangeBackfillRunner implements ApplicationRunner {

    private final FixtureRepository  fixtureRepository;
    private final MatchEventService  matchEventService;

    @Override
    public void run(ApplicationArguments args) {
        List<Fixture> finished = fixtureRepository.findByStatus(FixtureStatus.FINISHED);
        if (finished.isEmpty()) return;

        int processed = 0;
        for (Fixture f : finished) {
            try {
                Long homeId = f.getHomeTeam() != null ? f.getHomeTeam().getId() : null;
                Long awayId = f.getAwayTeam() != null ? f.getAwayTeam().getId() : null;
                if (homeId == null || awayId == null) continue;
                matchEventService.backfillStatusChangesIfMissing(
                        f.getId(), homeId, awayId, f.getHomeScore(), f.getAwayScore(),
                        f.getExtraMinutes());
                processed++;
            } catch (Exception ex) {
                log.warn("[Backfill] Error STATUS_CHANGE fixture {}: {}", f.getId(), ex.getMessage());
            }
        }
        log.info("[Backfill] STATUS_CHANGE procesados: {} de {} partidos finalizados", processed, finished.size());
    }
}
