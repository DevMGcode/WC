-- V13: Normalizar nombres de todos los fixtures usando los nombres de equipo en español

UPDATE fixture
SET name = home_t.name || ' vs ' || away_t.name
FROM team home_t, team away_t
WHERE fixture.home_team_id = home_t.id
  AND fixture.away_team_id = away_t.id;
