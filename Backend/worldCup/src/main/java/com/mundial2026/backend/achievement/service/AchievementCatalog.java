package com.mundial2026.backend.achievement.service;

import com.mundial2026.backend.achievement.api.dto.AchievementResponse;

import java.util.List;

/**
 * Catálogo único de logros (fuente de verdad de las reglas y los iconos).
 *
 * Es una función pura sin dependencias: lo usan tanto AchievementService (panel
 * del perfil) como ScoringService (medallas por miembro en el ranking de liga),
 * para que ambos evalúen EXACTAMENTE los mismos criterios.
 */
public final class AchievementCatalog {

    private AchievementCatalog() {
    }

    /**
     * Evalúa el catálogo completo con las métricas del usuario.
     *
     * @param exactScores  marcadores exactos acertados.
     * @param totalPoints  puntos acumulados.
     * @param matches      partidos puntuados (con porra).
     * @param rankPosition posición en el ranking global (1 = mejor; 0 = sin ranking).
     * @param bestStreak   mejor racha de aciertos.
     */
    public static List<AchievementResponse> evaluate(
            int exactScores, int totalPoints, int matches, int rankPosition, int bestStreak) {
        // Sin partidos puntuados no hay posición real: evita que el rankPosition
        // placeholder (1) de un usuario sin porras desbloquee podio/líder.
        int effectiveRank = matches > 0 ? rankPosition : 0;
        return List.of(
                make("FIRST_BLOOD", "Primera sangre", "Tu primer marcador exacto", "target",    exactScores, 1),
                make("SNIPER",      "Francotirador",   "5 marcadores exactos",      "crosshair", exactScores, 5),
                make("PROPHET",     "Profeta",         "10 marcadores exactos",     "eye",       exactScores, 10),
                make("ON_FIRE",     "En llamas",       "3 aciertos seguidos",       "flame",     bestStreak, 3),
                make("UNSTOPPABLE", "Imparable",       "5 aciertos seguidos",       "flame",     bestStreak, 5),
                make("PODIUM",      "Al podio",        "Llega al top 3 del ranking", "trophy",   rankReached(effectiveRank, 3), 1),
                make("LEADER",      "Líder",           "Llega al #1 del ranking",    "crown",    rankReached(effectiveRank, 1), 1),
                make("CENTURION",   "Centena",         "Acumula 100 puntos",        "coins",     totalPoints, 100),
                make("STEADY",      "Constante",       "Predice 10 partidos",       "checkbox",  matches, 10)
        );
    }

    /** Solo los códigos de logros DESBLOQUEADOS (para la tira compacta en ligas). */
    public static List<String> unlockedCodes(
            int exactScores, int totalPoints, int matches, int rankPosition, int bestStreak) {
        return evaluate(exactScores, totalPoints, matches, rankPosition, bestStreak).stream()
                .filter(AchievementResponse::unlocked)
                .map(AchievementResponse::code)
                .toList();
    }

    private static AchievementResponse make(String code, String name, String desc, String icon, int current, int target) {
        int shown = Math.min(Math.max(current, 0), target);
        return new AchievementResponse(code, name, desc, icon, current >= target, shown, target);
    }

    /** 1 si la posición (1=mejor) alcanzó el umbral del podio; 0 si aún no o sin ranking. */
    private static int rankReached(int rankPosition, int threshold) {
        return (rankPosition >= 1 && rankPosition <= threshold) ? 1 : 0;
    }
}
