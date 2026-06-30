-- Marcador de la tanda de penales (definición de partidos de eliminatoria empatados).
-- API-Football lo entrega en score.penalty; antes lo descartábamos, así que el cuadro
-- eliminatorio no podía saber quién avanzaba en partidos definidos por penales
-- (el marcador de tiempo reglamentario queda empatado, p.ej. 1-1).
-- Aditiva: columnas nullable; no afecta datos existentes.
ALTER TABLE fixture ADD COLUMN home_penalty INTEGER;
ALTER TABLE fixture ADD COLUMN away_penalty INTEGER;
