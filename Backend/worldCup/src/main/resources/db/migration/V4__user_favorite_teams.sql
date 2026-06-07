-- =============================================================================
-- V4 — Favoritos multiples del usuario (Free/Premium support)
-- =============================================================================
-- Permite al usuario marcar varios equipos como favoritos para verlos
-- destacados, recibir notificaciones, etc.
--
-- Reglas de negocio:
--   - Free: maximo 3 equipos favoritos (validado en backend)
--   - Premium: ilimitados (validado en backend)
--   - Un solo equipo puede ser is_primary=true por usuario (constraint).
--     Ese "principal" es el que se sincroniza con app_user.favorite_team_id
--     y determina los 3 partidos predecibles del Free.
--
-- La tabla `user_favorite_team` complementa el campo `app_user.favorite_team_id`
-- que ya existe (V3) — el campo apunta al equipo principal para acceso rapido
-- desde el flujo de predicciones.
-- =============================================================================

CREATE TABLE user_favorite_team (
    id           bigserial PRIMARY KEY,
    user_id      bigint    NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    team_id      bigint    NOT NULL REFERENCES team(id)     ON DELETE CASCADE,
    is_primary   boolean   NOT NULL DEFAULT false,
    position     integer   NOT NULL DEFAULT 0, -- orden visual (0 = primero)
    created_at   timestamptz NOT NULL DEFAULT NOW()
);

-- Un usuario no puede tener el mismo equipo dos veces como favorito
CREATE UNIQUE INDEX ux_user_favorite_team_unique
    ON user_favorite_team(user_id, team_id);

-- Solo UN equipo puede ser principal por usuario
CREATE UNIQUE INDEX ux_user_favorite_team_one_primary
    ON user_favorite_team(user_id)
    WHERE is_primary = true;

-- Busqueda rapida por usuario
CREATE INDEX ix_user_favorite_team_user
    ON user_favorite_team(user_id, position);
