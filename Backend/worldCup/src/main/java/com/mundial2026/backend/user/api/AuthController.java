package com.mundial2026.backend.user.api;

import com.mundial2026.backend.common.response.ApiResponse;
import com.mundial2026.backend.security.JwtTokenProvider;
import com.mundial2026.backend.user.api.dto.ForgotPasswordRequest;
import com.mundial2026.backend.user.api.dto.LoginRequest;
import com.mundial2026.backend.user.api.dto.LoginResponse;
import com.mundial2026.backend.user.api.mapper.UserMapper;
import com.mundial2026.backend.user.domain.AppUser;
import com.mundial2026.backend.user.service.EmailService;
import com.mundial2026.backend.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final JwtTokenProvider tokenProvider;
    private final UserMapper userMapper;
    private final EmailService emailService;

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        String tempPassword = userService.resetPassword(request.email());
        emailService.sendPasswordReset(request.email(), tempPassword);
        return ResponseEntity.ok(ApiResponse.ok(
                "Se envió una contraseña temporal a tu correo electrónico", null));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        AppUser user = userService.authenticate(request.email(), request.password());

        String accessToken  = tokenProvider.generateToken(user.getUsername());
        String refreshToken = tokenProvider.generateToken(user.getUsername() + "-refresh");

        LoginResponse loginResponse = new LoginResponse(
                userMapper.toAuthResponse(user),
                accessToken,
                refreshToken
        );

        return ResponseEntity.ok(ApiResponse.ok("Login exitoso", loginResponse));
    }
}
