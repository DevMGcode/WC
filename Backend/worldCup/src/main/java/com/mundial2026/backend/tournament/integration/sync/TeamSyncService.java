package com.mundial2026.backend.tournament.integration.sync;

import com.mundial2026.backend.tournament.domain.Team;
import com.mundial2026.backend.tournament.integration.apifootball.ApiFootballClient;
import com.mundial2026.backend.tournament.integration.port.ExternalTeam;
import com.mundial2026.backend.tournament.integration.port.TeamDataPort;
import com.mundial2026.backend.tournament.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class TeamSyncService {

    private final TeamDataPort teamDataPort;
    private final TeamRepository teamRepository;
    private final ApiFootballClient apiFootballClient;

    @Transactional
    public SyncResult syncAll() {
        return syncAll(0);
    }

    @Transactional
    public SyncResult syncAll(int season) {
        Iterable<ExternalTeam> teams = season > 0
                ? apiFootballClient.fetchTournamentTeams(season)
                : teamDataPort.fetchTournamentTeams();
        long inserted = 0;
        long updated = 0;
        for (ExternalTeam ext : teams) {
            if (ext.externalId() == null) {
                continue;
            }
            Team existing = teamRepository.findByExternalProviderId(ext.externalId()).orElse(null);
            if (existing == null) {
                teamRepository.save(toNew(ext));
                inserted++;
            } else if (applyUpdate(existing, ext)) {
                teamRepository.save(existing);
                updated++;
            }
        }
        log.info("Team sync done: season={}, inserted={}, updated={}", season > 0 ? season : "default", inserted, updated);
        return new SyncResult(inserted, updated);
    }

    private Team toNew(ExternalTeam ext) {
        Team t = new Team();
        t.setExternalProviderId(ext.externalId());
        applyFields(t, ext);
        return t;
    }

    private boolean applyUpdate(Team existing, ExternalTeam ext) {
        boolean changed = false;
        if (notEq(existing.getName(), ext.name())) { existing.setName(ext.name()); changed = true; }
        if (notEq(existing.getShortName(), ext.code())) { existing.setShortName(ext.code()); changed = true; }
        if (notEq(existing.getFifaCode(), ext.code())) { existing.setFifaCode(ext.code()); changed = true; }
        if (notEq(existing.getCountryName(), ext.country())) { existing.setCountryName(ext.country()); changed = true; }
        if (notEq(existing.getFlagUrl(), ext.logoUrl())) { existing.setFlagUrl(ext.logoUrl()); changed = true; }
        return changed;
    }

    private void applyFields(Team t, ExternalTeam ext) {
        t.setName(ext.name());
        t.setShortName(ext.code());
        t.setFifaCode(ext.code());
        t.setCountryName(ext.country());
        t.setFlagUrl(ext.logoUrl());
    }

    private static boolean notEq(Object a, Object b) {
        if (a == null) {
            return b != null;
        }
        return !a.equals(b);
    }

    public record SyncResult(long inserted, long updated) {
    }
}
