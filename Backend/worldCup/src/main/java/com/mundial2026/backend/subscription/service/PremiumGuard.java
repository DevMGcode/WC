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
 *   - PUEDE: predecir partidos de cualquier equipo de su lista de favoritos.
 *   - PUEDE: unirse a 1 liga privada si el dueño es Premium.
 *   - PUEDE: ver el ranking de su liga (si es miembro).
 *   - PUEDE: ver historial de aciertos de sus partidos.
 *   - NO PUEDE: predecir partidos de equipos que no son sus favoritos.
 *   - NO PUEDE: crear ligas, ver ranking global, top asistentes, stats
 *               detalladas de partido/jugador, head-to-head, ni plantilla
 *               completa de equipo.
 */
@Service
@RequiredArgsConstructor
public class PremiumGuard {

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

}
