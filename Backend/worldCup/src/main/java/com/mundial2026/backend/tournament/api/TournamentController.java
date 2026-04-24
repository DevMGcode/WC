package com.mundial2026.backend.tournament.api;

import com.mundial2026.backend.common.response.ApiResponse;
import com.mundial2026.backend.tournament.api.dto.FixtureResponse;
import com.mundial2026.backend.tournament.api.dto.TournamentResponse;
import com.mundial2026.backend.tournament.api.mapper.TournamentMapper;
import com.mundial2026.backend.tournament.service.TournamentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
}
