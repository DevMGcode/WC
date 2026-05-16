package com.mundial2026.backend.tournament.service;

import com.mundial2026.backend.common.exception.ResourceNotFoundException;
import com.mundial2026.backend.tournament.api.dto.CreateFixtureRequest;
import com.mundial2026.backend.tournament.api.dto.GroupResponse;
import com.mundial2026.backend.tournament.api.dto.GroupStandingResponse;
import com.mundial2026.backend.tournament.api.dto.UpdateFixtureResultRequest;
import com.mundial2026.backend.tournament.api.dto.UpdateFixtureScheduleRequest;
import com.mundial2026.backend.tournament.domain.Fixture;
import com.mundial2026.backend.tournament.domain.FixtureStatus;
import com.mundial2026.backend.tournament.domain.GroupStage;
import com.mundial2026.backend.tournament.domain.GroupStanding;
import com.mundial2026.backend.tournament.domain.Stage;
import com.mundial2026.backend.tournament.domain.Team;
import com.mundial2026.backend.tournament.domain.Tournament;
import com.mundial2026.backend.tournament.repository.FixtureRepository;
import com.mundial2026.backend.tournament.repository.GroupStageRepository;
import com.mundial2026.backend.tournament.repository.GroupStandingRepository;
import com.mundial2026.backend.tournament.repository.StageRepository;
import com.mundial2026.backend.tournament.repository.TeamRepository;
import com.mundial2026.backend.tournament.repository.TournamentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TournamentService {

    private final TournamentRepository      tournamentRepository;
    private final FixtureRepository         fixtureRepository;
    private final GroupStageRepository      groupStageRepository;
    private final GroupStandingRepository   groupStandingRepository;
    private final StageRepository           stageRepository;
    private final TeamRepository            teamRepository;
    private final StandingsCalculatorService standingsCalculator;

    @Transactional(readOnly = true)
    public List<Tournament> findAllTournaments() {
        return tournamentRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Tournament findTournamentById(Long id) {
        return tournamentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Torneo no encontrado con id=" + id));
    }

    @Transactional(readOnly = true)
    public List<Fixture> findLiveFixtures() {
        return fixtureRepository.findByStatusOrderByKickoffAtAsc(FixtureStatus.LIVE);
    }

    @Transactional(readOnly = true)
    public Fixture findFixtureById(Long id) {
        return fixtureRepository.findWithRelationsById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Partido no encontrado con id=" + id));
    }

    @Transactional(readOnly = true)
    public List<Fixture> findFixturesByTournamentId(Long tournamentId) {
        if (!tournamentRepository.existsById(tournamentId)) {
            throw new ResourceNotFoundException("Torneo no encontrado con id=" + tournamentId);
        }

        return fixtureRepository.findByTournamentIdOrderByKickoffAtAsc(tournamentId);
    }

    @Transactional(readOnly = true)
    public List<Stage> findStagesByTournamentId(Long tournamentId) {
        if (!tournamentRepository.existsById(tournamentId)) {
            throw new ResourceNotFoundException("Torneo no encontrado con id=" + tournamentId);
        }
        return stageRepository.findByTournamentIdOrderBySortOrderAsc(tournamentId);
    }

    @Transactional
    public Fixture createFixture(CreateFixtureRequest request) {
        Tournament tournament = tournamentRepository.findById(request.tournamentId())
                .orElseThrow(() -> new ResourceNotFoundException("Torneo no encontrado"));
        Stage stage = stageRepository.findById(request.stageId())
                .orElseThrow(() -> new ResourceNotFoundException("Etapa no encontrada"));
        Team homeTeam = teamRepository.findById(request.homeTeamId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipo local no encontrado"));
        Team awayTeam = teamRepository.findById(request.awayTeamId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipo visitante no encontrado"));

        GroupStage groupStage = null;
        if (request.groupStageId() != null) {
            groupStage = groupStageRepository.findById(request.groupStageId())
                    .orElseThrow(() -> new ResourceNotFoundException("Grupo no encontrado"));
        }

        String name = (request.name() != null && !request.name().isBlank())
                ? request.name()
                : homeTeam.getName() + " vs " + awayTeam.getName();

        Fixture fixture = new Fixture();
        fixture.setTournament(tournament);
        fixture.setStage(stage);
        fixture.setGroupStage(groupStage);
        fixture.setHomeTeam(homeTeam);
        fixture.setAwayTeam(awayTeam);
        fixture.setName(name);
        fixture.setKickoffAt(request.kickoffAt());
        fixture.setPredictionLockedAt(request.kickoffAt().minusMinutes(5));
        fixture.setStatus(FixtureStatus.SCHEDULED);

        Fixture saved = fixtureRepository.save(fixture);
        return fixtureRepository.findWithRelationsById(saved.getId()).orElseThrow();
    }

    @Transactional
    public Fixture updateFixtureSchedule(Long id, UpdateFixtureScheduleRequest request) {
        Fixture fixture = fixtureRepository.findWithRelationsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Partido no encontrado con id=" + id));

        if (request.homeTeamId() != null) {
            fixture.setHomeTeam(teamRepository.findById(request.homeTeamId())
                    .orElseThrow(() -> new ResourceNotFoundException("Equipo local no encontrado")));
        }
        if (request.awayTeamId() != null) {
            fixture.setAwayTeam(teamRepository.findById(request.awayTeamId())
                    .orElseThrow(() -> new ResourceNotFoundException("Equipo visitante no encontrado")));
        }
        if (request.stageId() != null) {
            fixture.setStage(stageRepository.findById(request.stageId())
                    .orElseThrow(() -> new ResourceNotFoundException("Etapa no encontrada")));
        }
        if (request.groupStageId() != null) {
            fixture.setGroupStage(groupStageRepository.findById(request.groupStageId())
                    .orElseThrow(() -> new ResourceNotFoundException("Grupo no encontrado")));
        }
        if (request.kickoffAt() != null) {
            fixture.setKickoffAt(request.kickoffAt());
            fixture.setPredictionLockedAt(request.kickoffAt().minusMinutes(5));
        }
        if (request.name() != null && !request.name().isBlank()) {
            fixture.setName(request.name());
        }

        fixtureRepository.save(fixture);
        return fixtureRepository.findWithRelationsById(id).orElseThrow();
    }

    @Transactional
    public Fixture extendFixture(Long id, int extraMinutes) {
        Fixture fixture = fixtureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Partido no encontrado con id=" + id));
        fixture.setExtraMinutes(fixture.getExtraMinutes() + extraMinutes);
        fixture.setStatus(FixtureStatus.LIVE);
        fixtureRepository.save(fixture);
        return fixtureRepository.findWithRelationsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Partido no encontrado con id=" + id));
    }

    @Transactional
    public void deleteFixture(Long id) {
        if (!fixtureRepository.existsById(id)) {
            throw new ResourceNotFoundException("Partido no encontrado con id=" + id);
        }
        fixtureRepository.deleteById(id);
    }

    @Transactional
    public Fixture updateFixtureResult(Long id, UpdateFixtureResultRequest request) {
        Fixture fixture = fixtureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Partido no encontrado con id=" + id));
        fixture.setHomeScore(request.homeScore());
        fixture.setAwayScore(request.awayScore());
        fixture.setStatus(FixtureStatus.FINISHED);
        fixtureRepository.save(fixture);
        if (fixture.getGroupStage() != null) {
            standingsCalculator.recalculateForGroup(fixture.getGroupStage());
        }
        return fixtureRepository.findWithRelationsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Partido no encontrado con id=" + id));
    }

    @Transactional(readOnly = true)
    public List<GroupResponse> getGroupsWithStandings(Long tournamentId) {
        if (!tournamentRepository.existsById(tournamentId)) {
            throw new ResourceNotFoundException("Torneo no encontrado con id=" + tournamentId);
        }

        List<GroupStage> stages = groupStageRepository.findByTournamentIdOrderByCodeAsc(tournamentId);

        return stages.stream().map(stage -> {
            // Equipo en este grupo (para saber quiénes pertenecen)
            List<GroupStanding> members = groupStandingRepository.findByGroupStageIdOrderByPositionAsc(stage.getId());

            // stats: [played, won, drawn, lost, goalsFor, goalsAgainst, points]
            Map<Long, int[]> stats = new LinkedHashMap<>();
            Map<Long, Team> teamMap = new LinkedHashMap<>();
            members.forEach(m -> {
                stats.put(m.getTeam().getId(), new int[7]);
                teamMap.put(m.getTeam().getId(), m.getTeam());
            });

            // Calcular desde los fixtures FINISHED del grupo
            List<Fixture> fixtures = fixtureRepository.findByGroupStageIdOrderByKickoffAtAsc(stage.getId());
            for (Fixture f : fixtures) {
                if (f.getStatus() != FixtureStatus.FINISHED
                        || f.getHomeScore() == null || f.getAwayScore() == null) continue;

                Long homeId = f.getHomeTeam().getId();
                Long awayId = f.getAwayTeam().getId();
                int hg = f.getHomeScore();
                int ag = f.getAwayScore();

                int[] home = stats.computeIfAbsent(homeId, k -> new int[7]);
                int[] away = stats.computeIfAbsent(awayId, k -> new int[7]);

                home[0]++; away[0]++;
                home[4] += hg; home[5] += ag;
                away[4] += ag; away[5] += hg;

                if (hg > ag)      { home[1]++; home[6] += 3; away[3]++; }
                else if (ag > hg) { away[1]++; away[6] += 3; home[3]++; }
                else              { home[2]++; home[6]++;     away[2]++; away[6]++; }
            }

            // Construir respuestas ordenadas por pts → DG → GF
            List<GroupStandingResponse> rows = new ArrayList<>();
            for (Map.Entry<Long, int[]> entry : stats.entrySet()) {
                Team t = teamMap.get(entry.getKey());
                if (t == null) continue;
                int[] s = entry.getValue();
                rows.add(new GroupStandingResponse(
                    t.getId(), t.getName(), t.getShortName(), t.getFifaCode(), t.getFlagUrl(),
                    0, s[0], s[1], s[2], s[3], s[4], s[5], s[4] - s[5], s[6]
                ));
            }

            rows.sort(Comparator
                .comparingInt(GroupStandingResponse::points).reversed()
                .thenComparingInt(r -> -r.goalDifference())
                .thenComparingInt(r -> -r.goalsFor()));

            // Asignar posiciones después del sort
            List<GroupStandingResponse> ranked = new ArrayList<>();
            for (int i = 0; i < rows.size(); i++) {
                GroupStandingResponse r = rows.get(i);
                ranked.add(new GroupStandingResponse(
                    r.teamId(), r.teamName(), r.teamShortName(), r.teamFifaCode(), r.teamFlagUrl(),
                    i + 1, r.played(), r.won(), r.drawn(), r.lost(),
                    r.goalsFor(), r.goalsAgainst(), r.goalDifference(), r.points()
                ));
            }

            return new GroupResponse(stage.getId(), stage.getCode(), stage.getName(), ranked);
        }).toList();
    }
}
