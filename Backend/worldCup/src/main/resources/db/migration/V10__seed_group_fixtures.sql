-- V10: Fixtures completos de fase de grupos (calculados para producir standings actuales)
-- Desvincula los 4 fixtures originales que tienen matchups incorrectos entre grupos
UPDATE fixture SET group_stage_id = NULL
WHERE name IN ('Argentina vs Brasil','España vs Alemania','Francia vs México','Colombia vs Uruguay');

-- ─── GRUPO A: ARG(9pts) URU(6pts) PAR(3pts) CAN(0pts) ───────────────────────
-- ARG 3-1 URU, ARG 4-1 PAR, ARG 2-1 CAN
-- URU 3-0 PAR, URU 3-2 CAN
-- PAR 2-0 CAN

INSERT INTO fixture (tournament_id, stage_id, group_stage_id, home_team_id, away_team_id, name, kickoff_at, prediction_locked_at, status, home_score, away_score)
SELECT (SELECT id FROM tournament WHERE code='WC2026'),
       (SELECT id FROM stage WHERE code='GROUPS' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM group_stage WHERE code='A' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM team WHERE fifa_code='ARG'), (SELECT id FROM team WHERE fifa_code='URY'),
       'ARG vs URU (Grupo A)', '2026-06-11 18:00:00+00', '2026-06-11 17:55:00+00', 'FINISHED', 3, 1
WHERE NOT EXISTS (SELECT 1 FROM fixture WHERE name='ARG vs URU (Grupo A)');

INSERT INTO fixture (tournament_id, stage_id, group_stage_id, home_team_id, away_team_id, name, kickoff_at, prediction_locked_at, status, home_score, away_score)
SELECT (SELECT id FROM tournament WHERE code='WC2026'),
       (SELECT id FROM stage WHERE code='GROUPS' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM group_stage WHERE code='A' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM team WHERE fifa_code='ARG'), (SELECT id FROM team WHERE fifa_code='PAR'),
       'ARG vs PAR (Grupo A)', '2026-06-15 18:00:00+00', '2026-06-15 17:55:00+00', 'FINISHED', 4, 1
WHERE NOT EXISTS (SELECT 1 FROM fixture WHERE name='ARG vs PAR (Grupo A)');

INSERT INTO fixture (tournament_id, stage_id, group_stage_id, home_team_id, away_team_id, name, kickoff_at, prediction_locked_at, status, home_score, away_score)
SELECT (SELECT id FROM tournament WHERE code='WC2026'),
       (SELECT id FROM stage WHERE code='GROUPS' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM group_stage WHERE code='A' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM team WHERE fifa_code='ARG'), (SELECT id FROM team WHERE fifa_code='CAN'),
       'ARG vs CAN (Grupo A)', '2026-06-19 18:00:00+00', '2026-06-19 17:55:00+00', 'FINISHED', 2, 1
WHERE NOT EXISTS (SELECT 1 FROM fixture WHERE name='ARG vs CAN (Grupo A)');

INSERT INTO fixture (tournament_id, stage_id, group_stage_id, home_team_id, away_team_id, name, kickoff_at, prediction_locked_at, status, home_score, away_score)
SELECT (SELECT id FROM tournament WHERE code='WC2026'),
       (SELECT id FROM stage WHERE code='GROUPS' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM group_stage WHERE code='A' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM team WHERE fifa_code='URY'), (SELECT id FROM team WHERE fifa_code='PAR'),
       'URU vs PAR (Grupo A)', '2026-06-12 21:00:00+00', '2026-06-12 20:55:00+00', 'FINISHED', 3, 0
WHERE NOT EXISTS (SELECT 1 FROM fixture WHERE name='URU vs PAR (Grupo A)');

