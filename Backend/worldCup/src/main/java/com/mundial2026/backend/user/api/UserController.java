package com.mundial2026.backend.user.api;

import com.mundial2026.backend.common.response.ApiResponse;
import com.mundial2026.backend.security.SecurityUtils;
import com.mundial2026.backend.user.api.dto.AddFavoriteTeamRequest;
import com.mundial2026.backend.user.api.dto.ChangePasswordRequest;
import com.mundial2026.backend.user.api.dto.CreateUserRequest;
import com.mundial2026.backend.user.api.dto.FavoriteTeamResponse;
import com.mundial2026.backend.user.api.dto.SetFavoriteTeamRequest;
import com.mundial2026.backend.user.api.dto.UpdateUserProfileRequest;
import com.mundial2026.backend.user.api.dto.UserResponse;
import com.mundial2026.backend.user.api.mapper.UserMapper;
import com.mundial2026.backend.user.domain.AppUser;
import com.mundial2026.backend.user.service.UserFavoriteTeamService;
import com.mundial2026.backend.user.service.UserService;

import java.util.List;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserMapper userMapper;
    private final SecurityUtils securityUtils;
    private final UserFavoriteTeamService favoriteTeamService;

    @PostMapping
    public ResponseEntity<ApiResponse<UserResponse>> create(@Valid @RequestBody CreateUserRequest request) {
        AppUser user = userService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Usuario creado correctamente", userMapper.toResponse(user)));
    }

    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Long>> count() {
        return ResponseEntity.ok(ApiResponse.ok("Total de usuarios", userService.count()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> findById(@PathVariable Long id) {
        // Anti-IDOR: solo el propio usuario o ADMIN pueden ver datos completos
        securityUtils.requireSelfOrAdmin(id);
        return ResponseEntity.ok(ApiResponse.ok(
                "Usuario encontrado",
                userMapper.toResponse(userService.findById(id))
        ));
    }

    @PutMapping("/{id}/profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserProfileRequest request) {
        // Anti-IDOR: solo el propio usuario o ADMIN pueden modificar el perfil
        securityUtils.requireSelfOrAdmin(id);
        AppUser user = userService.updateProfile(id, request);
        return ResponseEntity.ok(ApiResponse.ok(
                "Perfil actualizado correctamente",
                userMapper.toResponse(user)
        ));
    }

    @PutMapping("/{id}/favorite-team")
    public ResponseEntity<ApiResponse<UserResponse>> setFavoriteTeam(
            @PathVariable Long id,
            @Valid @RequestBody SetFavoriteTeamRequest request) {
        // Anti-IDOR: solo el propio usuario o ADMIN
        securityUtils.requireSelfOrAdmin(id);
        AppUser user = userService.setFavoriteTeam(id, request.teamId());
        return ResponseEntity.ok(ApiResponse.ok(
                "Equipo favorito actualizado",
                userMapper.toResponse(user)
        ));
    }

    /** Marca el onboarding como completado (flujo "solo la primera vez"). */
    @PutMapping("/{id}/onboarding")
    public ResponseEntity<ApiResponse<UserResponse>> completeOnboarding(@PathVariable Long id) {
        // Anti-IDOR: solo el propio usuario o ADMIN
        securityUtils.requireSelfOrAdmin(id);
        AppUser user = userService.completeOnboarding(id);
        return ResponseEntity.ok(ApiResponse.ok(
                "Onboarding completado",
                userMapper.toResponse(user)
        ));
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<ApiResponse<UserResponse>> changePassword(
            @PathVariable Long id,
            @Valid @RequestBody ChangePasswordRequest request) {
        // Anti-IDOR: solo el propio usuario puede cambiar su password (ni ADMIN debería)
        securityUtils.requireSelfOrAdmin(id);
        AppUser user = userService.changePassword(id, request);
        return ResponseEntity.ok(ApiResponse.ok(
                "Contraseña cambiada correctamente",
                userMapper.toResponse(user)
        ));
    }

    // ─── Favoritos múltiples ──────────────────────────────────────────────────

    /** Lista los equipos favoritos del usuario (con flag is_primary). */
    @GetMapping("/{id}/favorite-teams")
    public ResponseEntity<ApiResponse<List<FavoriteTeamResponse>>> listFavoriteTeams(@PathVariable Long id) {
        securityUtils.requireSelfOrAdmin(id);
        return ResponseEntity.ok(ApiResponse.ok(
                "Equipos favoritos",
                favoriteTeamService.listByUser(id)
        ));
    }

    /** Agrega un equipo a favoritos. Valida tope 3 si Free. */
    @PostMapping("/{id}/favorite-teams")
    public ResponseEntity<ApiResponse<FavoriteTeamResponse>> addFavoriteTeam(
            @PathVariable Long id,
            @Valid @RequestBody AddFavoriteTeamRequest request) {
        securityUtils.requireSelfOrAdmin(id);
        FavoriteTeamResponse fav = favoriteTeamService.addFavorite(
                id, request.teamId(), Boolean.TRUE.equals(request.makePrimary())
        );
        return ResponseEntity.ok(ApiResponse.ok("Equipo agregado a favoritos", fav));
    }

    /** Quita un equipo de favoritos. */
    @DeleteMapping("/{id}/favorite-teams/{teamId}")
    public ResponseEntity<ApiResponse<Void>> removeFavoriteTeam(
            @PathVariable Long id,
            @PathVariable Long teamId) {
        securityUtils.requireSelfOrAdmin(id);
        favoriteTeamService.removeFavorite(id, teamId);
        return ResponseEntity.ok(ApiResponse.ok("Equipo quitado de favoritos", null));
    }

    /** Marca un equipo como principal (sincroniza con favorite_team_id). */
    @PutMapping("/{id}/favorite-teams/{teamId}/primary")
    public ResponseEntity<ApiResponse<FavoriteTeamResponse>> setPrimaryFavoriteTeam(
            @PathVariable Long id,
            @PathVariable Long teamId) {
        securityUtils.requireSelfOrAdmin(id);
        FavoriteTeamResponse fav = favoriteTeamService.setPrimary(id, teamId);
        return ResponseEntity.ok(ApiResponse.ok("Equipo principal actualizado", fav));
    }
}
