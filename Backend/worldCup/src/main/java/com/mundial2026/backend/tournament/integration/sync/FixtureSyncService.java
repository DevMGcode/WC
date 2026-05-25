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

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
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
        return persist(apiFootballClient.fetchTournamentFixtures());
    }

    @Transactional
    public SyncResult syncLiveFixtures() {
        return persist(matchDataPort.fetchLiveMatches());
    }

    private SyncResult persist(List<ExternalMatch> matches) {
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
            GroupStage groupStage = resolveGroupStage(tournament, ext.leagueRound()).orElse(null);
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

    private String mapStageCode(String round) {
        if (round == null) return null;
        String r = round.toLowerCase();
        if (r.startsWith("group")) return "GROUP";
        if (r.contains("round of 32")) return "R32";
        if (r.contains("round of 16")) return "R16";
        if (r.contains("quarter")) return "QF";
        if (r.contains("semi")) return "SF";
        if (r.contains("3rd") || r.contains("third")) return "THIRD";
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
