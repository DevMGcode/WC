package com.mundial2026.backend.user.api;

import com.mundial2026.backend.common.exception.BusinessRuleException;
import com.mundial2026.backend.common.response.ApiResponse;
import com.mundial2026.backend.security.JwtTokenProvider;
import com.mundial2026.backend.user.api.dto.ForgotPasswordRequest;
import com.mundial2026.backend.user.api.dto.LoginRequest;
import com.mundial2026.backend.user.api.dto.LoginResponse;
import com.mundial2026.backend.user.api.dto.RefreshTokenRequest;
import com.mundial2026.backend.user.api.dto.ResetPasswordRequest;
import com.mundial2026.backend.user.api.mapper.UserMapper;
import com.mundial2026.backend.user.domain.AppUser;
import com.mundial2026.backend.subscription.service.SubscriptionService;
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
    private final SubscriptionService subscriptionService;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        // Anti-enumeración: respondemos SIEMPRE el mismo mensaje, exista o no el email.
        // Anti-DoS: el password actual NO se modifica; solo se genera un enlace temporal.
        String resetUrl = userService.requestPasswordReset(request.email());
        if (resetUrl != null) {
            try {
                emailService.sendPasswordResetLink(request.email(), resetUrl);
            } catch (Exception e) {
                // No revelamos fallos de envío al cliente (evita enumeración por timing/errores)
            }
        }
        return ResponseEntity.ok(ApiResponse.ok(
                "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.", null));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        userService.resetPasswordWithToken(request.token(), request.newPassword());
        return ResponseEntity.ok(ApiResponse.ok(
                "Tu contraseña fue actualizada. Ya puedes iniciar sesión.", null));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        AppUser user = userService.authenticate(request.email(), request.password());

        // Activa al instante si tiene un pago aprobado en MP que el webhook no notificó.
        // Para usuarios free sin PENDING no hace nada (guarda <10ms).
        subscriptionService.reconcilePendingForUser(user.getId());

        int tv = user.getTokenVersion() != null ? user.getTokenVersion() : 0;
        String accessToken  = tokenProvider.generateAccessToken(user.getUsername(), tv);
        String refreshToken = tokenProvider.generateRefreshToken(user.getUsername(), tv);

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

        // El refresh token debe seguir siendo de la versión vigente; si el password
        // cambió tras emitirlo, su tv quedó obsoleto y lo rechazamos.
        int currentTv = user.getTokenVersion() != null ? user.getTokenVersion() : 0;
        if (tokenProvider.getTokenVersion(rt) != currentTv) {
            throw new BusinessRuleException("Token de refresco inválido o expirado");
        }

        // Igual que en login: activa PENDING si MP aprobó el pago sin webhook.
        subscriptionService.reconcilePendingForUser(user.getId());

        String newAccess  = tokenProvider.generateAccessToken(username, currentTv);
        String newRefresh = tokenProvider.generateRefreshToken(username, currentTv);

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
