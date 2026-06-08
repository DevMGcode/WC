-- Almacena el payment_id numérico de Mercado Pago, necesario para hacer reembolsos.
-- provider_order_id ya guarda el preferenceId (no sirve para reembolsos).
ALTER TABLE subscription
    ADD COLUMN payment_id     VARCHAR(30)      NULL,
    ADD COLUMN refunded_at    TIMESTAMPTZ      NULL;
