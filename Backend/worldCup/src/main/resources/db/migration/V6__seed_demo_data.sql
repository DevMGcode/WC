-- V6__seed_demo_data.sql
-- Datos de prueba para desarrollo: torneo, equipos, escenarios, fixtures, usuarios y porras

-- Insertar torneo
INSERT INTO tournament (code, name, host_countries, starts_at, ends_at, status)
VALUES ('WC2026', 'World Cup 2026', 'USA,MEX,CAN', '2026-06-10T00:00:00Z', '2026-07-10T00:00:00Z', 'ACTIVE')
ON CONFLICT (code) DO NOTHING;

-- Insertar equipos
-- Insertar equipos (si no existen)
INSERT INTO team (name, short_name, fifa_code, country_name, flag_url)
SELECT 'Argentina','ARG','ARG','Argentina','https://flagcdn.com/ar.svg'
WHERE NOT EXISTS (SELECT 1 FROM team WHERE name='Argentina');

INSERT INTO team (name, short_name, fifa_code, country_name, flag_url)
SELECT 'Brasil','BRA','BRA','Brasil','https://flagcdn.com/br.svg'
WHERE NOT EXISTS (SELECT 1 FROM team WHERE name='Brasil');

INSERT INTO team (name, short_name, fifa_code, country_name, flag_url)
SELECT 'México','MEX','MEX','México','https://flagcdn.com/mx.svg'
WHERE NOT EXISTS (SELECT 1 FROM team WHERE name='México');

INSERT INTO team (name, short_name, fifa_code, country_name, flag_url)
SELECT 'Colombia','COL','COL','Colombia','https://flagcdn.com/co.svg'
WHERE NOT EXISTS (SELECT 1 FROM team WHERE name='Colombia');

INSERT INTO team (name, short_name, fifa_code, country_name, flag_url)
SELECT 'Uruguay','URY','URY','Uruguay','https://flagcdn.com/uy.svg'
WHERE NOT EXISTS (SELECT 1 FROM team WHERE name='Uruguay');

INSERT INTO team (name, short_name, fifa_code, country_name, flag_url)
SELECT 'Francia','FRA','FRA','Francia','https://flagcdn.com/fr.svg'
WHERE NOT EXISTS (SELECT 1 FROM team WHERE name='Francia');

INSERT INTO team (name, short_name, fifa_code, country_name, flag_url)
SELECT 'España','ESP','ESP','España','https://flagcdn.com/es.svg'
WHERE NOT EXISTS (SELECT 1 FROM team WHERE name='España');

INSERT INTO team (name, short_name, fifa_code, country_name, flag_url)
SELECT 'Alemania','GER','GER','Alemania','https://flagcdn.com/de.svg'
WHERE NOT EXISTS (SELECT 1 FROM team WHERE name='Alemania');

-- Insertar una stage básica (GROUPS)
INSERT INTO stage (tournament_id, code, name, sort_order)
SELECT (SELECT id FROM tournament WHERE code = 'WC2026'), 'GROUPS', 'Fase de Grupos', 1
WHERE NOT EXISTS (
  SELECT 1 FROM stage WHERE tournament_id=(SELECT id FROM tournament WHERE code = 'WC2026') AND code='GROUPS'
);

-- Insertar un venue
INSERT INTO venue (name, city_name, country_name, capacity)
SELECT 'Estadio Demo','Ciudad Demo','Pais Demo',50000
WHERE NOT EXISTS (SELECT 1 FROM venue WHERE name='Estadio Demo');

-- Insertar fixtures de ejemplo
-- 4 partidos, algunos en pasado y algunos programados

