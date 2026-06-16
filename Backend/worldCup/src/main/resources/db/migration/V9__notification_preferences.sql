-- Preferencias de notificación del usuario (fuente única de verdad).
-- Las leen y escriben TANTO el onboarding (primera vez, opcional) como el
-- perfil → Configuración (editor permanente). Tienen valores por defecto para
-- que, si el usuario OMITE el onboarding, igual queden definidas y editables.
--
-- Defaults (coinciden con la UI actual): recordatorios, resultados y ligas
-- activados; noticias desactivado.
ALTER TABLE app_user
    ADD COLUMN notify_fixture_reminders     BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN notify_result_notifications  BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN notify_league_updates        BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN notify_news_updates          BOOLEAN NOT NULL DEFAULT FALSE;
