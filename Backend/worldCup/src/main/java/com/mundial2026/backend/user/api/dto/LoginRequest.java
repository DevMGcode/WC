package com.mundial2026.backend.user.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "Email es requerido")
        @Email(message = "Email inválido")
        String email,

        @NotBlank(message = "Contraseña es requerida")
        String password
) {
}
