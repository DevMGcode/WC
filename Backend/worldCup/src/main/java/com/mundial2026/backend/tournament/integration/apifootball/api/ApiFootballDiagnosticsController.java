package com.mundial2026.backend.tournament.integration.apifootball.api;

import com.mundial2026.backend.common.response.ApiResponse;
import com.mundial2026.backend.tournament.integration.apifootball.ApiFootballClient;
import com.mundial2026.backend.tournament.integration.apifootball.dto.LeagueItem;
import com.mundial2026.backend.tournament.integration.apifootball.dto.StatusResponse;
import com.mundial2026.backend.tournament.integration.port.ExternalMatch;
import com.mundial2026.backend.tournament.integration.port.ExternalPlayerStat;
import com.mundial2026.backend.tournament.integration.port.ExternalSquadPlayer;
import com.mundial2026.backend.tournament.integration.port.ExternalStanding;
import com.mundial2026.backend.tournament.integration.port.ExternalTeam;
import com.mundial2026.backend.tournament.integration.sync.FixtureSyncService;
import com.mundial2026.backend.tournament.integration.sync.TeamSyncService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

// TODO: Diagnostic-only controller. Remove or secure with admin role before production deploy.
@RestController
@RequestMapping("/api/v1/admin/apifootball")
@RequiredArgsConstructor
public class ApiFootballDiagnosticsController {

    private final ApiFootballClient client;
    private final TeamSyncService teamSyncService;
    private final FixtureSyncService fixtureSyncService;

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<Optional<StatusResponse>>> status() {
        return ResponseEntity.ok(ApiResponse.ok("API-Football status", client.fetchAccountStatus()));
    }

    @GetMapping("/coverage")
    public ResponseEntity<ApiResponse<Optional<LeagueItem>>> coverage() {
        return ResponseEntity.ok(ApiResponse.ok("League coverage", client.fetchLeagueCoverage()));
    }

    @GetMapping("/standings")
    public ResponseEntity<ApiResponse<List<ExternalStanding>>> standings() {
        return ResponseEntity.ok(ApiResponse.ok("Tournament standings", client.fetchStandings()));
    }

    @GetMapping("/topscorers")
    public ResponseEntity<ApiResponse<List<ExternalPlayerStat>>> topScorers() {
        return ResponseEntity.ok(ApiResponse.ok("Top scorers", client.fetchTopScorers()));
    }

    @GetMapping("/topassists")
    public ResponseEntity<ApiResponse<List<ExternalPlayerStat>>> topAssists() {
        return ResponseEntity.ok(ApiResponse.ok("Top assists", client.fetchTopAssists()));
    }

    @GetMapping("/squad/{teamId}")
    public ResponseEntity<ApiResponse<List<ExternalSquadPlayer>>> squad(@PathVariable Long teamId) {
        return ResponseEntity.ok(ApiResponse.ok("Team squad", client.fetchSquad(teamId)));
    }

    @GetMapping("/fixtures")
    public ResponseEntity<ApiResponse<List<ExternalMatch>>> fixtures() {
        return ResponseEntity.ok(ApiResponse.ok("Tournament fixtures", client.fetchTournamentFixtures()));
    }

    @GetMapping("/fixtures/live")
    public ResponseEntity<ApiResponse<List<ExternalMatch>>> live() {
        return ResponseEntity.ok(ApiResponse.ok("Live matches", client.fetchLiveMatches()));
    }

    @GetMapping("/fixtures/{externalId}")
    public ResponseEntity<ApiResponse<Optional<ExternalMatch>>> fixtureById(@PathVariable String externalId) {
        return ResponseEntity.ok(ApiResponse.ok("Fixture", client.fetchById(externalId)));
    }

    @GetMapping("/teams")
    public ResponseEntity<ApiResponse<List<ExternalTeam>>> teams() {
        return ResponseEntity.ok(ApiResponse.ok("Tournament teams", client.fetchTournamentTeams()));
    }

    @PostMapping("/sync/teams")
    public ResponseEntity<ApiResponse<TeamSyncService.SyncResult>> syncTeams() {
        return ResponseEntity.ok(ApiResponse.ok("Teams synced", teamSyncService.syncAll()));
    }

    @PostMapping("/sync/fixtures")
    public ResponseEntity<ApiResponse<FixtureSyncService.SyncResult>> syncFixtures() {
        return ResponseEntity.ok(ApiResponse.ok("Fixtures synced", fixtureSyncService.syncAllTournamentFixtures()));
    }

    @PostMapping("/sync/fixtures/live")
    public ResponseEntity<ApiResponse<FixtureSyncService.SyncResult>> syncLiveFixtures() {
        return ResponseEntity.ok(ApiResponse.ok("Live fixtures synced", fixtureSyncService.syncLiveFixtures()));
    }
}