-- Insertar fixtures uno a uno si no existen
INSERT INTO fixture (tournament_id, stage_id, group_stage_id, venue_id, home_team_id, away_team_id, name, kickoff_at, prediction_locked_at, status)
SELECT (SELECT id FROM tournament WHERE code='WC2026'),
       (SELECT id FROM stage WHERE code='GROUPS' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       NULL,
       (SELECT id FROM venue WHERE name='Estadio Demo'),
       (SELECT id FROM team WHERE name='Argentina'),
       (SELECT id FROM team WHERE name='Brasil'),
       'Argentina vs Brasil',
       (NOW() - INTERVAL '1 day'),
       (NOW() - INTERVAL '1 hour'),
       'FINISHED'
WHERE NOT EXISTS (SELECT 1 FROM fixture WHERE name='Argentina vs Brasil');

INSERT INTO fixture (tournament_id, stage_id, group_stage_id, venue_id, home_team_id, away_team_id, name, kickoff_at, prediction_locked_at, status)
SELECT (SELECT id FROM tournament WHERE code='WC2026'),
       (SELECT id FROM stage WHERE code='GROUPS' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       NULL,
       (SELECT id FROM venue WHERE name='Estadio Demo'),
       (SELECT id FROM team WHERE name='España'),
       (SELECT id FROM team WHERE name='Alemania'),
       'España vs Alemania',
       (NOW() + INTERVAL '2 days'),
       (NOW() + INTERVAL '2 days' - INTERVAL '10 minutes'),
       'SCHEDULED'
WHERE NOT EXISTS (SELECT 1 FROM fixture WHERE name='España vs Alemania');

INSERT INTO fixture (tournament_id, stage_id, group_stage_id, venue_id, home_team_id, away_team_id, name, kickoff_at, prediction_locked_at, status)
SELECT (SELECT id FROM tournament WHERE code='WC2026'),
       (SELECT id FROM stage WHERE code='GROUPS' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       NULL,
       (SELECT id FROM venue WHERE name='Estadio Demo'),
       (SELECT id FROM team WHERE name='Francia'),
       (SELECT id FROM team WHERE name='México'),
       'Francia vs México',
       (NOW() + INTERVAL '7 days'),
       (NOW() + INTERVAL '7 days' - INTERVAL '10 minutes'),
       'SCHEDULED'
WHERE NOT EXISTS (SELECT 1 FROM fixture WHERE name='Francia vs México');

INSERT INTO fixture (tournament_id, stage_id, group_stage_id, venue_id, home_team_id, away_team_id, name, kickoff_at, prediction_locked_at, status)
SELECT (SELECT id FROM tournament WHERE code='WC2026'),
       (SELECT id FROM stage WHERE code='GROUPS' AND tournament_id=(SELECT id FROM tournament WHERE code='WC2026')),
       NULL,
       (SELECT id FROM venue WHERE name='Estadio Demo'),
       (SELECT id FROM team WHERE name='Colombia'),
       (SELECT id FROM team WHERE name='Uruguay'),
       'Colombia vs Uruguay',
       (NOW() - INTERVAL '2 days'),
       (NOW() - INTERVAL '2 days' - INTERVAL '10 minutes'),
       'FINISHED'
WHERE NOT EXISTS (SELECT 1 FROM fixture WHERE name='Colombia vs Uruguay');

UPDATE fixture SET home_score = 3, away_score = 1 WHERE name = 'Argentina vs Brasil';
UPDATE fixture SET home_score = 2, away_score = 0 WHERE name = 'Colombia vs Uruguay';

-- Insertar usuarios de prueba (si no existen)
INSERT INTO app_user (username, email, password_hash, first_name, last_name, preferred_language, time_zone)
SELECT 'demo_user','demo_user@example.com','demo-password-not-used','Demo','User','es','UTC'
WHERE NOT EXISTS (SELECT 1 FROM app_user WHERE username='demo_user');

INSERT INTO app_user (username, email, password_hash, first_name, last_name, preferred_language, time_zone)
SELECT 'andres.t','andres.t@example.com','demo-password-not-used','Andres','Tellez','es','America/Bogota'
WHERE NOT EXISTS (SELECT 1 FROM app_user WHERE username='andres.t');

-- Insertar predicciones de ejemplo (si no existen)
INSERT INTO user_prediction (user_id, tournament_id, fixture_id, predicted_home_score, predicted_away_score, predicted_winner_team_id, submitted_at, locked_at, is_locked)
SELECT (SELECT id FROM app_user WHERE username='demo_user'),
       (SELECT id FROM tournament WHERE code='WC2026'),
       (SELECT id FROM fixture WHERE name='Argentina vs Brasil' LIMIT 1),
       2, 1, (SELECT id FROM team WHERE name='Argentina'), NOW(), (SELECT prediction_locked_at FROM fixture WHERE name='Argentina vs Brasil'), FALSE
WHERE NOT EXISTS (
  SELECT 1 FROM user_prediction up JOIN app_user u ON up.user_id = u.id JOIN fixture f ON up.fixture_id = f.id
  WHERE u.username='demo_user' AND f.name='Argentina vs Brasil'
);

INSERT INTO user_prediction (user_id, tournament_id, fixture_id, predicted_home_score, predicted_away_score, predicted_winner_team_id, submitted_at, locked_at, is_locked)
SELECT (SELECT id FROM app_user WHERE username='andres.t'),
       (SELECT id FROM tournament WHERE code='WC2026'),
       (SELECT id FROM fixture WHERE name='España vs Alemania' LIMIT 1),
       1, 1, NULL, NOW(), (SELECT prediction_locked_at FROM fixture WHERE name='España vs Alemania'), FALSE
WHERE NOT EXISTS (
  SELECT 1 FROM user_prediction up JOIN app_user u ON up.user_id = u.id JOIN fixture f ON up.fixture_id = f.id
  WHERE u.username='andres.t' AND f.name='España vs Alemania'
);

-- Fin V6
