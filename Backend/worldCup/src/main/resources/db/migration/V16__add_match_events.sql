-- Tabla de eventos de partido (goles, etc.)
-- source: MANUAL = ingresado por el admin | API = sincronizado desde football-data.org
-- verified: true cuando el nombre del admin coincide con el de la API (o vino directo de la API)
-- mismatch: true cuando el admin escribió un nombre diferente al que devuelve la API

CREATE TABLE match_event (
    id            BIGSERIAL PRIMARY KEY,
    fixture_id    BIGINT        NOT NULL REFERENCES fixture(id) ON DELETE CASCADE,
    player_name   VARCHAR(150)  NOT NULL,
    team_id       BIGINT        REFERENCES team(id),
    minute        INTEGER,
    event_type    VARCHAR(30)   NOT NULL DEFAULT 'GOAL',
    source        VARCHAR(20)   NOT NULL DEFAULT 'MANUAL',
    verified      BOOLEAN       NOT NULL DEFAULT FALSE,
    api_player_name VARCHAR(150),
    mismatch      BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_match_event_fixture ON match_event(fixture_id);
CREATE INDEX idx_match_event_source  ON match_event(source);
