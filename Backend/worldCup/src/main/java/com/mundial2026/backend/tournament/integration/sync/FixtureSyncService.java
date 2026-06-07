package com.mundial2026.backend.tournament.integration.sync;

import com.mundial2026.backend.tournament.domain.Fixture;
import com.mundial2026.backend.tournament.domain.FixtureStatus;
import com.mundial2026.backend.tournament.domain.GroupStage;
import com.mundial2026.backend.tournament.domain.Stage;
import com.mundial2026.backend.tournament.domain.Team;
import com.mundial2026.backend.tournament.domain.Tournament;
import com.mundial2026.backend.tournament.integration.port.ExternalMatch;
import com.mundial2026.backend.tournament.integration.port.MatchDataPort;
import com.mundial2026.backend.tournament.integration.port.MatchStatus;
import com.mundial2026.backend.realtime.event.FixtureScoreUpdatedEvent;
import com.mundial2026.backend.realtime.payload.MatchLiveDelta;
import com.mundial2026.backend.tournament.integration.apifootball.ApiFootballClient;
import com.mundial2026.backend.tournament.repository.FixtureRepository;
import com.mundial2026.backend.tournament.repository.GroupStageRepository;
import com.mundial2026.backend.tournament.repository.StageRepository;
import com.mundial2026.backend.tournament.repository.TeamRepository;
import com.mundial2026.backend.tournament.repository.TournamentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mundial2026.backend.tournament.integration.port.ExternalStanding;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class FixtureSyncService {

    private static final String TOURNAMENT_CODE = "WC2026";
    private static final int DEFAULT_LOCK_MINUTES_BEFORE = 5;

    private final MatchDataPort matchDataPort;
    private final ApiFootballClient apiFootballClient;
    private final FixtureRepository fixtureRepository;
    private final TournamentRepository tournamentRepository;
    private final StageRepository stageRepository;
    private final GroupStageRepository groupStageRepository;
    private final TeamRepository teamRepository;
    private final ApplicationEventPublisher events;

    @Transactional
    public SyncResult syncAllTournamentFixtures() {
        return syncAllTournamentFixtures(0);
    }

    @Transactional
    public SyncResult syncAllTournamentFixtures(int season) {
        // API-Football exposes the team→group association through /standings,
        // NOT through /fixtures (where `leagueRound` is the matchday: "Group Stage - 1/2/3").
        // We fetch standings once and build a team→groupCode map for the whole sync.
        Map<Long, String> teamToGroup = buildTeamGroupMap(season);
        List<ExternalMatch> fixtures = season > 0
                ? apiFootballClient.fetchTournamentFixtures(season)
                : apiFootballClient.fetchTournamentFixtures();
        return persist(fixtures, teamToGroup);
    }

    @Transactional
    public SyncResult syncLiveFixtures() {
        // Live syncs are score-only; we don't need to recompute the group mapping here.
        return persist(matchDataPort.fetchLiveMatches(), Map.of());
    }

    /**
     * Builds an in-memory map of {@code teamExternalId → groupCode (A, B, ..., L)}
     * by hitting the /standings endpoint once. Falls back to an empty map if the
     * call fails so the fixture sync can still proceed.
     */
    private Map<Long, String> buildTeamGroupMap(int season) {
        try {
            List<ExternalStanding> standings = season > 0
                    ? apiFootballClient.fetchStandings(season)
                    : apiFootballClient.fetchStandings();
            Map<Long, String> map = new HashMap<>();
            for (ExternalStanding s : standings) {
                String groupCode = parseGroupLetter(s.groupName());
                if (groupCode != null && s.teamId() != null) {
                    map.put(s.teamId(), groupCode);
                }
            }
            log.info("Built team→group map from /standings: season={}, {} teams across {} groups",
                    season > 0 ? season : "default", map.size(), map.values().stream().distinct().count());
            return map;
        } catch (Exception e) {
            log.warn("Could not fetch standings to build team→group map; fixtures will be saved without group_stage_id. cause={}",
                    e.getMessage());
            return Map.of();
        }
    }

    /** "Group A" → "A". Returns null for non-group entries (e.g. "Ranking of third-placed teams"). */
    private String parseGroupLetter(String groupName) {
        if (groupName == null) return null;
        String trimmed = groupName.trim();
        if (!trimmed.toLowerCase().startsWith("group ")) return null;
        String tail = trimmed.substring("Group ".length()).trim();
        return tail.isEmpty() ? null : tail.toUpperCase();
    }

    private SyncResult persist(List<ExternalMatch> matches, Map<Long, String> teamToGroup) {
        Tournament tournament = tournamentRepository.findByCode(TOURNAMENT_CODE).orElse(null);
        if (tournament == null) {
            log.warn("Tournament {} not found in DB; skipping fixture sync", TOURNAMENT_CODE);
            return new SyncResult(0, 0, matches.size());
        }

        long inserted = 0;
        long updated = 0;
        long skipped = 0;
        List<MatchLiveDelta> deltasToPublish = new ArrayList<>();

        for (ExternalMatch ext : matches) {
            if (ext.externalId() == null) {
                skipped++;
                continue;
            }
            Long externalId = parseLong(ext.externalId());
            if (externalId == null) {
                skipped++;
                continue;
            }

            Stage stage = resolveStage(tournament, ext.leagueRound()).orElse(null);
            // First try to resolve the group from the team→group map (sourced from /standings).
            // Fall back to parsing it from the round name (rare — used to work for older seasons
            // where API-Football encoded the letter in leagueRound, e.g. "Group Stage - A").
            GroupStage groupStage = resolveGroupStageFromTeamMap(tournament, ext.homeTeamId(), teamToGroup)
                    .or(() -> resolveGroupStage(tournament, ext.leagueRound()))
                    .orElse(null);
            Team home = teamRepository.findByExternalProviderId(ext.homeTeamId()).orElse(null);
            Team away = teamRepository.findByExternalProviderId(ext.awayTeamId()).orElse(null);

            if (stage == null || home == null || away == null || ext.kickoffUtc() == null) {
                log.warn("Skipping fixture externalId={} due to missing dependency (stage={}, home={}, away={}, kickoff={})",
                        externalId, stage != null, home != null, away != null, ext.kickoffUtc() != null);
                skipped++;
                continue;
            }

            Fixture existing = fixtureRepository.findByExternalProviderId(externalId).orElse(null);
            if (existing == null) {
                fixtureRepository.save(buildNew(externalId, tournament, stage, groupStage, home, away, ext));
                inserted++;
            } else if (applyUpdate(existing, stage, groupStage, home, away, ext)) {
                fixtureRepository.save(existing);
                updated++;
                if (ext.status() != null && (ext.status().isLive() || ext.status().isFinished())) {
                    deltasToPublish.add(new MatchLiveDelta(
                            existing.getId(),
                            ext.homeScore(),
                            ext.awayScore(),
                            ext.elapsedMinutes(),
                            ext.status(),
                            Instant.now()
                    ));
                }
            }
        }

        deltasToPublish.forEach(d -> events.publishEvent(new FixtureScoreUpdatedEvent(d)));

        log.info("Fixture sync done: inserted={}, updated={}, skipped={}, deltas={}",
                inserted, updated, skipped, deltasToPublish.size());
        return new SyncResult(inserted, updated, skipped);
    }

    private Fixture buildNew(Long externalId, Tournament tournament, Stage stage, GroupStage groupStage,
                             Team home, Team away, ExternalMatch ext) {
        Fixture f = new Fixture();
        f.setExternalProviderId(externalId);
        f.setTournament(tournament);
        f.setStage(stage);
        f.setGroupStage(groupStage);
        f.setHomeTeam(home);
        f.setAwayTeam(away);
        f.setName(home.getName() + " vs " + away.getName());
        OffsetDateTime kickoff = ext.kickoffUtc().atOffset(ZoneOffset.UTC);
        f.setKickoffAt(kickoff);
        f.setPredictionLockMinutesBefore(DEFAULT_LOCK_MINUTES_BEFORE);
        f.setPredictionLockedAt(kickoff.minusMinutes(DEFAULT_LOCK_MINUTES_BEFORE));
        f.setStatus(mapStatus(ext.status()));
        return f;
    }

    private boolean applyUpdate(Fixture existing, Stage stage, GroupStage groupStage,
                                Team home, Team away, ExternalMatch ext) {
        boolean changed = false;
        OffsetDateTime kickoff = ext.kickoffUtc().atOffset(ZoneOffset.UTC);
        FixtureStatus newStatus = mapStatus(ext.status());

        if (!existing.getKickoffAt().isEqual(kickoff)) {
            existing.setKickoffAt(kickoff);
            existing.setPredictionLockedAt(kickoff.minusMinutes(
                    existing.getPredictionLockMinutesBefore() != null
                            ? existing.getPredictionLockMinutesBefore() : DEFAULT_LOCK_MINUTES_BEFORE));
            changed = true;
        }
        if (existing.getStatus() != newStatus) {
            existing.setStatus(newStatus);
            changed = true;
        }
        if (existing.getStage() == null || !existing.getStage().getId().equals(stage.getId())) {
            existing.setStage(stage);
            changed = true;
        }
        if (!sameId(existing.getGroupStage(), groupStage)) {
            existing.setGroupStage(groupStage);
            changed = true;
        }
        if (!existing.getHomeTeam().getId().equals(home.getId())) {
            existing.setHomeTeam(home);
            changed = true;
        }
        if (!existing.getAwayTeam().getId().equals(away.getId())) {
            existing.setAwayTeam(away);
            changed = true;
        }
        return changed;
    }

    private Optional<Stage> resolveStage(Tournament t, String leagueRound) {
        return Optional.ofNullable(mapStageCode(leagueRound))
                .flatMap(code -> stageRepository.findByTournamentIdAndCode(t.getId(), code));
    }

    private Optional<GroupStage> resolveGroupStage(Tournament t, String leagueRound) {
        return Optional.ofNullable(parseGroupCode(leagueRound))
                .flatMap(code -> groupStageRepository.findByTournamentIdAndCode(t.getId(), code));
    }

    /**
     * Resolves the group of a fixture from the precomputed team→group map (built from
     * /standings at the start of the sync). This is the canonical path for API-Football,
     * since its /fixtures endpoint encodes the matchday in {@code leagueRound}, not the
     * group letter.
     */
    private Optional<GroupStage> resolveGroupStageFromTeamMap(Tournament t, Long homeTeamExternalId,
                                                              Map<Long, String> teamToGroup) {
        if (homeTeamExternalId == null || teamToGroup.isEmpty()) return Optional.empty();
        String code = teamToGroup.get(homeTeamExternalId);
        if (code == null) return Optional.empty();
        return groupStageRepository.findByTournamentIdAndCode(t.getId(), code);
    }

    private String mapStageCode(String round) {
        if (round == null) return null;
        String r = round.toLowerCase();
        // Map API-Football round names → stage codes used in this DB (Spanish).
        // Check 3rd-place / round-of-X BEFORE the generic "final" check, otherwise
        // "Semi-finals" → would match "final" first. Order matters.
        if (r.startsWith("group")) return "GROUPS";
        if (r.contains("round of 16")) return "OCTAVOS";
        if (r.contains("quarter")) return "CUARTOS";
        if (r.contains("semi")) return "SEMIFINAL";
        if (r.contains("3rd") || r.contains("third")) return "TERCER_PUESTO";
        if (r.contains("final")) return "FINAL";
        return null;
    }

    /** Parses "Group Stage - A" or "Group Stage - 1" → "A" / "1" (uppercased). */
    private String parseGroupCode(String round) {
        if (round == null || !round.toLowerCase().startsWith("group")) {
            return null;
        }
        int dash = round.indexOf('-');
        if (dash < 0 || dash + 1 >= round.length()) {
            return null;
        }
        return round.substring(dash + 1).trim().toUpperCase();
    }

    private FixtureStatus mapStatus(MatchStatus s) {
        if (s == null) return FixtureStatus.SCHEDULED;
        return switch (s) {
            case LIVE, HALFTIME, BREAK, PENALTY_SHOOTOUT -> FixtureStatus.LIVE;
            case FINISHED -> FixtureStatus.FINISHED;
            case POSTPONED -> FixtureStatus.POSTPONED;
            case CANCELLED, ABANDONED -> FixtureStatus.CANCELLED;
            case SCHEDULED, UNKNOWN -> FixtureStatus.SCHEDULED;
        };
    }

    private static Long parseLong(String s) {
        try {
            return Long.parseLong(s);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private static boolean sameId(GroupStage a, GroupStage b) {
        if (a == null && b == null) return true;
        if (a == null || b == null) return false;
        return a.getId().equals(b.getId());
    }

    public record SyncResult(long inserted, long updated, long skipped) {
    }
}
