CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE role (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE app_user (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email CITEXT NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    country_name VARCHAR(120),
    country_code VARCHAR(10),
    region_name VARCHAR(120),
    department_name VARCHAR(120),
    city_name VARCHAR(120),
    phone_country_code VARCHAR(10),
    phone_number VARCHAR(30),
    preferred_language VARCHAR(10) NOT NULL DEFAULT 'es',
    time_zone VARCHAR(100) NOT NULL DEFAULT 'UTC',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_role (
    user_id BIGINT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES role(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE tournament (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    host_countries VARCHAR(255),
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE stage (
    id BIGSERIAL PRIMARY KEY,
    tournament_id BIGINT NOT NULL REFERENCES tournament(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(120) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    UNIQUE (tournament_id, code)
);

CREATE TABLE group_stage (
    id BIGSERIAL PRIMARY KEY,
    tournament_id BIGINT NOT NULL REFERENCES tournament(id) ON DELETE CASCADE,
    code VARCHAR(10) NOT NULL,
    name VARCHAR(50) NOT NULL,
    UNIQUE (tournament_id, code)
);

CREATE TABLE team (
    id BIGSERIAL PRIMARY KEY,
    external_provider_id BIGINT UNIQUE,
    name VARCHAR(120) NOT NULL,
    short_name VARCHAR(80),
    fifa_code VARCHAR(10) UNIQUE,
    country_name VARCHAR(120),
    flag_url VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE venue (
    id BIGSERIAL PRIMARY KEY,
    external_provider_id BIGINT UNIQUE,
    name VARCHAR(150) NOT NULL,
    city_name VARCHAR(120),
    country_name VARCHAR(120),
    capacity INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE fixture (
    id BIGSERIAL PRIMARY KEY,
    external_provider_id BIGINT UNIQUE,
    tournament_id BIGINT NOT NULL REFERENCES tournament(id) ON DELETE CASCADE,
    stage_id BIGINT NOT NULL REFERENCES stage(id) ON DELETE RESTRICT,
    group_stage_id BIGINT REFERENCES group_stage(id) ON DELETE SET NULL,
    venue_id BIGINT REFERENCES venue(id) ON DELETE SET NULL,
    home_team_id BIGINT NOT NULL REFERENCES team(id) ON DELETE RESTRICT,
    away_team_id BIGINT NOT NULL REFERENCES team(id) ON DELETE RESTRICT,
    name VARCHAR(200) NOT NULL,
    kickoff_at TIMESTAMPTZ NOT NULL,
    prediction_lock_minutes_before INTEGER NOT NULL DEFAULT 5,
    prediction_locked_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_prediction (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    tournament_id BIGINT NOT NULL REFERENCES tournament(id) ON DELETE CASCADE,
    fixture_id BIGINT NOT NULL REFERENCES fixture(id) ON DELETE CASCADE,
    predicted_home_score INTEGER NOT NULL,
    predicted_away_score INTEGER NOT NULL,
    predicted_winner_team_id BIGINT REFERENCES team(id) ON DELETE SET NULL,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    locked_at TIMESTAMPTZ NOT NULL,
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    lock_reason VARCHAR(50),
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT ux_user_prediction_user_fixture UNIQUE (user_id, fixture_id)
);

CREATE INDEX ix_user_prediction_locked_at ON user_prediction (locked_at);
CREATE INDEX ix_user_prediction_fixture_locked ON user_prediction (fixture_id, locked_at);

CREATE OR REPLACE FUNCTION fn_block_prediction_update_if_locked()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.locked_at <= NOW() THEN
        RAISE EXCEPTION 'La porra ya está bloqueada. locked_at=%', OLD.locked_at;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_block_prediction_update_if_locked
BEFORE UPDATE ON user_prediction
FOR EACH ROW
WHEN (OLD.locked_at IS NOT NULL)
EXECUTE FUNCTION fn_block_prediction_update_if_locked();

INSERT INTO role (code, name) VALUES
('ADMIN', 'Administrador'),
('USER', 'Usuario');
