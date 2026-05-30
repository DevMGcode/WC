package com.mundial2026.backend.user.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateUserProfileRequest(
        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 100, message = "El nombre no puede tener mas de 100 caracteres")
        String firstName,

        @Size(max = 100, message = "El apellido no puede tener mas de 100 caracteres")
        String lastName,

        @NotBlank(message = "El email es obligatorio")
        @Email(message = "El email no es valido")
        String email,

        @Size(max = 10, message = "El idioma no puede tener mas de 10 caracteres")
        String preferredLanguage,

        @Size(max = 50, message = "La zona horaria no puede tener mas de 50 caracteres")
        String timeZone
) {
}
