package com.mundial2026.backend.user.api;

import com.mundial2026.backend.common.response.ApiResponse;
import com.mundial2026.backend.user.api.dto.CreateUserRequest;
import com.mundial2026.backend.user.api.dto.LoginRequest;
import com.mundial2026.backend.user.api.dto.LoginResponse;
import com.mundial2026.backend.user.api.dto.AuthUserResponse;
import com.mundial2026.backend.user.api.dto.ChangePasswordRequest;
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

import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.util.Base64;

@RestController
@RequestMapping("/api/v1/public/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserMapper userMapper;

    @PostMapping
    public ResponseEntity<ApiResponse<UserResponse>> create(@Valid @RequestBody CreateUserRequest request) {
        AppUser user = userService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Usuario creado correctamente", userMapper.toResponse(user)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Usuario encontrado",
                userMapper.toResponse(userService.findById(id))
        ));
    }

    @PutMapping("/{id}/profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserProfileRequest request
    ) {
        AppUser updated = userService.updateProfile(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Perfil actualizado correctamente", userMapper.toResponse(updated)));
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @PathVariable Long id,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        userService.changePassword(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Contraseña actualizada correctamente", null));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        AppUser user = userService.authenticate(request.email(), request.password());

        String displayName = user.getFirstName() != null && !user.getFirstName().isBlank()
            ? user.getFirstName()
            : (user.getUsername() != null ? user.getUsername() : "Usuario");

        String userStatus = user.getStatus() != null ? user.getStatus().name() : "ACTIVE";
        String userEmail = user.getEmail() != null ? user.getEmail() : request.email();
        String userId = user.getId() != null ? String.valueOf(user.getId()) : "0";

        AuthUserResponse authUser = new AuthUserResponse(
            userId,
            userEmail,
                displayName,
            userStatus,
                user.getCreatedAt() != null ? user.getCreatedAt() : OffsetDateTime.now()
        );

        Long tokenUserId = user.getId() != null ? user.getId() : 0L;
        String accessToken = generateToken(userEmail, tokenUserId);
        String refreshToken = generateToken(userEmail, tokenUserId) + ".refresh";

        LoginResponse loginResponse = new LoginResponse(authUser, accessToken, refreshToken);

        return ResponseEntity.ok(ApiResponse.ok("Login exitoso", loginResponse));
    }

    private String generateToken(String email, Long userId) {
        String raw = email + ":" + userId + ":" + System.currentTimeMillis();
        return Base64.getUrlEncoder().withoutPadding().encodeToString(raw.getBytes(StandardCharsets.UTF_8));
    }
}
