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
import com.mundial2026.backend.security.SecurityUtils;
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
@RequestMapping("/api/v1/leagues")
@RequiredArgsConstructor
public class LeagueController {

    private final LeagueService leagueService;
    private final SecurityUtils securityUtils;

    @GetMapping
    public ResponseEntity<ApiResponse<List<LeagueResponse>>> findAll() {
        // Listado global de TODAS las ligas privadas: solo ADMIN. Exponerlo a
        // cualquier usuario filtraba nombres, códigos y dueños de ligas ajenas.
        // El frontend no lo usa (ver verificación Fase 2); los usuarios ven sus
        // ligas con /user/{id} y se unen por código.
        securityUtils.requireAdmin();
        return ResponseEntity.ok(ApiResponse.ok("Ligas encontradas", leagueService.findAll()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<LeagueResponse>> create(@Valid @RequestBody CreateLeagueRequest request) {
        Long jwtUserId = securityUtils.currentUserId();
        // Anti-IDOR: ignoramos el userId del body y forzamos el del JWT (excepto admin).
        CreateLeagueRequest safe = securityUtils.isAdmin()
                ? request
                : new CreateLeagueRequest(jwtUserId, request.tournamentId(), request.name(),
                        request.description(), request.maxMembers(), request.isPublic());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Liga creada correctamente", leagueService.create(safe)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LeagueResponse>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Liga encontrada", leagueService.findById(id)));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<LeagueResponse>>> findByUserId(@PathVariable Long userId) {
        // Anti-IDOR: solo el dueño o ADMIN pueden listar las ligas de un user
        securityUtils.requireSelfOrAdmin(userId);
        return ResponseEntity.ok(ApiResponse.ok("Ligas del usuario encontradas", leagueService.findByUserId(userId)));
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<ApiResponse<List<LeagueMemberResponse>>> findMembers(@PathVariable Long id) {
        // Solo miembros de la liga o Premium/admin (los miembros de una liga
        // privada no deben ser visibles para cualquier usuario autenticado).
        leagueService.requireCanViewLeague(id, securityUtils.currentUserId());
        return ResponseEntity.ok(ApiResponse.ok("Miembros de la liga encontrados", leagueService.findMembers(id)));
    }

    @PostMapping("/join")
    public ResponseEntity<ApiResponse<LeagueMemberResponse>> join(@Valid @RequestBody JoinLeagueRequest request) {
        Long jwtUserId = securityUtils.currentUserId();
        JoinLeagueRequest safe = securityUtils.isAdmin()
                ? request
                : new JoinLeagueRequest(jwtUserId, request.leagueCode());
        return ResponseEntity.ok(ApiResponse.ok("El usuario se unió a la liga", leagueService.join(safe)));
    }

    @PostMapping("/{id}/leave")
    public ResponseEntity<ApiResponse<Void>> leave(@PathVariable Long id, @Valid @RequestBody LeaveLeagueRequest request) {
        Long jwtUserId = securityUtils.currentUserId();
        LeaveLeagueRequest safe = securityUtils.isAdmin()
                ? request
                : new LeaveLeagueRequest(jwtUserId);
        leagueService.leave(id, safe);
        return ResponseEntity.ok(ApiResponse.ok("El usuario salió de la liga", null));
    }

    @GetMapping("/{id}/ranking")
    public ResponseEntity<ApiResponse<List<LeagueRankingResponse>>> ranking(@PathVariable Long id) {
        // Free: solo el ranking de SU liga. Premium/admin: cualquier liga.
        leagueService.requireCanViewLeague(id, securityUtils.currentUserId());
        return ResponseEntity.ok(ApiResponse.ok("Ranking de la liga encontrado", leagueService.findRanking(id)));
    }

    @PostMapping("/{id}/transfer-ownership")
    public ResponseEntity<ApiResponse<LeagueResponse>> transferOwnership(
            @PathVariable Long id,
            @Valid @RequestBody TransferLeagueOwnershipRequest request
    ) {
        // Anti-IDOR: el currentOwnerUserId debe ser el usuario autenticado (o ADMIN)
        securityUtils.requireSelfOrAdmin(request.currentOwnerUserId());
        return ResponseEntity.ok(ApiResponse.ok(
                "Propiedad de la liga transferida correctamente",
                leagueService.transferOwnership(id, request)
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id, @Valid @RequestBody DeleteLeagueRequest request) {
        // Anti-IDOR: el ownerUserId debe ser el usuario autenticado (o ADMIN)
        securityUtils.requireSelfOrAdmin(request.ownerUserId());
        leagueService.delete(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Liga eliminada correctamente", null));
    }
}