INSERT INTO fixture (tournament_id, stage_id, group_stage_id, home_team_id, away_team_id, name, kickoff_at, prediction_locked_at, status, home_score, away_score)
SELECT (SELECT id FROM tournament WHERE code='WC2026'),
       (SELECT id FROM stage WHERE code='GROUPS' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM group_stage WHERE code='A' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM team WHERE fifa_code='URY'), (SELECT id FROM team WHERE fifa_code='CAN'),
       'URU vs CAN (Grupo A)', '2026-06-20 21:00:00+00', '2026-06-20 20:55:00+00', 'FINISHED', 3, 2
WHERE NOT EXISTS (SELECT 1 FROM fixture WHERE name='URU vs CAN (Grupo A)');

INSERT INTO fixture (tournament_id, stage_id, group_stage_id, home_team_id, away_team_id, name, kickoff_at, prediction_locked_at, status, home_score, away_score)
SELECT (SELECT id FROM tournament WHERE code='WC2026'),
       (SELECT id FROM stage WHERE code='GROUPS' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM group_stage WHERE code='A' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM team WHERE fifa_code='PAR'), (SELECT id FROM team WHERE fifa_code='CAN'),
       'PAR vs CAN (Grupo A)', '2026-06-24 18:00:00+00', '2026-06-24 17:55:00+00', 'FINISHED', 2, 0
WHERE NOT EXISTS (SELECT 1 FROM fixture WHERE name='PAR vs CAN (Grupo A)');

-- ─── GRUPO B: BRA(9pts) ESP(6pts) FRA(3pts) JAM(0pts) ───────────────────────
-- BRA 2-1 ESP, BRA 4-2 FRA, BRA 5-0 JAM
-- ESP 2-1 FRA, ESP 3-0 JAM
-- FRA 1-0 JAM

INSERT INTO fixture (tournament_id, stage_id, group_stage_id, home_team_id, away_team_id, name, kickoff_at, prediction_locked_at, status, home_score, away_score)
SELECT (SELECT id FROM tournament WHERE code='WC2026'),
       (SELECT id FROM stage WHERE code='GROUPS' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM group_stage WHERE code='B' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM team WHERE fifa_code='BRA'), (SELECT id FROM team WHERE fifa_code='ESP'),
       'BRA vs ESP (Grupo B)', '2026-06-11 21:00:00+00', '2026-06-11 20:55:00+00', 'FINISHED', 2, 1
WHERE NOT EXISTS (SELECT 1 FROM fixture WHERE name='BRA vs ESP (Grupo B)');

INSERT INTO fixture (tournament_id, stage_id, group_stage_id, home_team_id, away_team_id, name, kickoff_at, prediction_locked_at, status, home_score, away_score)
SELECT (SELECT id FROM tournament WHERE code='WC2026'),
       (SELECT id FROM stage WHERE code='GROUPS' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM group_stage WHERE code='B' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM team WHERE fifa_code='BRA'), (SELECT id FROM team WHERE fifa_code='FRA'),
       'BRA vs FRA (Grupo B)', '2026-06-16 18:00:00+00', '2026-06-16 17:55:00+00', 'FINISHED', 4, 2
WHERE NOT EXISTS (SELECT 1 FROM fixture WHERE name='BRA vs FRA (Grupo B)');

INSERT INTO fixture (tournament_id, stage_id, group_stage_id, home_team_id, away_team_id, name, kickoff_at, prediction_locked_at, status, home_score, away_score)
SELECT (SELECT id FROM tournament WHERE code='WC2026'),
       (SELECT id FROM stage WHERE code='GROUPS' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM group_stage WHERE code='B' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM team WHERE fifa_code='BRA'), (SELECT id FROM team WHERE fifa_code='JAM'),
       'BRA vs JAM (Grupo B)', '2026-06-21 18:00:00+00', '2026-06-21 17:55:00+00', 'FINISHED', 5, 0
WHERE NOT EXISTS (SELECT 1 FROM fixture WHERE name='BRA vs JAM (Grupo B)');

