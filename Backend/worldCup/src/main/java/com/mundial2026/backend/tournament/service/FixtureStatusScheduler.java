package com.mundial2026.backend.tournament.service;

import com.mundial2026.backend.tournament.domain.Fixture;
import com.mundial2026.backend.tournament.domain.FixtureStatus;
import com.mundial2026.backend.tournament.domain.GroupStage;
import com.mundial2026.backend.tournament.integration.apifootball.ApiFootballClient;
import com.mundial2026.backend.tournament.integration.port.ExternalMatch;
import com.mundial2026.backend.tournament.integration.port.MatchStatus;
import com.mundial2026.backend.tournament.repository.FixtureRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class FixtureStatusScheduler {

    // 90' regulares + hasta ~15' descuento por tiempo + 15' margen de seguridad.
    // El scheduler es solo fallback: API-Football actualiza el estado real vía polling.
    private static final int MATCH_DURATION_MINUTES = 130;

    private final FixtureRepository          fixtureRepository;
    private final StandingsCalculatorService standingsCalculator;
    private final ApiFootballClient          apiFootballClient;

    @Scheduled(fixedRate = 60_000)
    @Transactional
    public void updateFixtureStatuses() {
        OffsetDateTime now = OffsetDateTime.now();

        List<Fixture> scheduled = fixtureRepository.findByStatusOrderByKickoffAtAsc(FixtureStatus.SCHEDULED);
        int toLive = 0;
        for (Fixture f : scheduled) {
            if (!now.isBefore(f.getKickoffAt())) {
                f.setStatus(FixtureStatus.LIVE);
                toLive++;
            }
        }

        Set<GroupStage> groupsToRecalculate = new LinkedHashSet<>();
        List<Fixture> live = fixtureRepository.findByStatusOrderByKickoffAtAsc(FixtureStatus.LIVE);
        int toFinished = 0;
        for (Fixture f : live) {
            if (!now.isBefore(f.getKickoffAt().plusMinutes(MATCH_DURATION_MINUTES + f.getExtraMinutes()))) {
                // Verificar con la API antes de marcar FINISHED — puede ser INT/SUSP
                if (f.getExternalProviderId() != null) {
                    try {
                        Optional<ExternalMatch> current = apiFootballClient.fetchById(String.valueOf(f.getExternalProviderId()));
                        if (current.isPresent()) {
                            MatchStatus realStatus = current.get().status();
                            if (realStatus != MatchStatus.FINISHED && realStatus != MatchStatus.UNKNOWN) {
                                log.info("[StatusScheduler] Fixture {} tiene status={} en API — no se marca FINISHED por tiempo",
                                        f.getId(), realStatus);
                                continue;
                            }
                        }
                    } catch (Exception e) {
                        log.warn("[StatusScheduler] No se pudo verificar status de fixture {} en API — se aplica fallback por tiempo. cause={}",
                                f.getId(), e.getMessage());
                    }
                }
                f.setStatus(FixtureStatus.FINISHED);
                toFinished++;
                if (f.getGroupStage() != null) {
                    groupsToRecalculate.add(f.getGroupStage());
                }
            }
        }

        if (toLive > 0 || toFinished > 0) {
            log.info("Fixture status update: {} → LIVE, {} → FINISHED", toLive, toFinished);
        }

        groupsToRecalculate.forEach(standingsCalculator::recalculateForGroup);
    }
}
