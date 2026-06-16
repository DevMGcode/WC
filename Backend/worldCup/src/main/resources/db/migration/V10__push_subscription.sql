-- Suscripciones Web Push de los navegadores/dispositivos del usuario.
-- Cada navegador donde el usuario activa notificaciones genera una suscripción
-- (endpoint del servicio push del navegador + claves de cifrado p256dh/auth).
-- Un usuario puede tener varias (PC, móvil, etc.). El endpoint es único.
CREATE TABLE push_subscription (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT       NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    endpoint    VARCHAR(500) NOT NULL UNIQUE,
    p256dh      VARCHAR(255) NOT NULL,
    auth        VARCHAR(255) NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX ix_push_subscription_user ON push_subscription (user_id);
