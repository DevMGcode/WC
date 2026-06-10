-- Versión de token para invalidar JWTs existentes tras un cambio de contraseña.
-- Cada JWT lleva la versión vigente al emitirse; al cambiar el password se
-- incrementa esta columna y todos los tokens previos dejan de ser aceptados.
ALTER TABLE app_user
    ADD COLUMN token_version INTEGER NOT NULL DEFAULT 0;
