package com.mundial2026.backend.tournament.api;

import com.mundial2026.backend.common.response.ApiResponse;
import com.mundial2026.backend.tournament.api.dto.CreateFixtureRequest;
import com.mundial2026.backend.tournament.api.dto.FixtureResponse;
import com.mundial2026.backend.tournament.api.dto.GroupResponse;
import com.mundial2026.backend.tournament.api.dto.StageResponse;
import com.mundial2026.backend.tournament.api.dto.TournamentResponse;
import com.mundial2026.backend.tournament.api.dto.UpdateFixtureResultRequest;
import com.mundial2026.backend.tournament.api.dto.UpdateFixtureScheduleRequest;
import com.mundial2026.backend.tournament.api.mapper.TournamentMapper;
import com.mundial2026.backend.tournament.service.TournamentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/public/tournaments")
@RequiredArgsConstructor
public class TournamentController {

    private final TournamentService tournamentService;
    private final TournamentMapper tournamentMapper;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TournamentResponse>>> findAll() {
        List<TournamentResponse> data = tournamentService.findAllTournaments()
                .stream()
                .map(tournamentMapper::toResponse)
                .toList();

        return ResponseEntity.ok(ApiResponse.ok("Torneos encontrados", data));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TournamentResponse>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Torneo encontrado",
                tournamentMapper.toResponse(tournamentService.findTournamentById(id))
        ));
    }

    @GetMapping("/fixtures/live")
    public ResponseEntity<ApiResponse<List<FixtureResponse>>> findLiveFixtures() {
        List<FixtureResponse> data = tournamentService.findLiveFixtures()
                .stream()
                .map(tournamentMapper::toResponse)
                .toList();

        return ResponseEntity.ok(ApiResponse.ok("Partidos en vivo encontrados", data));
    }

    @GetMapping("/fixtures/{id}")
    public ResponseEntity<ApiResponse<FixtureResponse>> findFixtureById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Partido encontrado",
                tournamentMapper.toResponse(tournamentService.findFixtureById(id))
        ));
    }

    @GetMapping("/{id}/fixtures")
    public ResponseEntity<ApiResponse<List<FixtureResponse>>> findFixturesByTournamentId(@PathVariable Long id) {
        List<FixtureResponse> data = tournamentService.findFixturesByTournamentId(id)
                .stream()
                .map(tournamentMapper::toResponse)
                .toList();

        return ResponseEntity.ok(ApiResponse.ok("Partidos del torneo encontrados", data));
    }

    @GetMapping("/{id}/groups")
    public ResponseEntity<ApiResponse<List<GroupResponse>>> findGroupsByTournamentId(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Grupos del torneo encontrados",
                tournamentService.getGroupsWithStandings(id)
        ));
    }

    @PatchMapping("/fixtures/{id}/result")
    public ResponseEntity<ApiResponse<FixtureResponse>> updateFixtureResult(
            @PathVariable Long id,
            @Valid @RequestBody UpdateFixtureResultRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Resultado actualizado",
                tournamentMapper.toResponse(tournamentService.updateFixtureResult(id, request))
        ));
    }

    @GetMapping("/{id}/stages")
    public ResponseEntity<ApiResponse<List<StageResponse>>> findStagesByTournamentId(@PathVariable Long id) {
        List<StageResponse> data = tournamentService.findStagesByTournamentId(id)
                .stream()
                .map(s -> new StageResponse(s.getId(), s.getCode(), s.getName(), s.getSortOrder()))
                .toList();
        return ResponseEntity.ok(ApiResponse.ok("Etapas encontradas", data));
    }

    @PostMapping("/fixtures")
    public ResponseEntity<ApiResponse<FixtureResponse>> createFixture(
            @Valid @RequestBody CreateFixtureRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                "Partido creado",
                tournamentMapper.toResponse(tournamentService.createFixture(request))
        ));
    }

    @PutMapping("/fixtures/{id}")
    public ResponseEntity<ApiResponse<FixtureResponse>> updateFixtureSchedule(
            @PathVariable Long id,
            @RequestBody UpdateFixtureScheduleRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Partido actualizado",
                tournamentMapper.toResponse(tournamentService.updateFixtureSchedule(id, request))
        ));
    }

    @PatchMapping("/fixtures/{id}/extend")
    public ResponseEntity<ApiResponse<FixtureResponse>> extendFixture(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> body) {
        int extra = body.getOrDefault("extraMinutes", 0);
        return ResponseEntity.ok(ApiResponse.ok(
                "Partido extendido",
                tournamentMapper.toResponse(tournamentService.extendFixture(id, extra))
        ));
    }

    @DeleteMapping("/fixtures/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFixture(@PathVariable Long id) {
        tournamentService.deleteFixture(id);
        return ResponseEntity.ok(ApiResponse.ok("Partido eliminado", null));
    }
}
