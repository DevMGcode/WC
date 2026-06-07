package com.mundial2026.backend.subscription.service;

import com.mundial2026.backend.common.exception.BusinessRuleException;
import com.mundial2026.backend.user.domain.AppUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Helper centralizado de chequeo Premium.
 *
 * Concentra las decisiones del modelo Free/Premium para evitar duplicar
 * la lógica `isPremium()` en cada controller. Cada regla del modelo se
 * expone como un método explícito con nombre de negocio.
 *
 * Reglas Free (ver acuerdo Free/Premium):
 *   - PUEDE: predecir 3 partidos de fase de grupos del equipo favorito.
 *   - PUEDE: unirse a 1 liga privada si el dueño es Premium.
 *   - PUEDE: ver el ranking de su liga (si es miembro).
 *   - PUEDE: ver historial de aciertos de sus 3 partidos.
 *   - NO PUEDE: crear ligas, ver ranking global, top asistentes, stats
 *               detalladas de partido/jugador, head-to-head, ni plantilla
 *               completa de equipo.
 */
@Service
@RequiredArgsConstructor
public class PremiumGuard {

    /** Máximo de predicciones que puede hacer un usuario FREE. */
    public static final int FREE_MAX_PREDICTIONS = 3;

    /** Máximo de ligas privadas en las que puede estar un usuario FREE. */
    public static final int FREE_MAX_LEAGUES = 1;

    private final SubscriptionService subscriptionService;

    // ─── Lectura ──────────────────────────────────────────────────────────────

    /** ¿El usuario es Premium AHORA mismo? */
    public boolean isPremium(Long userId) {
        return subscriptionService.isPremium(userId);
    }

    public boolean isPremium(AppUser user) {
        return isPremium(user.getId());
    }

    // ─── Aserciones (lanzan excepción si no aplica) ───────────────────────────

    /**
     * Verifica que el usuario sea Premium. Si no lo es, lanza excepción
     * con mensaje uniforme que el frontend mapea a una página /premium.
     */
    public void requirePremium(AppUser user, String featureName) {
        if (!isPremium(user)) {
            throw new BusinessRuleException(
                    "Esta funcionalidad (" + featureName + ") requiere el Pase Mundial. " +
                    "Hazte Premium para desbloquearla."
            );
        }
    }

    // ─── Reglas específicas de plan FREE ──────────────────────────────────────

    /**
     * ¿El usuario Free puede predecir este partido?
     *
     * Permite si:
     *   - El partido es de fase de grupos (stage_code que empieza por "GROUP")
     *   - Y es del equipo favorito del usuario (home o away)
     *   - Y el usuario tiene seteado su equipo favorito
     *
     * El conteo de 3 máximo se valida aparte por el PredictionService usando
     * FREE_MAX_PREDICTIONS, porque requiere consultar el repositorio.
     */
    public boolean canFreeUserPredictFixture(
            AppUser user,
            Long fixtureHomeTeamId,
            Long fixtureAwayTeamId,
            String stageCode
    ) {
        if (user.getFavoriteTeam() == null) return false;
        if (stageCode == null || !stageCode.toUpperCase().startsWith("GROUP")) return false;

        Long favoriteId = user.getFavoriteTeam().getId();
        return favoriteId.equals(fixtureHomeTeamId) || favoriteId.equals(fixtureAwayTeamId);
    }
}