INSERT INTO fixture (tournament_id, stage_id, group_stage_id, home_team_id, away_team_id, name, kickoff_at, prediction_locked_at, status, home_score, away_score)
SELECT (SELECT id FROM tournament WHERE code='WC2026'),
       (SELECT id FROM stage WHERE code='GROUPS' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM group_stage WHERE code='B' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM team WHERE fifa_code='ESP'), (SELECT id FROM team WHERE fifa_code='FRA'),
       'ESP vs FRA (Grupo B)', '2026-06-13 18:00:00+00', '2026-06-13 17:55:00+00', 'FINISHED', 2, 1
WHERE NOT EXISTS (SELECT 1 FROM fixture WHERE name='ESP vs FRA (Grupo B)');

INSERT INTO fixture (tournament_id, stage_id, group_stage_id, home_team_id, away_team_id, name, kickoff_at, prediction_locked_at, status, home_score, away_score)
SELECT (SELECT id FROM tournament WHERE code='WC2026'),
       (SELECT id FROM stage WHERE code='GROUPS' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM group_stage WHERE code='B' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM team WHERE fifa_code='ESP'), (SELECT id FROM team WHERE fifa_code='JAM'),
       'ESP vs JAM (Grupo B)', '2026-06-22 18:00:00+00', '2026-06-22 17:55:00+00', 'FINISHED', 3, 0
WHERE NOT EXISTS (SELECT 1 FROM fixture WHERE name='ESP vs JAM (Grupo B)');

INSERT INTO fixture (tournament_id, stage_id, group_stage_id, home_team_id, away_team_id, name, kickoff_at, prediction_locked_at, status, home_score, away_score)
SELECT (SELECT id FROM tournament WHERE code='WC2026'),
       (SELECT id FROM stage WHERE code='GROUPS' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM group_stage WHERE code='B' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM team WHERE fifa_code='FRA'), (SELECT id FROM team WHERE fifa_code='JAM'),
       'FRA vs JAM (Grupo B)', '2026-06-25 18:00:00+00', '2026-06-25 17:55:00+00', 'FINISHED', 1, 0
WHERE NOT EXISTS (SELECT 1 FROM fixture WHERE name='FRA vs JAM (Grupo B)');

-- ─── GRUPO C: MEX(7pts) COL(5pts) ECU(2pts) BOL(1pt) ────────────────────────
-- MEX 1-1 COL, MEX 3-1 ECU, MEX 2-0 BOL
-- COL 1-1 ECU, COL 3-2 BOL
-- ECU 0-0 BOL

INSERT INTO fixture (tournament_id, stage_id, group_stage_id, home_team_id, away_team_id, name, kickoff_at, prediction_locked_at, status, home_score, away_score)
SELECT (SELECT id FROM tournament WHERE code='WC2026'),
       (SELECT id FROM stage WHERE code='GROUPS' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM group_stage WHERE code='C' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM team WHERE fifa_code='MEX'), (SELECT id FROM team WHERE fifa_code='COL'),
       'MEX vs COL (Grupo C)', '2026-06-12 18:00:00+00', '2026-06-12 17:55:00+00', 'FINISHED', 1, 1
WHERE NOT EXISTS (SELECT 1 FROM fixture WHERE name='MEX vs COL (Grupo C)');

INSERT INTO fixture (tournament_id, stage_id, group_stage_id, home_team_id, away_team_id, name, kickoff_at, prediction_locked_at, status, home_score, away_score)
SELECT (SELECT id FROM tournament WHERE code='WC2026'),
       (SELECT id FROM stage WHERE code='GROUPS' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM group_stage WHERE code='C' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM team WHERE fifa_code='MEX'), (SELECT id FROM team WHERE fifa_code='ECU'),
       'MEX vs ECU (Grupo C)', '2026-06-16 21:00:00+00', '2026-06-16 20:55:00+00', 'FINISHED', 3, 1
