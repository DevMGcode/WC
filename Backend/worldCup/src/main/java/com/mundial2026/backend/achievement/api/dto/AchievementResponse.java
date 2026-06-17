package com.mundial2026.backend.achievement.api.dto;

/**
 * Una insignia/logro del usuario.
 *
 * @param code        identificador estable (no traducible), ej. "SNIPER".
 * @param name        nombre visible, ej. "Francotirador".
 * @param description condición en texto, ej. "5 marcadores exactos".
 * @param icon        nombre del icono que pinta el frontend, ej. "crosshair".
 * @param unlocked    true si ya se cumplió la condición.
 * @param current     progreso actual hacia la meta (para mostrar "4/5").
 * @param target      meta para desbloquear.
 */
public record AchievementResponse(
        String code,
        String name,
        String description,
        String icon,
        boolean unlocked,
        int current,
        int target
) {
}
