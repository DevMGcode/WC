-- Estado del onboarding del usuario (flujo "solo la primera vez").
-- false = el usuario nunca completó (ni omitió) el onboarding → el frontend
--         lo redirige a /{locale}/onboarding tras el login.
-- true  = ya lo completó u omitió → entra directo a la app con su idioma
--         y equipos favoritos guardados.
-- Vive en el backend (no en localStorage) para que el flag sobreviva a
-- cambios de dispositivo o limpieza del navegador.
ALTER TABLE app_user
    ADD COLUMN onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;
