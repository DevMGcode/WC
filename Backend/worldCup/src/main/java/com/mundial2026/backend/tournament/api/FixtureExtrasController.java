package com.mundial2026.backend.tournament.api;

import com.mundial2026.backend.common.response.ApiResponse;
import com.mundial2026.backend.tournament.api.dto.FixturePredictionResponse;
import com.mundial2026.backend.tournament.api.dto.HeadToHeadFixtureResponse;
import com.mundial2026.backend.tournament.api.dto.LineupResponse;
import com.mundial2026.backend.tournament.api.dto.MatchPlayerStatResponse;
import com.mundial2026.backend.tournament.api.dto.MatchStatisticResponse;
import com.mundial2026.backend.tournament.domain.Fixture;
import com.mundial2026.backend.tournament.repository.FixtureRepository;
import com.mundial2026.backend.tournament.service.FixturePredictionService;
import com.mundial2026.backend.tournament.service.HeadToHeadService;
import com.mundial2026.backend.tournament.service.LineupService;
import com.mundial2026.backend.tournament.service.MatchPlayerStatsService;
import com.mundial2026.backend.tournament.service.MatchStatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

/**
 * Endpoints por-partido (Olas 2 + 3).
 * NOTA: el endpoint /events se expone en MatchEventController del equipo,
 * que gestiona admin manual + reconciliación con API-Football.
 */
@RestController
@RequestMapping("/api/v1/public/fixtures")
@RequiredArgsConstructor
public class FixtureExtrasController {

    private final LineupService lineupService;
    private final HeadToHeadService headToHeadService;
    private final FixturePredictionService fixturePredictionService;
    private final MatchStatisticsService matchStatisticsService;
    private final MatchPlayerStatsService matchPlayerStatsService;
    private final FixtureRepository fixtureRepository;

    /** Resuelve el externalProviderId dado el ID interno. Retorna null si no existe o no tiene ID externo. */
    private Long resolveExternalId(Long fixtureId) {
        return fixtureRepository.findById(fixtureId)
                .map(Fixture::getExternalProviderId)
                .orElse(null);
    }

    @GetMapping("/{fixtureId}/lineups")
    public ResponseEntity<ApiResponse<List<LineupResponse>>> lineups(@PathVariable Long fixtureId) {
        Long extId = resolveExternalId(fixtureId);
        if (extId == null) return ResponseEntity.ok(ApiResponse.ok("Lineups", Collections.emptyList()));
        return ResponseEntity.ok(ApiResponse.ok("Lineups", lineupService.findByFixture(extId)));
    }

    @GetMapping("/{fixtureId}/predictions")
    public ResponseEntity<ApiResponse<Optional<FixturePredictionResponse>>> prediction(@PathVariable Long fixtureId) {
        Long extId = resolveExternalId(fixtureId);
        if (extId == null) return ResponseEntity.ok(ApiResponse.ok("Fixture prediction", Optional.empty()));
        return ResponseEntity.ok(ApiResponse.ok("Fixture prediction",
                fixturePredictionService.findByFixture(extId)));
    }

    @GetMapping("/headtohead")
    public ResponseEntity<ApiResponse<List<HeadToHeadFixtureResponse>>> headToHead(
            @RequestParam Long team1,
            @RequestParam Long team2,
            @RequestParam(required = false) Integer last) {
        return ResponseEntity.ok(ApiResponse.ok("Head-to-head",
                headToHeadService.findBetween(team1, team2, last)));
    }

    @GetMapping("/{fixtureId}/statistics")
    public ResponseEntity<ApiResponse<List<MatchStatisticResponse>>> statistics(@PathVariable Long fixtureId) {
        Long extId = resolveExternalId(fixtureId);
        if (extId == null) return ResponseEntity.ok(ApiResponse.ok("Match statistics", Collections.emptyList()));
        return ResponseEntity.ok(ApiResponse.ok("Match statistics",
                matchStatisticsService.findByFixture(extId)));
    }

    @GetMapping("/{fixtureId}/players")
    public ResponseEntity<ApiResponse<List<MatchPlayerStatResponse>>> players(@PathVariable Long fixtureId) {
        Long extId = resolveExternalId(fixtureId);
        if (extId == null) return ResponseEntity.ok(ApiResponse.ok("Match player stats", Collections.emptyList()));
        return ResponseEntity.ok(ApiResponse.ok("Match player stats",
                matchPlayerStatsService.findByFixture(extId)));
    }
}
