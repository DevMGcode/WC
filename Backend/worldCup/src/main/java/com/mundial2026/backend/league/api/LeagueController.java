package com.mundial2026.backend.league.api;

import com.mundial2026.backend.common.response.ApiResponse;
import com.mundial2026.backend.league.api.dto.CreateLeagueRequest;
import com.mundial2026.backend.league.api.dto.DeleteLeagueRequest;
import com.mundial2026.backend.league.api.dto.JoinLeagueRequest;
import com.mundial2026.backend.league.api.dto.LeagueMemberResponse;
import com.mundial2026.backend.league.api.dto.LeagueRankingResponse;
import com.mundial2026.backend.league.api.dto.LeagueResponse;
import com.mundial2026.backend.league.api.dto.LeaveLeagueRequest;
import com.mundial2026.backend.league.api.dto.TransferLeagueOwnershipRequest;
import com.mundial2026.backend.league.service.LeagueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/public/leagues")
@RequiredArgsConstructor
public class LeagueController {

    private final LeagueService leagueService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<LeagueResponse>>> findAll() {
        return ResponseEntity.ok(ApiResponse.ok("Ligas encontradas", leagueService.findAll()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<LeagueResponse>> create(@Valid @RequestBody CreateLeagueRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Liga creada correctamente", leagueService.create(request)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LeagueResponse>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Liga encontrada", leagueService.findById(id)));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<LeagueResponse>>> findByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok("Ligas del usuario encontradas", leagueService.findByUserId(userId)));
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<ApiResponse<List<LeagueMemberResponse>>> findMembers(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Miembros de la liga encontrados", leagueService.findMembers(id)));
    }

    @PostMapping("/join")
    public ResponseEntity<ApiResponse<LeagueMemberResponse>> join(@Valid @RequestBody JoinLeagueRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("El usuario se unió a la liga", leagueService.join(request)));
    }

    @PostMapping("/{id}/leave")
    public ResponseEntity<ApiResponse<Void>> leave(@PathVariable Long id, @Valid @RequestBody LeaveLeagueRequest request) {
        leagueService.leave(id, request);
        return ResponseEntity.ok(ApiResponse.ok("El usuario salió de la liga", null));
    }

    @GetMapping("/{id}/ranking")
    public ResponseEntity<ApiResponse<List<LeagueRankingResponse>>> ranking(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Ranking de la liga encontrado", leagueService.findRanking(id)));
    }

    @PostMapping("/{id}/transfer-ownership")
    public ResponseEntity<ApiResponse<LeagueResponse>> transferOwnership(
            @PathVariable Long id,
            @Valid @RequestBody TransferLeagueOwnershipRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Propiedad de la liga transferida correctamente",
                leagueService.transferOwnership(id, request)
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id, @Valid @RequestBody DeleteLeagueRequest request) {
        leagueService.delete(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Liga eliminada correctamente", null));
    }
}
