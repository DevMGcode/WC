package com.mundial2026.backend.tournament.service;

import com.mundial2026.backend.tournament.domain.Fixture;
import com.mundial2026.backend.tournament.domain.FixtureStatus;
import com.mundial2026.backend.tournament.domain.GroupStage;
import com.mundial2026.backend.tournament.repository.FixtureRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class FixtureStatusScheduler {

    private static final int MATCH_DURATION_MINUTES = 105;

    private final FixtureRepository          fixtureRepository;
    private final StandingsCalculatorService standingsCalculator;

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
