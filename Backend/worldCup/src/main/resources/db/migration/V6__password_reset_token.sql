-- Token de recuperación de contraseña (flujo seguro con enlace temporal).
-- Reemplaza el reset directo de password (que permitía DoS: cualquiera podía
-- bloquear la cuenta de otro reseteándole el password sin verificación).
ALTER TABLE app_user
    ADD COLUMN password_reset_token      VARCHAR(64)  NULL,
    ADD COLUMN password_reset_expires_at TIMESTAMPTZ  NULL;
