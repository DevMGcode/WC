package com.mundial2026.backend.user.api;

import com.mundial2026.backend.common.response.ApiResponse;
import com.mundial2026.backend.security.SecurityUtils;
import com.mundial2026.backend.user.api.dto.ChangePasswordRequest;
import com.mundial2026.backend.user.api.dto.CreateUserRequest;
import com.mundial2026.backend.user.api.dto.UpdateUserProfileRequest;
import com.mundial2026.backend.user.api.dto.UserResponse;
import com.mundial2026.backend.user.api.mapper.UserMapper;
import com.mundial2026.backend.user.domain.AppUser;
import com.mundial2026.backend.user.service.UserService;
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
}
