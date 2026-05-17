package com.mundial2026.backend.user.api;

import com.mundial2026.backend.common.exception.BusinessRuleException;
import com.mundial2026.backend.common.response.ApiResponse;
import com.mundial2026.backend.security.JwtTokenProvider;
import com.mundial2026.backend.user.api.dto.ForgotPasswordRequest;
import com.mundial2026.backend.user.api.dto.LoginRequest;
import com.mundial2026.backend.user.api.dto.LoginResponse;
import com.mundial2026.backend.user.api.dto.RefreshTokenRequest;
import com.mundial2026.backend.user.api.mapper.UserMapper;
import com.mundial2026.backend.user.domain.AppUser;
import com.mundial2026.backend.user.service.EmailService;
import com.mundial2026.backend.user.service.UserService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final JwtTokenProvider tokenProvider;
    private final UserMapper userMapper;
    private final EmailService emailService;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

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

        String accessToken  = tokenProvider.generateAccessToken(user.getUsername());
        String refreshToken = tokenProvider.generateRefreshToken(user.getUsername());

        LoginResponse loginResponse = new LoginResponse(
                userMapper.toAuthResponse(user),
                accessToken,
                refreshToken
        );

        return ResponseEntity.ok(ApiResponse.ok("Login exitoso", loginResponse));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<LoginResponse>> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        String rt = request.refreshToken();
        if (!tokenProvider.validateToken(rt) || !tokenProvider.isRefreshToken(rt)) {
            throw new BusinessRuleException("Token de refresco inválido o expirado");
        }
        String username = tokenProvider.getUsernameFromToken(rt);
        AppUser user = userService.findByUsername(username);

        String newAccess  = tokenProvider.generateAccessToken(username);
        String newRefresh = tokenProvider.generateRefreshToken(username);

        LoginResponse response = new LoginResponse(userMapper.toAuthResponse(user), newAccess, newRefresh);
        return ResponseEntity.ok(ApiResponse.ok("Token refrescado", response));
    }

    @GetMapping("/verify-email")
    public void verifyEmail(@RequestParam String token, HttpServletResponse response) throws IOException {
        boolean ok = userService.verifyEmail(token);
        String redirect = frontendUrl + (ok ? "/es/login?verified=true" : "/es/login?error=invalid_token");
        response.sendRedirect(redirect);
    }
}
