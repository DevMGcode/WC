package com.mundial2026.backend.user.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateUserRequest(
        @NotBlank @Size(max = 50) String username,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8, max = 100) String password,
        @NotBlank @Size(max = 100) String firstName,
        @NotBlank @Size(max = 100) String lastName,
        String countryName,
        String countryCode,
        String regionName,
        String departmentName,
        String cityName,
        String phoneCountryCode,
        String phoneNumber,
        String preferredLanguage,
        String timeZone
) {
}
