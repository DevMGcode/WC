-- Mundial 2026 (48 equipos) agrega una ronda extra antes de Octavos: la Ronda de 32
-- ("Dieciseisavos de Final"). El backend YA mapea el round de API-Football
-- "Round of 32" -> codigo DIECISEISAVOS (FixtureSyncService.mapStageCode), pero el stage
-- no existia en la BD, asi que esos partidos no se podian asignar a su fase.
-- Esta migracion crea el stage para que el sync los categorice como eliminatoria.
--
-- Es aditiva: no toca fixtures ni datos existentes; solo agrega un stage y reordena
-- el sort_order de las fases finales del torneo 2 para dejar la Ronda de 32 entre
-- Grupos (1) y Octavos.

-- 1) Hacer lugar: correr +1 el sort_order de las fases eliminatorias del torneo 2
--    (todo menos la Fase de Grupos).
UPDATE stage
   SET sort_order = sort_order + 1
 WHERE tournament_id = 2
   AND code <> 'GROUPS';

-- 2) Insertar la Ronda de 32 entre Grupos (sort_order 1) y Octavos (ahora 3).
--    id 8 es el siguiente libre (los stages sembrados usan ids 2..7).
INSERT INTO stage (id, tournament_id, code, name, sort_order)
VALUES (8, 2, 'DIECISEISAVOS', 'Dieciseisavos de Final', 2);

-- 3) Mantener la secuencia de ids por encima del maximo usado (higiene; los stages
--    se siembran con id explicito, pero evita colisiones futuras).
SELECT setval('stage_id_seq', (SELECT max(id) FROM stage), true);
