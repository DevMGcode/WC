-- =============================================================================
-- V3 — Equipo favorito del usuario (Free/Premium support)
-- =============================================================================
-- Agrega `favorite_team_id` a `app_user` para soportar la regla del plan FREE:
--   "Predicciones gratis solo de los 3 partidos de fase de grupos del
--    equipo favorito del usuario".
--
-- - Es NULLABLE: usuarios viejos no lo tienen seteado, y deben elegirlo
--   antes de poder hacer predicciones en plan Free. Los Premium pueden
--   ignorarlo (predicen todos los partidos).
-- - ON DELETE SET NULL: si un equipo se borra (raro), el usuario queda
--   sin favorito pero su cuenta sigue funcionando.
-- =============================================================================

ALTER TABLE app_user
    ADD COLUMN favorite_team_id BIGINT
        REFERENCES team(id) ON DELETE SET NULL;

CREATE INDEX ix_app_user_favorite_team ON app_user(favorite_team_id);
