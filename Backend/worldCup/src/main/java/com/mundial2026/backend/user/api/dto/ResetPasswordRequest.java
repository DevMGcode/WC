package com.mundial2026.backend.user.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Confirma el cambio de contraseña con el token enviado por correo.
 */
public record ResetPasswordRequest(
        @NotBlank String token,
        @NotBlank @Size(min = 6, max = 100) String newPassword
) {
}
