ALTER TABLE fixture
    ADD COLUMN IF NOT EXISTS home_score INTEGER,
    ADD COLUMN IF NOT EXISTS away_score INTEGER;

UPDATE fixture SET home_score = 3, away_score = 1 WHERE name = 'Argentina vs Brasil';
UPDATE fixture SET home_score = 2, away_score = 0 WHERE name = 'Colombia vs Uruguay';

CREATE TABLE IF NOT EXISTS private_league (
    id BIGSERIAL PRIMARY KEY,
    owner_user_id BIGINT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    tournament_id BIGINT NOT NULL REFERENCES tournament(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(40) NOT NULL UNIQUE,
    description VARCHAR(500),
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    max_members INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS private_league_member (
    id BIGSERIAL PRIMARY KEY,
    league_id BIGINT NOT NULL REFERENCES private_league(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'MEMBER',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT ux_private_league_member UNIQUE (league_id, user_id)
);

CREATE INDEX IF NOT EXISTS ix_private_league_tournament ON private_league (tournament_id);
CREATE INDEX IF NOT EXISTS ix_private_league_member_league ON private_league_member (league_id);
CREATE INDEX IF NOT EXISTS ix_private_league_member_user ON private_league_member (user_id);

INSERT INTO private_league (owner_user_id, tournament_id, name, code, description, is_public, max_members)
SELECT u.id, t.id, 'Mi Oficina', 'OFICINA', 'Liga de desarrollo para validar el flujo completo', TRUE, 20
FROM app_user u, tournament t
WHERE u.username = 'demo_user' AND t.code = 'WC2026'
  AND NOT EXISTS (SELECT 1 FROM private_league WHERE code = 'OFICINA');

INSERT INTO private_league (owner_user_id, tournament_id, name, code, description, is_public, max_members)
SELECT u.id, t.id, 'Grupo de Amigos', 'AMIGOS', 'Liga privada de prueba', TRUE, 10
FROM app_user u, tournament t
WHERE u.username = 'demo_user' AND t.code = 'WC2026'
  AND NOT EXISTS (SELECT 1 FROM private_league WHERE code = 'AMIGOS');

INSERT INTO private_league_member (league_id, user_id, role)
SELECT l.id, u.id, 'OWNER'
FROM private_league l
JOIN app_user u ON u.username = 'demo_user'
WHERE l.code = 'OFICINA'
  AND NOT EXISTS (
    SELECT 1 FROM private_league_member m WHERE m.league_id = l.id AND m.user_id = u.id
  );

INSERT INTO private_league_member (league_id, user_id, role)
SELECT l.id, u.id, 'MEMBER'
FROM private_league l
JOIN app_user u ON u.username = 'andres.t'
WHERE l.code = 'OFICINA'
  AND NOT EXISTS (
    SELECT 1 FROM private_league_member m WHERE m.league_id = l.id AND m.user_id = u.id
  );

INSERT INTO private_league_member (league_id, user_id, role)
SELECT l.id, u.id, 'OWNER'
FROM private_league l
JOIN app_user u ON u.username = 'demo_user'
WHERE l.code = 'AMIGOS'
  AND NOT EXISTS (
    SELECT 1 FROM private_league_member m WHERE m.league_id = l.id AND m.user_id = u.id
  );

INSERT INTO private_league_member (league_id, user_id, role)
SELECT l.id, u.id, 'MEMBER'
FROM private_league l
JOIN app_user u ON u.username = 'andres.t'
WHERE l.code = 'AMIGOS'
  AND NOT EXISTS (
    SELECT 1 FROM private_league_member m WHERE m.league_id = l.id AND m.user_id = u.id
  );