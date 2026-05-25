package com.mundial2026.backend.tournament.api;

import com.mundial2026.backend.common.response.ApiResponse;
import com.mundial2026.backend.tournament.api.dto.StandingResponse;
import com.mundial2026.backend.tournament.service.StandingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/public/standings")
@RequiredArgsConstructor
public class StandingsController {

    private final StandingsService standingsService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<StandingResponse>>> findAll() {
        return ResponseEntity.ok(ApiResponse.ok("Standings", standingsService.findAll()));
    }

    @GetMapping("/group/{group}")
    public ResponseEntity<ApiResponse<List<StandingResponse>>> findByGroup(@PathVariable String group) {
        return ResponseEntity.ok(ApiResponse.ok("Standings for group " + group.toUpperCase(),
                standingsService.findByGroup(group)));
    }

    @GetMapping("/best-defense")
    public ResponseEntity<ApiResponse<List<StandingResponse>>> bestDefense(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(ApiResponse.ok("Teams with fewest goals against",
                standingsService.findFewestGoalsAgainst(limit)));
    }
}
