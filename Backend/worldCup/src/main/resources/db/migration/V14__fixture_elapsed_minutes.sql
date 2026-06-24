-- Minuto de juego en curso (status.elapsed de API-Football). Permite mostrar el
-- reloj en vivo desde el snapshot REST sin depender solo del WebSocket, que solo
-- emitía el minuto al ocurrir un gol/cambio de estado y dejaba el contador
-- "pegado" entre eventos (típicamente clavado en 45').
ALTER TABLE fixture ADD COLUMN IF NOT EXISTS elapsed_minutes INTEGER;
