-- V8: Grupos, standings y equipos adicionales para WC2026
-- Equipos ya existentes: Argentina(1), Brasil(2), México(3), Colombia(4),
--                        Uruguay(5), Francia(6), España(7), Alemania(8)

-- ─── Nuevos equipos ────────────────────────────────────────────────────────
INSERT INTO team (name, short_name, fifa_code, country_name, flag_url)
SELECT 'Paraguay','PAR','PAR','Paraguay','https://flagcdn.com/py.svg'
WHERE NOT EXISTS (SELECT 1 FROM team WHERE fifa_code = 'PAR');

INSERT INTO team (name, short_name, fifa_code, country_name, flag_url)
SELECT 'Canadá','CAN','CAN','Canadá','https://flagcdn.com/ca.svg'
WHERE NOT EXISTS (SELECT 1 FROM team WHERE fifa_code = 'CAN');

INSERT INTO team (name, short_name, fifa_code, country_name, flag_url)
SELECT 'Jamaica','JAM','JAM','Jamaica','https://flagcdn.com/jm.svg'
WHERE NOT EXISTS (SELECT 1 FROM team WHERE fifa_code = 'JAM');

INSERT INTO team (name, short_name, fifa_code, country_name, flag_url)
SELECT 'Ecuador','ECU','ECU','Ecuador','https://flagcdn.com/ec.svg'
WHERE NOT EXISTS (SELECT 1 FROM team WHERE fifa_code = 'ECU');

INSERT INTO team (name, short_name, fifa_code, country_name, flag_url)
SELECT 'Bolivia','BOL','BOL','Bolivia','https://flagcdn.com/bo.svg'
WHERE NOT EXISTS (SELECT 1 FROM team WHERE fifa_code = 'BOL');

INSERT INTO team (name, short_name, fifa_code, country_name, flag_url)
SELECT 'Portugal','POR','POR','Portugal','https://flagcdn.com/pt.svg'
WHERE NOT EXISTS (SELECT 1 FROM team WHERE fifa_code = 'POR');

INSERT INTO team (name, short_name, fifa_code, country_name, flag_url)
SELECT 'Ghana','GHA','GHA','Ghana','https://flagcdn.com/gh.svg'
WHERE NOT EXISTS (SELECT 1 FROM team WHERE fifa_code = 'GHA');

INSERT INTO team (name, short_name, fifa_code, country_name, flag_url)
SELECT 'Japón','JPN','JPN','Japón','https://flagcdn.com/jp.svg'
WHERE NOT EXISTS (SELECT 1 FROM team WHERE fifa_code = 'JPN');

-- Equipos del bracket (octavos)
INSERT INTO team (name, short_name, fifa_code, country_name, flag_url)
SELECT 'Holanda','HOL','NED','Holanda','https://flagcdn.com/nl.svg'
WHERE NOT EXISTS (SELECT 1 FROM team WHERE fifa_code = 'NED');

INSERT INTO team (name, short_name, fifa_code, country_name, flag_url)
SELECT 'Corea del Sur','KOR','KOR','Corea del Sur','https://flagcdn.com/kr.svg'
WHERE NOT EXISTS (SELECT 1 FROM team WHERE fifa_code = 'KOR');

INSERT INTO team (name, short_name, fifa_code, country_name, flag_url)
SELECT 'Polonia','POL','POL','Polonia','https://flagcdn.com/pl.svg'
WHERE NOT EXISTS (SELECT 1 FROM team WHERE fifa_code = 'POL');

INSERT INTO team (name, short_name, fifa_code, country_name, flag_url)
SELECT 'Marruecos','MAR','MAR','Marruecos','https://flagcdn.com/ma.svg'
WHERE NOT EXISTS (SELECT 1 FROM team WHERE fifa_code = 'MAR');

INSERT INTO team (name, short_name, fifa_code, country_name, flag_url)
SELECT 'Italia','ITA','ITA','Italia','https://flagcdn.com/it.svg'
WHERE NOT EXISTS (SELECT 1 FROM team WHERE fifa_code = 'ITA');

INSERT INTO team (name, short_name, fifa_code, country_name, flag_url)
SELECT 'Suiza','SUI','SUI','Suiza','https://flagcdn.com/ch.svg'
WHERE NOT EXISTS (SELECT 1 FROM team WHERE fifa_code = 'SUI');