WHERE NOT EXISTS (SELECT 1 FROM fixture WHERE name='MEX vs ECU (Grupo C)');

INSERT INTO fixture (tournament_id, stage_id, group_stage_id, home_team_id, away_team_id, name, kickoff_at, prediction_locked_at, status, home_score, away_score)
SELECT (SELECT id FROM tournament WHERE code='WC2026'),
       (SELECT id FROM stage WHERE code='GROUPS' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM group_stage WHERE code='C' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM team WHERE fifa_code='MEX'), (SELECT id FROM team WHERE fifa_code='BOL'),
       'MEX vs BOL (Grupo C)', '2026-06-21 21:00:00+00', '2026-06-21 20:55:00+00', 'FINISHED', 2, 0
WHERE NOT EXISTS (SELECT 1 FROM fixture WHERE name='MEX vs BOL (Grupo C)');

INSERT INTO fixture (tournament_id, stage_id, group_stage_id, home_team_id, away_team_id, name, kickoff_at, prediction_locked_at, status, home_score, away_score)
SELECT (SELECT id FROM tournament WHERE code='WC2026'),
       (SELECT id FROM stage WHERE code='GROUPS' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM group_stage WHERE code='C' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM team WHERE fifa_code='COL'), (SELECT id FROM team WHERE fifa_code='ECU'),
       'COL vs ECU (Grupo C)', '2026-06-14 18:00:00+00', '2026-06-14 17:55:00+00', 'FINISHED', 1, 1
WHERE NOT EXISTS (SELECT 1 FROM fixture WHERE name='COL vs ECU (Grupo C)');

INSERT INTO fixture (tournament_id, stage_id, group_stage_id, home_team_id, away_team_id, name, kickoff_at, prediction_locked_at, status, home_score, away_score)
SELECT (SELECT id FROM tournament WHERE code='WC2026'),
       (SELECT id FROM stage WHERE code='GROUPS' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM group_stage WHERE code='C' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM team WHERE fifa_code='COL'), (SELECT id FROM team WHERE fifa_code='BOL'),
       'COL vs BOL (Grupo C)', '2026-06-22 21:00:00+00', '2026-06-22 20:55:00+00', 'FINISHED', 3, 2
WHERE NOT EXISTS (SELECT 1 FROM fixture WHERE name='COL vs BOL (Grupo C)');

INSERT INTO fixture (tournament_id, stage_id, group_stage_id, home_team_id, away_team_id, name, kickoff_at, prediction_locked_at, status, home_score, away_score)
SELECT (SELECT id FROM tournament WHERE code='WC2026'),
       (SELECT id FROM stage WHERE code='GROUPS' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM group_stage WHERE code='C' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM team WHERE fifa_code='ECU'), (SELECT id FROM team WHERE fifa_code='BOL'),
       'ECU vs BOL (Grupo C)', '2026-06-25 21:00:00+00', '2026-06-25 20:55:00+00', 'FINISHED', 0, 0
WHERE NOT EXISTS (SELECT 1 FROM fixture WHERE name='ECU vs BOL (Grupo C)');

-- ─── GRUPO D: POR(9pts) GER(6pts) GHA(3pts) JPN(0pts) ───────────────────────
-- POR 2-0 GER, POR 4-1 GHA, POR 3-1 JPN
-- GER 3-1 GHA, GER 3-0 JPN
-- GHA 1-0 JPN

INSERT INTO fixture (tournament_id, stage_id, group_stage_id, home_team_id, away_team_id, name, kickoff_at, prediction_locked_at, status, home_score, away_score)
SELECT (SELECT id FROM tournament WHERE code='WC2026'),
       (SELECT id FROM stage WHERE code='GROUPS' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM group_stage WHERE code='D' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM team WHERE fifa_code='POR'), (SELECT id FROM team WHERE fifa_code='GER'),
       'POR vs GER (Grupo D)', '2026-06-13 21:00:00+00', '2026-06-13 20:55:00+00', 'FINISHED', 2, 0
