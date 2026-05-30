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
        // Pull ALL fixtures of this group so we can: (a) derive the full team
        // roster of the group (home + away across all fixtures, finished or not)
        // and (b) compute totals from the FINISHED ones only.
        List<Fixture> allFixtures = fixtureRepository
                .findByGroupStageIdOrderByKickoffAtAsc(groupStage.getId());

        // Derive the unique set of teams that belong to this group from its fixtures.
        // This decouples us from the external module (no need to ask /standings) and
        // makes the recalculation self-contained inside the tournament aggregate.
        Map<Long, Team> teamsInGroup = new LinkedHashMap<>();
        for (Fixture f : allFixtures) {
            if (f.getHomeTeam() != null) teamsInGroup.putIfAbsent(f.getHomeTeam().getId(), f.getHomeTeam());
            if (f.getAwayTeam() != null) teamsInGroup.putIfAbsent(f.getAwayTeam().getId(), f.getAwayTeam());
        }

        // Start every team in the group at zero — this handles the initial-seed
        // case (empty group_standing table) without any external coupling.
        Map<Long, Stats> stats = new LinkedHashMap<>();
        for (Team t : teamsInGroup.values()) stats.put(t.getId(), new Stats(t));

        // Accumulate totals from the finished fixtures only.
        List<Fixture> finished = allFixtures.stream()
                .filter(f -> f.getStatus() == FixtureStatus.FINISHED
                          && f.getHomeScore() != null
                          && f.getAwayScore() != null)
                .toList();

        for (Fixture f : finished) {
            int hs = f.getHomeScore();
            int as = f.getAwayScore();
            Stats ht = stats.get(f.getHomeTeam().getId());
            Stats at = stats.get(f.getAwayTeam().getId());

            ht.played++; at.played++;
            ht.goalsFor += hs; ht.goalsAgainst += as;
            at.goalsFor += as; at.goalsAgainst += hs;

            if (hs > as)      { ht.won++; ht.points += 3; at.lost++; }
            else if (hs < as) { at.won++; at.points += 3; ht.lost++; }
            else              { ht.drawn++; ht.points++; at.drawn++; at.points++; }
        }

        // Sort ALL teams in the group (including those that haven't played yet)
        // by FIFA tiebreakers: points → goal difference → goals for.
        List<Stats> sorted = stats.values().stream()
                .sorted(Comparator
                        .comparingInt((Stats s) -> -s.points)
                        .thenComparingInt(s -> -(s.goalsFor - s.goalsAgainst))
                        .thenComparingInt(s -> -s.goalsFor))
                .toList();

        // Upsert each team's standing row. If the row doesn't exist yet, this
        // doubles as the initial seed (zero-stats row) — so a single call to
        // this method on a group whose group_standing is empty populates it.
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

        log.info("Standings recalculados — Grupo {}: {} equipos, {} partidos jugados",
                groupStage.getCode(), sorted.size(), finished.size());
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
