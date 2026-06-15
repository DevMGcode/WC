package com.mundial2026.backend.achievement.api.dto;

import java.util.List;

/**
 * Respuesta del panel de logros del usuario en un torneo.
 *
 * @param currentStreak racha de aciertos seguidos vigente (se corta con un fallo).
 * @param bestStreak    mejor racha histórica del usuario en el torneo.
 * @param totalPoints   puntos acumulados (para el contexto del panel).
 * @param exactScores   marcadores exactos acertados.
 * @param unlockedCount cuántos logros lleva desbloqueados.
 * @param totalCount    total de logros del catálogo.
 * @param achievements  catálogo completo (desbloqueados y bloqueados con progreso).
 */
public record AchievementSummaryResponse(
        int currentStreak,
        int bestStreak,
        int totalPoints,
        int exactScores,
        int unlockedCount,
        int totalCount,
        List<AchievementResponse> achievements
) {
}
