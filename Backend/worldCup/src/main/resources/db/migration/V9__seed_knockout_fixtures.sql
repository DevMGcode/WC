-- V9: Fixtures fase eliminatoria WC2026
-- Equipos disponibles desde V8: NED, KOR, POL, MAR, ITA, SUI, DEN, BEL
-- Equipos existentes: ARG, BRA, FRA, ESP, GER, POR, URY, MEX, COL

-- ─── OCTAVOS DE FINAL ───────────────────────────────────────────────────────

INSERT INTO fixture (tournament_id, stage_id, home_team_id, away_team_id, name, kickoff_at, prediction_locked_at, status, home_score, away_score)
SELECT
  (SELECT id FROM tournament WHERE code='WC2026'),
  (SELECT id FROM stage WHERE code='OCTAVOS' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
  (SELECT id FROM team WHERE fifa_code='ARG'),
  (SELECT id FROM team WHERE fifa_code='NED'),
  'Argentina vs Holanda',
  '2026-06-28 18:00:00+00', '2026-06-28 17:55:00+00', 'FINISHED', 2, 1
WHERE NOT EXISTS (SELECT 1 FROM fixture WHERE name='Argentina vs Holanda');

INSERT INTO fixture (tournament_id, stage_id, home_team_id, away_team_id, name, kickoff_at, prediction_locked_at, status, home_score, away_score)
SELECT
  (SELECT id FROM tournament WHERE code='WC2026'),
  (SELECT id FROM stage WHERE code='OCTAVOS' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
  (SELECT id FROM team WHERE fifa_code='BRA'),
  (SELECT id FROM team WHERE fifa_code='KOR'),
  'Brasil vs Corea del Sur',
  '2026-06-28 22:00:00+00', '2026-06-28 21:55:00+00', 'FINISHED', 4, 1
WHERE NOT EXISTS (SELECT 1 FROM fixture WHERE name='Brasil vs Corea del Sur');

INSERT INTO fixture (tournament_id, stage_id, home_team_id, away_team_id, name, kickoff_at, prediction_locked_at, status, home_score, away_score)
SELECT
  (SELECT id FROM tournament WHERE code='WC2026'),
  (SELECT id FROM stage WHERE code='OCTAVOS' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
  (SELECT id FROM team WHERE fifa_code='FRA'),
  (SELECT id FROM team WHERE fifa_code='POL'),
  'Francia vs Polonia',
  '2026-06-29 18:00:00+00', '2026-06-29 17:55:00+00', 'FINISHED', 3, 1
WHERE NOT EXISTS (SELECT 1 FROM fixture WHERE name='Francia vs Polonia');

INSERT INTO fixture (tournament_id, stage_id, home_team_id, away_team_id, name, kickoff_at, prediction_locked_at, status, home_score, away_score)
SELECT
  (SELECT id FROM tournament WHERE code='WC2026'),
  (SELECT id FROM stage WHERE code='OCTAVOS' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
  (SELECT id FROM team WHERE fifa_code='ESP'),
  (SELECT id FROM team WHERE fifa_code='MAR'),
  'España vs Marruecos',
  '2026-06-29 22:00:00+00', '2026-06-29 21:55:00+00', 'FINISHED', 3, 0
WHERE NOT EXISTS (SELECT 1 FROM fixture WHERE name='España vs Marruecos');

INSERT INTO fixture (tournament_id, stage_id, home_team_id, away_team_id, name, kickoff_at, prediction_locked_at, status, home_score, away_score)
SELECT
  (SELECT id FROM tournament WHERE code='WC2026'),
  (SELECT id FROM stage WHERE code='OCTAVOS' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
  (SELECT id FROM team WHERE fifa_code='GER'),
  (SELECT id FROM team WHERE fifa_code='JPN'),
  'Alemania vs Japón',
  '2026-06-30 18:00:00+00', '2026-06-30 17:55:00+00', 'FINISHED', 4, 2
WHERE NOT EXISTS (SELECT 1 FROM fixture WHERE name='Alemania vs Japón');

INSERT INTO fixture (tournament_id, stage_id, home_team_id, away_team_id, name, kickoff_at, prediction_locked_at, status, home_score, away_score)
SELECT
  (SELECT id FROM tournament WHERE code='WC2026'),
  (SELECT id FROM stage WHERE code='OCTAVOS' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
  (SELECT id FROM team WHERE fifa_code='ITA'),
  (SELECT id FROM team WHERE fifa_code='SUI'),
  'Italia vs Suiza',
  '2026-06-30 22:00:00+00', '2026-06-30 21:55:00+00', 'FINISHED', 2, 0
WHERE NOT EXISTS (SELECT 1 FROM fixture WHERE name='Italia vs Suiza');

INSERT INTO fixture (tournament_id, stage_id, home_team_id, away_team_id, name, kickoff_at, prediction_locked_at, status, home_score, away_score)
SELECT
  (SELECT id FROM tournament WHERE code='WC2026'),
  (SELECT id FROM stage WHERE code='OCTAVOS' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
  (SELECT id FROM team WHERE fifa_code='POR'),
  (SELECT id FROM team WHERE fifa_code='DEN'),
  'Portugal vs Dinamarca',
  '2026-07-01 18:00:00+00', '2026-07-01 17:55:00+00', 'FINISHED', 3, 1
WHERE NOT EXISTS (SELECT 1 FROM fixture WHERE name='Portugal vs Dinamarca');

INSERT INTO fixture (tournament_id, stage_id, home_team_id, away_team_id, name, kickoff_at, prediction_locked_at, status, home_score, away_score)
SELECT
  (SELECT id FROM tournament WHERE code='WC2026'),
  (SELECT id FROM stage WHERE code='OCTAVOS' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
  (SELECT id FROM team WHERE fifa_code='BEL'),
  (SELECT id FROM team WHERE fifa_code='URY'),
  'Bélgica vs Uruguay',
  '2026-07-01 22:00:00+00', '2026-07-01 21:55:00+00', 'FINISHED', 2, 0
WHERE NOT EXISTS (SELECT 1 FROM fixture WHERE name='Bélgica vs Uruguay');

-- ─── CUARTOS DE FINAL ───────────────────────────────────────────────────────

INSERT INTO fixture (tournament_id, stage_id, home_team_id, away_team_id, name, kickoff_at, prediction_locked_at, status, home_score, away_score)
SELECT
  (SELECT id FROM tournament WHERE code='WC2026'),
  (SELECT id FROM stage WHERE code='CUARTOS' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
  (SELECT id FROM team WHERE fifa_code='ARG'),
  (SELECT id FROM team WHERE fifa_code='BRA'),
  'Argentina vs Brasil (Cuartos)',
  '2026-07-05 18:00:00+00', '2026-07-05 17:55:00+00', 'FINISHED', 1, 0
WHERE NOT EXISTS (SELECT 1 FROM fixture WHERE name='Argentina vs Brasil (Cuartos)');

INSERT INTO fixture (tournament_id, stage_id, home_team_id, away_team_id, name, kickoff_at, prediction_locked_at, status, home_score, away_score)
SELECT
  (SELECT id FROM tournament WHERE code='WC2026'),
  (SELECT id FROM stage WHERE code='CUARTOS' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
  (SELECT id FROM team WHERE fifa_code='FRA'),
  (SELECT id FROM team WHERE fifa_code='ESP'),
  'Francia vs España (Cuartos)',
  '2026-07-05 22:00:00+00', '2026-07-05 21:55:00+00', 'FINISHED', 2, 1
WHERE NOT EXISTS (SELECT 1 FROM fixture WHERE name='Francia vs España (Cuartos)');

INSERT INTO fixture (tournament_id, stage_id, home_team_id, away_team_id, name, kickoff_at, prediction_locked_at, status, home_score, away_score)
SELECT
  (SELECT id FROM tournament WHERE code='WC2026'),
  (SELECT id FROM stage WHERE code='CUARTOS' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
  (SELECT id FROM team WHERE fifa_code='GER'),
  (SELECT id FROM team WHERE fifa_code='ITA'),
  'Alemania vs Italia (Cuartos)',
  '2026-07-06 18:00:00+00', '2026-07-06 17:55:00+00', 'FINISHED', 2, 1
WHERE NOT EXISTS (SELECT 1 FROM fixture WHERE name='Alemania vs Italia (Cuartos)');

INSERT INTO fixture (tournament_id, stage_id, home_team_id, away_team_id, name, kickoff_at, prediction_locked_at, status, home_score, away_score)
SELECT
  (SELECT id FROM tournament WHERE code='WC2026'),
  (SELECT id FROM stage WHERE code='CUARTOS' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
  (SELECT id FROM team WHERE fifa_code='POR'),
  (SELECT id FROM team WHERE fifa_code='BEL'),
  'Portugal vs Bélgica (Cuartos)',
  '2026-07-06 22:00:00+00', '2026-07-06 21:55:00+00', 'FINISHED', 3, 1
WHERE NOT EXISTS (SELECT 1 FROM fixture WHERE name='Portugal vs Bélgica (Cuartos)');

-- ─── SEMIFINALES ────────────────────────────────────────────────────────────

INSERT INTO fixture (tournament_id, stage_id, home_team_id, away_team_id, name, kickoff_at, prediction_locked_at, status, home_score, away_score)
SELECT
  (SELECT id FROM tournament WHERE code='WC2026'),
  (SELECT id FROM stage WHERE code='SEMIFINAL' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
  (SELECT id FROM team WHERE fifa_code='ARG'),
  (SELECT id FROM team WHERE fifa_code='FRA'),
  'Argentina vs Francia (Semifinal)',
  '2026-07-09 21:00:00+00', '2026-07-09 20:55:00+00', 'FINISHED', 2, 0
WHERE NOT EXISTS (SELECT 1 FROM fixture WHERE name='Argentina vs Francia (Semifinal)');

INSERT INTO fixture (tournament_id, stage_id, home_team_id, away_team_id, name, kickoff_at, prediction_locked_at, status, home_score, away_score)
SELECT
  (SELECT id FROM tournament WHERE code='WC2026'),
  (SELECT id FROM stage WHERE code='SEMIFINAL' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
  (SELECT id FROM team WHERE fifa_code='GER'),
  (SELECT id FROM team WHERE fifa_code='POR'),
  'Alemania vs Portugal (Semifinal)',
  '2026-07-10 21:00:00+00', '2026-07-10 20:55:00+00', 'FINISHED', 2, 1
WHERE NOT EXISTS (SELECT 1 FROM fixture WHERE name='Alemania vs Portugal (Semifinal)');

-- ─── FINAL ──────────────────────────────────────────────────────────────────

INSERT INTO fixture (tournament_id, stage_id, home_team_id, away_team_id, name, kickoff_at, prediction_locked_at, status, home_score, away_score)
SELECT
  (SELECT id FROM tournament WHERE code='WC2026'),
  (SELECT id FROM stage WHERE code='FINAL' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
  (SELECT id FROM team WHERE fifa_code='ARG'),
  (SELECT id FROM team WHERE fifa_code='GER'),
  'Argentina vs Alemania (Final)',
  '2026-07-13 21:00:00+00', '2026-07-13 20:55:00+00', 'FINISHED', 3, 2
WHERE NOT EXISTS (SELECT 1 FROM fixture WHERE name='Argentina vs Alemania (Final)');

-- Fin V9