WHERE NOT EXISTS (SELECT 1 FROM fixture WHERE name='POR vs GER (Grupo D)');

INSERT INTO fixture (tournament_id, stage_id, group_stage_id, home_team_id, away_team_id, name, kickoff_at, prediction_locked_at, status, home_score, away_score)
SELECT (SELECT id FROM tournament WHERE code='WC2026'),
       (SELECT id FROM stage WHERE code='GROUPS' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM group_stage WHERE code='D' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM team WHERE fifa_code='POR'), (SELECT id FROM team WHERE fifa_code='GHA'),
       'POR vs GHA (Grupo D)', '2026-06-17 18:00:00+00', '2026-06-17 17:55:00+00', 'FINISHED', 4, 1
WHERE NOT EXISTS (SELECT 1 FROM fixture WHERE name='POR vs GHA (Grupo D)');

INSERT INTO fixture (tournament_id, stage_id, group_stage_id, home_team_id, away_team_id, name, kickoff_at, prediction_locked_at, status, home_score, away_score)
SELECT (SELECT id FROM tournament WHERE code='WC2026'),
       (SELECT id FROM stage WHERE code='GROUPS' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM group_stage WHERE code='D' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM team WHERE fifa_code='POR'), (SELECT id FROM team WHERE fifa_code='JPN'),
       'POR vs JPN (Grupo D)', '2026-06-23 18:00:00+00', '2026-06-23 17:55:00+00', 'FINISHED', 3, 1
WHERE NOT EXISTS (SELECT 1 FROM fixture WHERE name='POR vs JPN (Grupo D)');

INSERT INTO fixture (tournament_id, stage_id, group_stage_id, home_team_id, away_team_id, name, kickoff_at, prediction_locked_at, status, home_score, away_score)
SELECT (SELECT id FROM tournament WHERE code='WC2026'),
       (SELECT id FROM stage WHERE code='GROUPS' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM group_stage WHERE code='D' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM team WHERE fifa_code='GER'), (SELECT id FROM team WHERE fifa_code='GHA'),
       'GER vs GHA (Grupo D)', '2026-06-15 21:00:00+00', '2026-06-15 20:55:00+00', 'FINISHED', 3, 1
WHERE NOT EXISTS (SELECT 1 FROM fixture WHERE name='GER vs GHA (Grupo D)');

INSERT INTO fixture (tournament_id, stage_id, group_stage_id, home_team_id, away_team_id, name, kickoff_at, prediction_locked_at, status, home_score, away_score)
SELECT (SELECT id FROM tournament WHERE code='WC2026'),
       (SELECT id FROM stage WHERE code='GROUPS' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM group_stage WHERE code='D' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM team WHERE fifa_code='GER'), (SELECT id FROM team WHERE fifa_code='JPN'),
       'GER vs JPN (Grupo D)', '2026-06-23 21:00:00+00', '2026-06-23 20:55:00+00', 'FINISHED', 3, 0
WHERE NOT EXISTS (SELECT 1 FROM fixture WHERE name='GER vs JPN (Grupo D)');

INSERT INTO fixture (tournament_id, stage_id, group_stage_id, home_team_id, away_team_id, name, kickoff_at, prediction_locked_at, status, home_score, away_score)
SELECT (SELECT id FROM tournament WHERE code='WC2026'),
       (SELECT id FROM stage WHERE code='GROUPS' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM group_stage WHERE code='D' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       (SELECT id FROM team WHERE fifa_code='GHA'), (SELECT id FROM team WHERE fifa_code='JPN'),
       'GHA vs JPN (Grupo D)', '2026-06-26 18:00:00+00', '2026-06-26 17:55:00+00', 'FINISHED', 1, 0
WHERE NOT EXISTS (SELECT 1 FROM fixture WHERE name='GHA vs JPN (Grupo D)');

-- Fin V10
