package com.mundial2026.backend.user.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(
        @NotBlank(message = "La contraseña actual es obligatoria")
        String currentPassword,

        @NotBlank(message = "La nueva contraseña es obligatoria")
        @Size(min = 5, max = 100, message = "La nueva contraseña debe tener entre 5 y 100 caracteres")
        String newPassword
) {
}
