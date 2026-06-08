-- =============================================================================
-- V2 — Subscription module (Free / Premium)
-- =============================================================================
-- Adds the `subscription` table to track Premium users and their plan validity.
-- A user is considered Premium when there exists a row with status='ACTIVE'
-- and expires_at > NOW() for that user_id.
--
-- A user can have multiple subscription rows over time (history), but only one
-- ACTIVE at a time. The unique partial index enforces this invariant.
-- =============================================================================

CREATE TABLE subscription (
    id                bigserial PRIMARY KEY,
    user_id           bigint        NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    plan              varchar(40)   NOT NULL,           -- 'MUNDIAL_PASS_2026', 'ANNUAL', etc.
    status            varchar(20)   NOT NULL,           -- 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'FAILED'
    payment_provider  varchar(30)   NOT NULL,           -- 'MERCADO_PAGO'
    provider_order_id varchar(120),                     -- ID de la preferencia en el proveedor (para conciliar webhooks)
    amount            numeric(12,2) NOT NULL,           -- monto cobrado
    currency          varchar(10)   NOT NULL,           -- 'USD' | 'USDT' | 'COP'
    started_at        timestamptz,                      -- cuándo se activó (null hasta que pague)
    expires_at        timestamptz,                      -- cuándo deja de ser Premium
    cancelled_at      timestamptz,                      -- si el usuario cancela manualmente
    created_at        timestamptz   NOT NULL DEFAULT NOW(),
    updated_at        timestamptz   NOT NULL DEFAULT NOW()
);

-- Solo UNA suscripción ACTIVE por usuario al mismo tiempo
CREATE UNIQUE INDEX ux_subscription_one_active_per_user
    ON subscription(user_id)
    WHERE status = 'ACTIVE';

-- Búsqueda rápida por orden de proveedor (webhooks)
CREATE UNIQUE INDEX ux_subscription_provider_order
    ON subscription(payment_provider, provider_order_id)
    WHERE provider_order_id IS NOT NULL;

-- Búsqueda rápida por usuario y status
CREATE INDEX ix_subscription_user_status ON subscription(user_id, status);

-- Trigger para mantener updated_at
CREATE OR REPLACE FUNCTION fn_subscription_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER tg_subscription_updated_at
    BEFORE UPDATE ON subscription
    FOR EACH ROW
    EXECUTE FUNCTION fn_subscription_updated_at();