INSERT INTO team (name, short_name, fifa_code, country_name, flag_url)
SELECT 'Dinamarca','DIN','DEN','Dinamarca','https://flagcdn.com/dk.svg'
WHERE NOT EXISTS (SELECT 1 FROM team WHERE fifa_code = 'DEN');

INSERT INTO team (name, short_name, fifa_code, country_name, flag_url)
SELECT 'Bélgica','BEL','BEL','Bélgica','https://flagcdn.com/be.svg'
WHERE NOT EXISTS (SELECT 1 FROM team WHERE fifa_code = 'BEL');

-- ─── Grupos ─────────────────────────────────────────────────────────────────
INSERT INTO group_stage (tournament_id, code, name)
SELECT (SELECT id FROM tournament WHERE code='WC2026'), 'A', 'Grupo A'
WHERE NOT EXISTS (SELECT 1 FROM group_stage WHERE code='A'
  AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026'));

INSERT INTO group_stage (tournament_id, code, name)
SELECT (SELECT id FROM tournament WHERE code='WC2026'), 'B', 'Grupo B'
WHERE NOT EXISTS (SELECT 1 FROM group_stage WHERE code='B'
  AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026'));

INSERT INTO group_stage (tournament_id, code, name)
SELECT (SELECT id FROM tournament WHERE code='WC2026'), 'C', 'Grupo C'
WHERE NOT EXISTS (SELECT 1 FROM group_stage WHERE code='C'
  AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026'));

INSERT INTO group_stage (tournament_id, code, name)
SELECT (SELECT id FROM tournament WHERE code='WC2026'), 'D', 'Grupo D'
WHERE NOT EXISTS (SELECT 1 FROM group_stage WHERE code='D'
  AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026'));

-- ─── Asignar fixtures existentes a grupos ──────────────────────────────────
UPDATE fixture
SET group_stage_id = (SELECT id FROM group_stage WHERE code='A'
  AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026'))
WHERE name = 'Argentina vs Brasil';

UPDATE fixture
SET group_stage_id = (SELECT id FROM group_stage WHERE code='B'
  AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026'))
WHERE name = 'España vs Alemania';

UPDATE fixture
SET group_stage_id = (SELECT id FROM group_stage WHERE code='C'
  AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026'))
WHERE name = 'Francia vs México';

UPDATE fixture
SET group_stage_id = (SELECT id FROM group_stage WHERE code='D'
  AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026'))
WHERE name = 'Colombia vs Uruguay';

-- ─── Tabla de standings ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS group_standing (
    id            BIGSERIAL PRIMARY KEY,
    tournament_id BIGINT NOT NULL REFERENCES tournament(id) ON DELETE CASCADE,
    group_stage_id BIGINT NOT NULL REFERENCES group_stage(id) ON DELETE CASCADE,
    team_id       BIGINT NOT NULL REFERENCES team(id) ON DELETE CASCADE,
    position      INTEGER NOT NULL DEFAULT 0,
    played        INTEGER NOT NULL DEFAULT 0,
    won           INTEGER NOT NULL DEFAULT 0,
    drawn         INTEGER NOT NULL DEFAULT 0,
    lost          INTEGER NOT NULL DEFAULT 0,
    goals_for     INTEGER NOT NULL DEFAULT 0,
    goals_against INTEGER NOT NULL DEFAULT 0,
    points        INTEGER NOT NULL DEFAULT 0,
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT ux_group_standing_group_team UNIQUE (group_stage_id, team_id)
);

-- ─── Standings GRUPO A ──────────────────────────────────────────────────────
-- Argentina: 3J 3G 0E 0P GF9 GA3 +6 9pts
INSERT INTO group_standing (tournament_id, group_stage_id, team_id, position, played, won, drawn, lost, goals_for, goals_against, points)
SELECT (SELECT id FROM tournament WHERE code='WC2026'),
       (SELECT id FROM group_stage WHERE code='A' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM team WHERE fifa_code='ARG'), 1, 3, 3, 0, 0, 9, 3, 9
ON CONFLICT (group_stage_id, team_id) DO NOTHING;

-- Uruguay: 3J 2G 0E 1P GF7 GA5 +2 6pts
INSERT INTO group_standing (tournament_id, group_stage_id, team_id, position, played, won, drawn, lost, goals_for, goals_against, points)
SELECT (SELECT id FROM tournament WHERE code='WC2026'),
       (SELECT id FROM group_stage WHERE code='A' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM team WHERE fifa_code='URY'), 2, 3, 2, 0, 1, 7, 5, 6
ON CONFLICT (group_stage_id, team_id) DO NOTHING;

-- Paraguay: 3J 1G 0E 2P GF3 GA7 -4 3pts
INSERT INTO group_standing (tournament_id, group_stage_id, team_id, position, played, won, drawn, lost, goals_for, goals_against, points)
SELECT (SELECT id FROM tournament WHERE code='WC2026'),
       (SELECT id FROM group_stage WHERE code='A' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM team WHERE fifa_code='PAR'), 3, 3, 1, 0, 2, 3, 7, 3
ON CONFLICT (group_stage_id, team_id) DO NOTHING;

-- Canadá: 3J 0G 0E 3P GF3 GA7 -4 0pts
INSERT INTO group_standing (tournament_id, group_stage_id, team_id, position, played, won, drawn, lost, goals_for, goals_against, points)
SELECT (SELECT id FROM tournament WHERE code='WC2026'),
       (SELECT id FROM group_stage WHERE code='A' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM team WHERE fifa_code='CAN'), 4, 3, 0, 0, 3, 3, 7, 0
ON CONFLICT (group_stage_id, team_id) DO NOTHING;

-- ─── Standings GRUPO B ──────────────────────────────────────────────────────
-- Brasil: 3J 3G 0E 0P GF11 GA3 +8 9pts
INSERT INTO group_standing (tournament_id, group_stage_id, team_id, position, played, won, drawn, lost, goals_for, goals_against, points)
SELECT (SELECT id FROM tournament WHERE code='WC2026'),
       (SELECT id FROM group_stage WHERE code='B' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM team WHERE fifa_code='BRA'), 1, 3, 3, 0, 0, 11, 3, 9
ON CONFLICT (group_stage_id, team_id) DO NOTHING;

-- España: 3J 2G 0E 1P GF6 GA3 +3 6pts
INSERT INTO group_standing (tournament_id, group_stage_id, team_id, position, played, won, drawn, lost, goals_for, goals_against, points)
SELECT (SELECT id FROM tournament WHERE code='WC2026'),
       (SELECT id FROM group_stage WHERE code='B' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM team WHERE fifa_code='ESP'), 2, 3, 2, 0, 1, 6, 3, 6
ON CONFLICT (group_stage_id, team_id) DO NOTHING;

-- Francia: 3J 1G 0E 2P GF4 GA6 -2 3pts
INSERT INTO group_standing (tournament_id, group_stage_id, team_id, position, played, won, drawn, lost, goals_for, goals_against, points)
SELECT (SELECT id FROM tournament WHERE code='WC2026'),
       (SELECT id FROM group_stage WHERE code='B' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM team WHERE fifa_code='FRA'), 3, 3, 1, 0, 2, 4, 6, 3
ON CONFLICT (group_stage_id, team_id) DO NOTHING;

-- Jamaica: 3J 0G 0E 3P GF0 GA9 -9 0pts
INSERT INTO group_standing (tournament_id, group_stage_id, team_id, position, played, won, drawn, lost, goals_for, goals_against, points)
SELECT (SELECT id FROM tournament WHERE code='WC2026'),
       (SELECT id FROM group_stage WHERE code='B' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM team WHERE fifa_code='JAM'), 4, 3, 0, 0, 3, 0, 9, 0
ON CONFLICT (group_stage_id, team_id) DO NOTHING;

-- ─── Standings GRUPO C ──────────────────────────────────────────────────────
-- México: 3J 2G 1E 0P GF6 GA2 +4 7pts
INSERT INTO group_standing (tournament_id, group_stage_id, team_id, position, played, won, drawn, lost, goals_for, goals_against, points)
SELECT (SELECT id FROM tournament WHERE code='WC2026'),
       (SELECT id FROM group_stage WHERE code='C' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM team WHERE fifa_code='MEX'), 1, 3, 2, 1, 0, 6, 2, 7
ON CONFLICT (group_stage_id, team_id) DO NOTHING;

-- Colombia: 3J 1G 2E 0P GF5 GA4 +1 5pts
INSERT INTO group_standing (tournament_id, group_stage_id, team_id, position, played, won, drawn, lost, goals_for, goals_against, points)
SELECT (SELECT id FROM tournament WHERE code='WC2026'),
       (SELECT id FROM group_stage WHERE code='C' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM team WHERE fifa_code='COL'), 2, 3, 1, 2, 0, 5, 4, 5
ON CONFLICT (group_stage_id, team_id) DO NOTHING;

-- Ecuador: 3J 0G 2E 1P GF2 GA4 -2 2pts
INSERT INTO group_standing (tournament_id, group_stage_id, team_id, position, played, won, drawn, lost, goals_for, goals_against, points)
SELECT (SELECT id FROM tournament WHERE code='WC2026'),
       (SELECT id FROM group_stage WHERE code='C' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM team WHERE fifa_code='ECU'), 3, 3, 0, 2, 1, 2, 4, 2
ON CONFLICT (group_stage_id, team_id) DO NOTHING;

-- Bolivia: 3J 0G 1E 2P GF2 GA5 -3 1pts
INSERT INTO group_standing (tournament_id, group_stage_id, team_id, position, played, won, drawn, lost, goals_for, goals_against, points)
SELECT (SELECT id FROM tournament WHERE code='WC2026'),
       (SELECT id FROM group_stage WHERE code='C' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM team WHERE fifa_code='BOL'), 4, 3, 0, 1, 2, 2, 5, 1
ON CONFLICT (group_stage_id, team_id) DO NOTHING;

-- ─── Standings GRUPO D ──────────────────────────────────────────────────────
-- Portugal: 3J 3G 0E 0P GF9 GA2 +7 9pts
INSERT INTO group_standing (tournament_id, group_stage_id, team_id, position, played, won, drawn, lost, goals_for, goals_against, points)
SELECT (SELECT id FROM tournament WHERE code='WC2026'),
       (SELECT id FROM group_stage WHERE code='D' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM team WHERE fifa_code='POR'), 1, 3, 3, 0, 0, 9, 2, 9
ON CONFLICT (group_stage_id, team_id) DO NOTHING;

-- Alemania: 3J 2G 0E 1P GF6 GA3 +3 6pts
INSERT INTO group_standing (tournament_id, group_stage_id, team_id, position, played, won, drawn, lost, goals_for, goals_against, points)
SELECT (SELECT id FROM tournament WHERE code='WC2026'),
       (SELECT id FROM group_stage WHERE code='D' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM team WHERE fifa_code='GER'), 2, 3, 2, 0, 1, 6, 3, 6
ON CONFLICT (group_stage_id, team_id) DO NOTHING;

-- Ghana: 3J 1G 0E 2P GF3 GA7 -4 3pts
INSERT INTO group_standing (tournament_id, group_stage_id, team_id, position, played, won, drawn, lost, goals_for, goals_against, points)
SELECT (SELECT id FROM tournament WHERE code='WC2026'),
       (SELECT id FROM group_stage WHERE code='D' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM team WHERE fifa_code='GHA'), 3, 3, 1, 0, 2, 3, 7, 3
ON CONFLICT (group_stage_id, team_id) DO NOTHING;

-- Japón: 3J 0G 0E 3P GF1 GA7 -6 0pts
INSERT INTO group_standing (tournament_id, group_stage_id, team_id, position, played, won, drawn, lost, goals_for, goals_against, points)
SELECT (SELECT id FROM tournament WHERE code='WC2026'),
       (SELECT id FROM group_stage WHERE code='D' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM team WHERE fifa_code='JPN'), 4, 3, 0, 0, 3, 1, 7, 0
ON CONFLICT (group_stage_id, team_id) DO NOTHING;

-- ─── Etapas eliminatorias ───────────────────────────────────────────────────
INSERT INTO stage (tournament_id, code, name, sort_order)
SELECT (SELECT id FROM tournament WHERE code='WC2026'), 'OCTAVOS', 'Octavos de Final', 2
WHERE NOT EXISTS (SELECT 1 FROM stage WHERE code='OCTAVOS'
  AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026'));

INSERT INTO stage (tournament_id, code, name, sort_order)
SELECT (SELECT id FROM tournament WHERE code='WC2026'), 'CUARTOS', 'Cuartos de Final', 3
WHERE NOT EXISTS (SELECT 1 FROM stage WHERE code='CUARTOS'
  AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026'));

INSERT INTO stage (tournament_id, code, name, sort_order)
SELECT (SELECT id FROM tournament WHERE code='WC2026'), 'SEMIFINAL', 'Semifinales', 4
WHERE NOT EXISTS (SELECT 1 FROM stage WHERE code='SEMIFINAL'
  AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026'));

INSERT INTO stage (tournament_id, code, name, sort_order)
SELECT (SELECT id FROM tournament WHERE code='WC2026'), 'FINAL', 'Final', 5
WHERE NOT EXISTS (SELECT 1 FROM stage WHERE code='FINAL'
  AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026'));

-- Fin V8
