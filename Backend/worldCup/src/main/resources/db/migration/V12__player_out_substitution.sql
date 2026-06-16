-- Columna para guardar el jugador que SALE en una sustitución.
-- playerName ya guarda al que ENTRA; player_out guarda al que sale.
-- Nullable para no romper los registros de goles existentes.
ALTER TABLE match_event ADD COLUMN IF NOT EXISTS player_out VARCHAR(150);
