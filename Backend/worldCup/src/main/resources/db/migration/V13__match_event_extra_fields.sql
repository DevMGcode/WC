-- Minuto de descuento (ej. 90+3 → minute=90, extra_minute=3)
ALTER TABLE match_event ADD COLUMN IF NOT EXISTS extra_minute INTEGER;

-- Etiqueta para eventos STATUS_CHANGE (halftime, second half, fulltime, penalties)
ALTER TABLE match_event ADD COLUMN IF NOT EXISTS detail VARCHAR(100);

-- Marcador en el momento del evento STATUS_CHANGE
ALTER TABLE match_event ADD COLUMN IF NOT EXISTS home_score_at_event INTEGER;
ALTER TABLE match_event ADD COLUMN IF NOT EXISTS away_score_at_event INTEGER;
