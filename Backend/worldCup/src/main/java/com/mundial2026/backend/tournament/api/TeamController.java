package com.mundial2026.backend.tournament.api;

import com.mundial2026.backend.common.response.ApiResponse;
import com.mundial2026.backend.tournament.api.dto.TeamResponse;
import com.mundial2026.backend.tournament.api.mapper.TournamentMapper;
import com.mundial2026.backend.tournament.service.TeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/public/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;
    private final TournamentMapper tournamentMapper;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TeamResponse>>> findAll() {
        List<TeamResponse> data = teamService.findAllTeams()
                .stream()
                .map(tournamentMapper::toTeamResponse)
                .toList();

        return ResponseEntity.ok(ApiResponse.ok("Equipos encontrados", data));
    }
}