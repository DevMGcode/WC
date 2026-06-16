package com.mundial2026.backend.push.api.dto;

import jakarta.validation.constraints.NotBlank;

/** Para desuscribir un navegador: basta el endpoint que ya tenía guardado. */
public record PushUnsubscribeRequest(
        @NotBlank String endpoint
) {
}
