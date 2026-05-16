package com.mundial2026.backend.tournament.service;

import com.mundial2026.backend.tournament.domain.*;
import com.mundial2026.backend.tournament.repository.FixtureRepository;
import com.mundial2026.backend.tournament.repository.GroupStandingRepository;
import com.mundial2026.backend.tournament.repository.GroupStageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class StandingsCalculatorService {

    private final FixtureRepository        fixtureRepository;
    private final GroupStandingRepository  groupStandingRepository;
    private final GroupStageRepository     groupStageRepository;

    @Transactional
    public void recalculateForGroup(GroupStage groupStage) {
        List<Fixture> finished = fixtureRepository
                .findByGroupStageIdOrderByKickoffAtAsc(groupStage.getId())
                .stream()
                .filter(f -> f.getStatus() == FixtureStatus.FINISHED
                          && f.getHomeScore() != null
                          && f.getAwayScore() != null)
                .toList();

        Map<Long, Stats> map = new LinkedHashMap<>();

        for (Fixture f : finished) {
            Team home = f.getHomeTeam();
            Team away = f.getAwayTeam();
            int hs = f.getHomeScore();
            int as = f.getAwayScore();

            map.putIfAbsent(home.getId(), new Stats(home));
            map.putIfAbsent(away.getId(), new Stats(away));

            Stats ht = map.get(home.getId());
            Stats at = map.get(away.getId());

            ht.played++; at.played++;
            ht.goalsFor += hs; ht.goalsAgainst += as;
            at.goalsFor += as; at.goalsAgainst += hs;

            if (hs > as)      { ht.won++; ht.points += 3; at.lost++; }
            else if (hs < as) { at.won++; at.points += 3; ht.lost++; }
            else              { ht.drawn++; ht.points++; at.drawn++; at.points++; }
        }

        List<Stats> sorted = map.values().stream()
                .sorted(Comparator
                        .comparingInt((Stats s) -> -s.points)
                        .thenComparingInt(s -> -(s.goalsFor - s.goalsAgainst))
                        .thenComparingInt(s -> -s.goalsFor))
                .toList();

        for (int i = 0; i < sorted.size(); i++) {
            Stats s = sorted.get(i);
            GroupStanding standing = groupStandingRepository
                    .findByGroupStageIdAndTeamId(groupStage.getId(), s.team.getId())
                    .orElse(new GroupStanding());

            standing.setTournament(groupStage.getTournament());
            standing.setGroupStage(groupStage);
            standing.setTeam(s.team);
            standing.setPosition(i + 1);
            standing.setPlayed(s.played);
            standing.setWon(s.won);
            standing.setDrawn(s.drawn);
            standing.setLost(s.lost);
            standing.setGoalsFor(s.goalsFor);
            standing.setGoalsAgainst(s.goalsAgainst);
            standing.setPoints(s.points);
            standing.setUpdatedAt(OffsetDateTime.now());

            groupStandingRepository.save(standing);
        }

        log.info("Standings recalculados — Grupo {}: {} equipos", groupStage.getCode(), sorted.size());
    }

    @Transactional
    public void recalculateAllGroups(Long tournamentId) {
        List<GroupStage> groups = groupStageRepository.findByTournamentIdOrderByCodeAsc(tournamentId);
        groups.forEach(this::recalculateForGroup);
        log.info("Standings recalculados — {} grupos del torneo {}", groups.size(), tournamentId);
    }

    private static class Stats {
        final Team team;
        int played, won, drawn, lost, goalsFor, goalsAgainst, points;
        Stats(Team team) { this.team = team; }
    }
}
