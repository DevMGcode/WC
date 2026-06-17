-- Banderas para no enviar dos veces la misma notificación push por partido.
--   reminder_notified → ya se mandó el recordatorio (1h antes del partido).
--   result_notified   → ya se mandó el aviso de resultado (partido finalizado + marcador).
ALTER TABLE fixture
    ADD COLUMN reminder_notified BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN result_notified   BOOLEAN NOT NULL DEFAULT FALSE;
