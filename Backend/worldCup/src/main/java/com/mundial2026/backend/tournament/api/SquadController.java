package com.mundial2026.backend.tournament.api;

import com.mundial2026.backend.common.response.ApiResponse;
import com.mundial2026.backend.tournament.api.dto.SquadPlayerResponse;
import com.mundial2026.backend.tournament.service.SquadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/public/teams")
@RequiredArgsConstructor
public class SquadController {

    private final SquadService squadService;

    @GetMapping("/{teamId}/squad")
    public ResponseEntity<ApiResponse<List<SquadPlayerResponse>>> squad(@PathVariable Long teamId) {
        return ResponseEntity.ok(ApiResponse.ok("Team squad", squadService.findByTeam(teamId)));
    }
}
