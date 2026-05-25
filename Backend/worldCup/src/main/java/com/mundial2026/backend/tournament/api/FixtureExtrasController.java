package com.mundial2026.backend.tournament.api;

import com.mundial2026.backend.common.response.ApiResponse;
import com.mundial2026.backend.tournament.api.dto.FixturePredictionResponse;
import com.mundial2026.backend.tournament.api.dto.HeadToHeadFixtureResponse;
import com.mundial2026.backend.tournament.api.dto.LineupResponse;
import com.mundial2026.backend.tournament.api.dto.MatchEventResponse;
import com.mundial2026.backend.tournament.api.dto.MatchPlayerStatResponse;
import com.mundial2026.backend.tournament.api.dto.MatchStatisticResponse;
import com.mundial2026.backend.tournament.service.FixturePredictionService;
import com.mundial2026.backend.tournament.service.HeadToHeadService;
import com.mundial2026.backend.tournament.service.LineupService;
import com.mundial2026.backend.tournament.service.MatchEventService;
import com.mundial2026.backend.tournament.service.MatchPlayerStatsService;
import com.mundial2026.backend.tournament.service.MatchStatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/public/fixtures")
@RequiredArgsConstructor
public class FixtureExtrasController {

    private final LineupService lineupService;
    private final HeadToHeadService headToHeadService;
    private final FixturePredictionService fixturePredictionService;
    private final MatchEventService matchEventService;
    private final MatchStatisticsService matchStatisticsService;
    private final MatchPlayerStatsService matchPlayerStatsService;

    @GetMapping("/{fixtureId}/lineups")
    public ResponseEntity<ApiResponse<List<LineupResponse>>> lineups(@PathVariable Long fixtureId) {
        return ResponseEntity.ok(ApiResponse.ok("Lineups", lineupService.findByFixture(fixtureId)));
    }

    @GetMapping("/{fixtureId}/predictions")
    public ResponseEntity<ApiResponse<Optional<FixturePredictionResponse>>> prediction(@PathVariable Long fixtureId) {
        return ResponseEntity.ok(ApiResponse.ok("Fixture prediction",
                fixturePredictionService.findByFixture(fixtureId)));
    }

    @GetMapping("/headtohead")
    public ResponseEntity<ApiResponse<List<HeadToHeadFixtureResponse>>> headToHead(
            @RequestParam Long team1,
            @RequestParam Long team2,
            @RequestParam(required = false) Integer last) {
        return ResponseEntity.ok(ApiResponse.ok("Head-to-head",
                headToHeadService.findBetween(team1, team2, last)));
    }

    @GetMapping("/{fixtureId}/events")
    public ResponseEntity<ApiResponse<List<MatchEventResponse>>> events(@PathVariable Long fixtureId) {
        return ResponseEntity.ok(ApiResponse.ok("Match events",
                matchEventService.findByFixture(fixtureId)));
    }

    @GetMapping("/{fixtureId}/statistics")
    public ResponseEntity<ApiResponse<List<MatchStatisticResponse>>> statistics(@PathVariable Long fixtureId) {
        return ResponseEntity.ok(ApiResponse.ok("Match statistics",
                matchStatisticsService.findByFixture(fixtureId)));
    }

    @GetMapping("/{fixtureId}/players")
    public ResponseEntity<ApiResponse<List<MatchPlayerStatResponse>>> players(@PathVariable Long fixtureId) {
        return ResponseEntity.ok(ApiResponse.ok("Match player stats",
                matchPlayerStatsService.findByFixture(fixtureId)));
    }
}
