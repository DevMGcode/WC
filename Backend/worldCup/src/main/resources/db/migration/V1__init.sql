-- =============================================================================
-- V1 — Initial schema and baseline data for Mundial 2026 Backend
-- =============================================================================
-- This file is a SQUASH of the original V1..V19 migration history. Generated
-- from a pg_dump of the running development database with everything in place:
--   schema + canonical seeds + API-Football synced data + demo fixtures +
--   group_standing initial rows (48) + recalculated standings.
--
-- What's inside:
--   * Extensions:        citext, pgcrypto
--   * Tables:            role, app_user, user_role, tournament, stage,
--                        group_stage, team, venue, fixture, user_prediction,
--                        group_standing, private_league, private_league_member,
--                        match_event, app_config
--   * Functions/Triggers: fn_block_prediction_update_if_locked (predictions lock)
--   * Seeds:             tournament WC2026, 6 stages (incl. TERCER_PUESTO),
--                        12 groups A-L, roles ADMIN/USER, admin user, 48 real
--                        teams synced from API-Football, 72 real fixtures,
--                        6 demo fixtures, 48 group_standing rows aligned with
--                        the real 2026 World Cup groups, recalculated standings
--                        reflecting the 3 demo FINISHED matches.
--
-- Re-runnable on a fresh database. NOT idempotent on an existing database --
-- to apply, drop the volume first (`docker compose down -v`).
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;


CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


CREATE FUNCTION fn_block_prediction_update_if_locked() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF OLD.locked_at <= NOW() THEN
        RAISE EXCEPTION 'La porra ya está bloqueada. locked_at=%', OLD.locked_at;
    END IF;
    RETURN NEW;
END;
$$;




CREATE TABLE app_config (
    id bigint NOT NULL,
    config_key character varying(100) NOT NULL,
    config_value text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


CREATE SEQUENCE app_config_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE app_config_id_seq OWNED BY app_config.id;


CREATE TABLE app_user (
    id bigint NOT NULL,
    username character varying(50) NOT NULL,
    email citext NOT NULL,
    password_hash character varying(255) NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    country_name character varying(120),
    country_code character varying(10),
    region_name character varying(120),
    department_name character varying(120),
    city_name character varying(120),
    phone_country_code character varying(10),
    phone_number character varying(30),
    preferred_language character varying(10) DEFAULT 'es'::character varying NOT NULL,
    time_zone character varying(100) DEFAULT 'UTC'::character varying NOT NULL,
    status character varying(20) DEFAULT 'ACTIVE'::character varying NOT NULL,
    email_verified boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    email_verification_token character varying(64)
);


CREATE SEQUENCE app_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE app_user_id_seq OWNED BY app_user.id;


CREATE TABLE fixture (
    id bigint NOT NULL,
    external_provider_id bigint,
    tournament_id bigint NOT NULL,
    stage_id bigint NOT NULL,
    group_stage_id bigint,
    venue_id bigint,
    home_team_id bigint NOT NULL,
    away_team_id bigint NOT NULL,
    name character varying(200) NOT NULL,
    kickoff_at timestamp with time zone NOT NULL,
    prediction_lock_minutes_before integer DEFAULT 5 NOT NULL,
    prediction_locked_at timestamp with time zone NOT NULL,
    status character varying(30) DEFAULT 'SCHEDULED'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    home_score integer,
    away_score integer,
    extra_minutes integer DEFAULT 0 NOT NULL
);


CREATE SEQUENCE fixture_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE fixture_id_seq OWNED BY fixture.id;


CREATE TABLE group_stage (
    id bigint NOT NULL,
    tournament_id bigint NOT NULL,
    code character varying(10) NOT NULL,
    name character varying(50) NOT NULL
);


CREATE SEQUENCE group_stage_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE group_stage_id_seq OWNED BY group_stage.id;


CREATE TABLE group_standing (
    id bigint NOT NULL,
    tournament_id bigint NOT NULL,
    group_stage_id bigint NOT NULL,
    team_id bigint NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    played integer DEFAULT 0 NOT NULL,
    won integer DEFAULT 0 NOT NULL,
    drawn integer DEFAULT 0 NOT NULL,
    lost integer DEFAULT 0 NOT NULL,
    goals_for integer DEFAULT 0 NOT NULL,
    goals_against integer DEFAULT 0 NOT NULL,
    points integer DEFAULT 0 NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


CREATE SEQUENCE group_standing_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE group_standing_id_seq OWNED BY group_standing.id;


CREATE TABLE match_event (
    id bigint NOT NULL,
    fixture_id bigint NOT NULL,
    player_name character varying(150) NOT NULL,
    team_id bigint,
    minute integer,
    event_type character varying(30) DEFAULT 'GOAL'::character varying NOT NULL,
    source character varying(20) DEFAULT 'MANUAL'::character varying NOT NULL,
    verified boolean DEFAULT false NOT NULL,
    api_player_name character varying(150),
    mismatch boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


CREATE SEQUENCE match_event_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE match_event_id_seq OWNED BY match_event.id;


CREATE TABLE private_league (
    id bigint NOT NULL,
    owner_user_id bigint NOT NULL,
    tournament_id bigint NOT NULL,
    name character varying(150) NOT NULL,
    code character varying(40) NOT NULL,
    description character varying(500),
    is_public boolean DEFAULT true NOT NULL,
    max_members integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


CREATE SEQUENCE private_league_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE private_league_id_seq OWNED BY private_league.id;


CREATE TABLE private_league_member (
    id bigint NOT NULL,
    league_id bigint NOT NULL,
    user_id bigint NOT NULL,
    role character varying(20) DEFAULT 'MEMBER'::character varying NOT NULL,
    joined_at timestamp with time zone DEFAULT now() NOT NULL
);


CREATE SEQUENCE private_league_member_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE private_league_member_id_seq OWNED BY private_league_member.id;


CREATE TABLE role (
    id bigint NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


CREATE SEQUENCE role_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE role_id_seq OWNED BY role.id;


CREATE TABLE stage (
    id bigint NOT NULL,
    tournament_id bigint NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(120) NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL
);


CREATE SEQUENCE stage_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE stage_id_seq OWNED BY stage.id;


CREATE TABLE team (
    id bigint NOT NULL,
    external_provider_id bigint,
    name character varying(120) NOT NULL,
    short_name character varying(80),
    fifa_code character varying(10),
    country_name character varying(120),
    flag_url character varying(500),
    status character varying(20) DEFAULT 'ACTIVE'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


CREATE SEQUENCE team_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE team_id_seq OWNED BY team.id;


CREATE TABLE tournament (
    id bigint NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(200) NOT NULL,
    host_countries character varying(255),
    starts_at timestamp with time zone,
    ends_at timestamp with time zone,
    status character varying(30) DEFAULT 'DRAFT'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


CREATE SEQUENCE tournament_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE tournament_id_seq OWNED BY tournament.id;


CREATE TABLE user_prediction (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    tournament_id bigint NOT NULL,
    fixture_id bigint NOT NULL,
    predicted_home_score integer NOT NULL,
    predicted_away_score integer NOT NULL,
    predicted_winner_team_id bigint,
    submitted_at timestamp with time zone DEFAULT now() NOT NULL,
    locked_at timestamp with time zone NOT NULL,
    is_locked boolean DEFAULT false NOT NULL,
    lock_reason character varying(50),
    version bigint DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


CREATE SEQUENCE user_prediction_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE user_prediction_id_seq OWNED BY user_prediction.id;


CREATE TABLE user_role (
    user_id bigint NOT NULL,
    role_id bigint NOT NULL
);


CREATE TABLE venue (
    id bigint NOT NULL,
    external_provider_id bigint,
    name character varying(150) NOT NULL,
    city_name character varying(120),
    country_name character varying(120),
    capacity integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


CREATE SEQUENCE venue_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE venue_id_seq OWNED BY venue.id;


ALTER TABLE ONLY app_config ALTER COLUMN id SET DEFAULT nextval('app_config_id_seq'::regclass);


ALTER TABLE ONLY app_user ALTER COLUMN id SET DEFAULT nextval('app_user_id_seq'::regclass);


ALTER TABLE ONLY fixture ALTER COLUMN id SET DEFAULT nextval('fixture_id_seq'::regclass);


ALTER TABLE ONLY group_stage ALTER COLUMN id SET DEFAULT nextval('group_stage_id_seq'::regclass);


ALTER TABLE ONLY group_standing ALTER COLUMN id SET DEFAULT nextval('group_standing_id_seq'::regclass);


ALTER TABLE ONLY match_event ALTER COLUMN id SET DEFAULT nextval('match_event_id_seq'::regclass);


ALTER TABLE ONLY private_league ALTER COLUMN id SET DEFAULT nextval('private_league_id_seq'::regclass);


ALTER TABLE ONLY private_league_member ALTER COLUMN id SET DEFAULT nextval('private_league_member_id_seq'::regclass);


ALTER TABLE ONLY role ALTER COLUMN id SET DEFAULT nextval('role_id_seq'::regclass);


ALTER TABLE ONLY stage ALTER COLUMN id SET DEFAULT nextval('stage_id_seq'::regclass);


ALTER TABLE ONLY team ALTER COLUMN id SET DEFAULT nextval('team_id_seq'::regclass);


ALTER TABLE ONLY tournament ALTER COLUMN id SET DEFAULT nextval('tournament_id_seq'::regclass);


ALTER TABLE ONLY user_prediction ALTER COLUMN id SET DEFAULT nextval('user_prediction_id_seq'::regclass);


ALTER TABLE ONLY venue ALTER COLUMN id SET DEFAULT nextval('venue_id_seq'::regclass);


-- Data for Name: app_config; Type: TABLE DATA; Schema: public; Owner: -
INSERT INTO app_config VALUES (1, 'football_data_api_key', NULL, '2026-05-26 15:00:13.985932+00');


-- Data for Name: app_user; Type: TABLE DATA; Schema: public; Owner: -
INSERT INTO app_user VALUES (1, 'melissa.bonilla', 'melissa.bonilla@example.com', '$2a$10$IB8mXRL.yQY6Ynj1kyWFj.nekPDMqaMhPdJsD/ffsU.RLs3od3fhW', 'Melisa', 'Bonilla', 'Colombia', 'CO', 'Pacifica', 'Valle del Cauca', 'Cali', '+57', '3225412641', 'es', 'America/Bogota', 'ACTIVE', true, '2026-05-26 14:58:12.871548+00', '2026-05-26 14:58:12.871548+00', NULL);
INSERT INTO app_user VALUES (2, 'admin', 'admin@example.com', '$2a$10$KeuXSTa8G3VNsAnXoXs9Ze9APPmqiEs/a3YuF//YJ7MFJjn87y.rK', 'Admin', 'Mundial', 'Colombia', 'CO', 'Andina', 'Bogota D.C.', 'Bogota', '+57', '3000000000', 'es', 'America/Bogota', 'ACTIVE', true, '2026-05-26 14:58:13.049725+00', '2026-05-26 14:58:13.049725+00', NULL);
INSERT INTO app_user VALUES (3, 'demo_user', 'demo_user@example.com', 'demo-password-not-used', 'Demo', 'User', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'es', 'UTC', 'ACTIVE', true, '2026-05-26 15:00:13.658156+00', '2026-05-26 15:00:13.658156+00', NULL);
INSERT INTO app_user VALUES (4, 'andres.t', 'andres.t@example.com', 'demo-password-not-used', 'Andres', 'Tellez', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'es', 'America/Bogota', 'ACTIVE', true, '2026-05-26 15:00:13.658156+00', '2026-05-26 15:00:13.658156+00', NULL);


-- Data for Name: fixture; Type: TABLE DATA; Schema: public; Owner: -
INSERT INTO fixture VALUES (57, 1489376, 2, 2, 10, NULL, 63, 43, 'Netherlands vs Japan', '2026-06-14 20:00:00+00', 5, '2026-06-14 19:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (58, 1489375, 2, 2, 9, NULL, 64, 75, 'Ivory Coast vs Ecuador', '2026-06-14 23:00:00+00', 5, '2026-06-14 22:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (59, 1539002, 2, 2, 10, NULL, 36, 54, 'Sweden vs Tunisia', '2026-06-15 02:00:00+00', 5, '2026-06-15 01:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (60, 1489380, 2, 2, 12, NULL, 40, 69, 'Spain vs Cape Verde Islands', '2026-06-15 16:00:00+00', 5, '2026-06-15 15:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (61, 1489377, 2, 2, 11, NULL, 33, 56, 'Belgium vs Egypt', '2026-06-15 19:00:00+00', 5, '2026-06-15 18:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (62, 1489379, 2, 2, 12, NULL, 50, 38, 'Saudi Arabia vs Uruguay', '2026-06-15 22:00:00+00', 5, '2026-06-15 21:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (63, 1489378, 2, 2, 11, NULL, 49, 78, 'Iran vs New Zealand', '2026-06-16 01:00:00+00', 5, '2026-06-16 00:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (64, 1489383, 2, 2, 13, NULL, 34, 44, 'France vs Senegal', '2026-06-16 19:00:00+00', 5, '2026-06-16 18:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (65, 1539016, 2, 2, 13, NULL, 71, 60, 'Iraq vs Norway', '2026-06-16 22:00:00+00', 5, '2026-06-16 21:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (66, 1489381, 2, 2, 14, NULL, 52, 68, 'Argentina vs Algeria', '2026-06-17 01:00:00+00', 5, '2026-06-17 00:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (67, 1489382, 2, 2, 14, NULL, 58, 70, 'Austria vs Jordan', '2026-06-17 04:00:00+00', 5, '2026-06-17 03:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (68, 1539003, 2, 2, 15, NULL, 53, 66, 'Portugal vs Congo DR', '2026-06-17 17:00:00+00', 5, '2026-06-17 16:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (69, 1489384, 2, 2, 16, NULL, 41, 35, 'England vs Croatia', '2026-06-17 20:00:00+00', 5, '2026-06-17 19:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (70, 1489385, 2, 2, 16, NULL, 65, 42, 'Ghana vs Panama', '2026-06-17 23:00:00+00', 5, '2026-06-17 22:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (71, 1489386, 2, 2, 15, NULL, 72, 39, 'Uzbekistan vs Colombia', '2026-06-18 02:00:00+00', 5, '2026-06-18 01:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (72, 1539004, 2, 2, 5, NULL, 57, 67, 'Czech Republic vs South Africa', '2026-06-18 16:00:00+00', 5, '2026-06-18 15:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (73, 1539005, 2, 2, 6, NULL, 45, 62, 'Switzerland vs Bosnia & Herzegovina', '2026-06-18 19:00:00+00', 5, '2026-06-18 18:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (74, 1489387, 2, 2, 6, NULL, 79, 73, 'Canada vs Qatar', '2026-06-18 22:00:00+00', 5, '2026-06-18 21:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (75, 1489388, 2, 2, 5, NULL, 46, 47, 'Mexico vs South Korea', '2026-06-19 01:00:00+00', 5, '2026-06-19 00:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (76, 1489391, 2, 2, 8, NULL, 76, 48, 'USA vs Australia', '2026-06-19 19:00:00+00', 5, '2026-06-19 18:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (77, 1489390, 2, 2, 7, NULL, 61, 55, 'Scotland vs Morocco', '2026-06-19 22:00:00+00', 5, '2026-06-19 21:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (78, 1489389, 2, 2, 7, NULL, 37, 77, 'Brazil vs Haiti', '2026-06-20 00:30:00+00', 5, '2026-06-20 00:25:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (79, 1539006, 2, 2, 8, NULL, 59, 74, 'Türkiye vs Paraguay', '2026-06-20 03:00:00+00', 5, '2026-06-20 02:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (80, 1539007, 2, 2, 10, NULL, 63, 36, 'Netherlands vs Sweden', '2026-06-20 17:00:00+00', 5, '2026-06-20 16:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (81, 1489393, 2, 2, 9, NULL, 51, 64, 'Germany vs Ivory Coast', '2026-06-20 20:00:00+00', 5, '2026-06-20 19:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (82, 1489392, 2, 2, 9, NULL, 75, 80, 'Ecuador vs Curaçao', '2026-06-21 00:00:00+00', 5, '2026-06-20 23:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (83, 1489394, 2, 2, 10, NULL, 54, 43, 'Tunisia vs Japan', '2026-06-21 04:00:00+00', 5, '2026-06-21 03:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (84, 1489397, 2, 2, 12, NULL, 40, 50, 'Spain vs Saudi Arabia', '2026-06-21 16:00:00+00', 5, '2026-06-21 15:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (85, 1489395, 2, 2, 11, NULL, 33, 49, 'Belgium vs Iran', '2026-06-21 19:00:00+00', 5, '2026-06-21 18:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (86, 1489398, 2, 2, 12, NULL, 38, 69, 'Uruguay vs Cape Verde Islands', '2026-06-21 22:00:00+00', 5, '2026-06-21 21:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (87, 1489396, 2, 2, 11, NULL, 78, 56, 'New Zealand vs Egypt', '2026-06-22 01:00:00+00', 5, '2026-06-22 00:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (88, 1489399, 2, 2, 14, NULL, 52, 58, 'Argentina vs Austria', '2026-06-22 17:00:00+00', 5, '2026-06-22 16:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (89, 1539017, 2, 2, 13, NULL, 34, 71, 'France vs Iraq', '2026-06-22 21:00:00+00', 5, '2026-06-22 20:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (90, 1489401, 2, 2, 13, NULL, 60, 44, 'Norway vs Senegal', '2026-06-23 00:00:00+00', 5, '2026-06-22 23:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (91, 1489400, 2, 2, 14, NULL, 70, 68, 'Jordan vs Algeria', '2026-06-23 03:00:00+00', 5, '2026-06-23 02:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (92, 1489404, 2, 2, 15, NULL, 53, 72, 'Portugal vs Uzbekistan', '2026-06-23 17:00:00+00', 5, '2026-06-23 16:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (93, 1489402, 2, 2, 16, NULL, 41, 65, 'England vs Ghana', '2026-06-23 20:00:00+00', 5, '2026-06-23 19:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (94, 1489403, 2, 2, 16, NULL, 42, 35, 'Panama vs Croatia', '2026-06-23 23:00:00+00', 5, '2026-06-23 22:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (95, 1539008, 2, 2, 15, NULL, 39, 66, 'Colombia vs Congo DR', '2026-06-24 02:00:00+00', 5, '2026-06-24 01:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (96, 1489408, 2, 2, 6, NULL, 45, 79, 'Switzerland vs Canada', '2026-06-24 19:00:00+00', 5, '2026-06-24 18:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (97, 1539009, 2, 2, 6, NULL, 62, 73, 'Bosnia & Herzegovina vs Qatar', '2026-06-24 19:00:00+00', 5, '2026-06-24 18:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (98, 1489405, 2, 2, 7, NULL, 55, 77, 'Morocco vs Haiti', '2026-06-24 22:00:00+00', 5, '2026-06-24 21:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (99, 1489406, 2, 2, 7, NULL, 61, 37, 'Scotland vs Brazil', '2026-06-24 22:00:00+00', 5, '2026-06-24 21:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (100, 1539010, 2, 2, 5, NULL, 57, 46, 'Czech Republic vs Mexico', '2026-06-25 01:00:00+00', 5, '2026-06-25 00:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (101, 1489407, 2, 2, 5, NULL, 67, 47, 'South Africa vs South Korea', '2026-06-25 01:00:00+00', 5, '2026-06-25 00:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (48, 1489369, 2, 2, 5, NULL, 46, 67, 'Mexico vs South Africa', '2026-06-11 19:00:00+00', 5, '2026-06-11 18:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (49, 1538999, 2, 2, 5, NULL, 47, 57, 'South Korea vs Czech Republic', '2026-06-12 02:00:00+00', 5, '2026-06-12 01:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (50, 1539000, 2, 2, 6, NULL, 79, 62, 'Canada vs Bosnia & Herzegovina', '2026-06-12 19:00:00+00', 5, '2026-06-12 18:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (51, 1489370, 2, 2, 8, NULL, 76, 74, 'USA vs Paraguay', '2026-06-13 01:00:00+00', 5, '2026-06-13 00:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (52, 1489373, 2, 2, 6, NULL, 73, 45, 'Qatar vs Switzerland', '2026-06-13 19:00:00+00', 5, '2026-06-13 18:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (53, 1489371, 2, 2, 7, NULL, 37, 55, 'Brazil vs Morocco', '2026-06-13 22:00:00+00', 5, '2026-06-13 21:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (54, 1489372, 2, 2, 7, NULL, 77, 61, 'Haiti vs Scotland', '2026-06-14 01:00:00+00', 5, '2026-06-14 00:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (55, 1539001, 2, 2, 8, NULL, 48, 59, 'Australia vs Türkiye', '2026-06-14 04:00:00+00', 5, '2026-06-14 03:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (56, 1489374, 2, 2, 9, NULL, 51, 80, 'Germany vs Curaçao', '2026-06-14 17:00:00+00', 5, '2026-06-14 16:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (102, 1489410, 2, 2, 9, NULL, 75, 51, 'Ecuador vs Germany', '2026-06-25 20:00:00+00', 5, '2026-06-25 19:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (103, 1489409, 2, 2, 9, NULL, 80, 64, 'Curaçao vs Ivory Coast', '2026-06-25 20:00:00+00', 5, '2026-06-25 19:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (120, NULL, 2, 2, 5, NULL, 46, 67, 'México vs Sudáfrica (DEMO)', '2026-05-23 16:10:40.698895+00', 5, '2026-05-23 16:05:40.698895+00', 'FINISHED', '2026-05-26 16:10:40.698895+00', '2026-05-26 16:10:40.698895+00', 2, 0, 0);
INSERT INTO fixture VALUES (121, NULL, 2, 2, 7, NULL, 37, 55, 'Brasil vs Marruecos (DEMO)', '2026-05-24 16:10:40.698895+00', 5, '2026-05-24 16:05:40.698895+00', 'FINISHED', '2026-05-26 16:10:40.698895+00', '2026-05-26 16:10:40.698895+00', 3, 1, 0);
INSERT INTO fixture VALUES (122, NULL, 2, 2, 14, NULL, 52, 68, 'Argentina vs Argelia (DEMO)', '2026-05-25 16:10:40.698895+00', 5, '2026-05-25 16:05:40.698895+00', 'FINISHED', '2026-05-26 16:10:40.698895+00', '2026-05-26 16:10:40.698895+00', 4, 0, 0);
INSERT INTO fixture VALUES (123, NULL, 2, 2, 12, NULL, 40, 69, 'España vs Cabo Verde (DEMO)', '2026-05-26 15:10:40.698895+00', 5, '2026-05-26 15:05:40.698895+00', 'LIVE', '2026-05-26 16:10:40.698895+00', '2026-05-26 16:10:40.698895+00', 2, 1, 0);
INSERT INTO fixture VALUES (124, NULL, 2, 2, 9, NULL, 51, 80, 'Alemania vs Curaçao (DEMO)', '2026-05-29 16:10:40.698895+00', 5, '2026-05-29 16:05:40.698895+00', 'SCHEDULED', '2026-05-26 16:10:40.698895+00', '2026-05-26 16:10:40.698895+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (125, NULL, 2, 2, 16, NULL, 41, 35, 'Inglaterra vs Croacia (DEMO)', '2026-05-31 16:10:40.698895+00', 5, '2026-05-31 16:05:40.698895+00', 'SCHEDULED', '2026-05-26 16:10:40.698895+00', '2026-05-26 16:10:40.698895+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (104, 1539011, 2, 2, 10, NULL, 43, 36, 'Japan vs Sweden', '2026-06-25 23:00:00+00', 5, '2026-06-25 22:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (105, 1489412, 2, 2, 10, NULL, 54, 63, 'Tunisia vs Netherlands', '2026-06-25 23:00:00+00', 5, '2026-06-25 22:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (106, 1539012, 2, 2, 8, NULL, 59, 76, 'Türkiye vs USA', '2026-06-26 02:00:00+00', 5, '2026-06-26 01:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (107, 1489411, 2, 2, 8, NULL, 74, 48, 'Paraguay vs Australia', '2026-06-26 02:00:00+00', 5, '2026-06-26 01:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (108, 1539074, 2, 2, 13, NULL, 44, 71, 'Senegal vs Iraq', '2026-06-26 19:00:00+00', 5, '2026-06-26 18:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (109, 1489416, 2, 2, 13, NULL, 60, 34, 'Norway vs France', '2026-06-26 19:00:00+00', 5, '2026-06-26 18:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (110, 1489417, 2, 2, 12, NULL, 38, 40, 'Uruguay vs Spain', '2026-06-27 00:00:00+00', 5, '2026-06-26 23:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (111, 1489413, 2, 2, 12, NULL, 69, 50, 'Cape Verde Islands vs Saudi Arabia', '2026-06-27 00:00:00+00', 5, '2026-06-26 23:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (112, 1489414, 2, 2, 11, NULL, 56, 49, 'Egypt vs Iran', '2026-06-27 03:00:00+00', 5, '2026-06-27 02:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (113, 1489415, 2, 2, 11, NULL, 78, 33, 'New Zealand vs Belgium', '2026-06-27 03:00:00+00', 5, '2026-06-27 02:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (114, 1489420, 2, 2, 16, NULL, 35, 65, 'Croatia vs Ghana', '2026-06-27 21:00:00+00', 5, '2026-06-27 20:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (115, 1489422, 2, 2, 16, NULL, 42, 41, 'Panama vs England', '2026-06-27 21:00:00+00', 5, '2026-06-27 20:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (116, 1489419, 2, 2, 15, NULL, 39, 53, 'Colombia vs Portugal', '2026-06-27 23:30:00+00', 5, '2026-06-27 23:25:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (117, 1539013, 2, 2, 15, NULL, 66, 72, 'Congo DR vs Uzbekistan', '2026-06-27 23:30:00+00', 5, '2026-06-27 23:25:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (118, 1489418, 2, 2, 14, NULL, 68, 58, 'Algeria vs Austria', '2026-06-28 02:00:00+00', 5, '2026-06-28 01:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);
INSERT INTO fixture VALUES (119, 1489421, 2, 2, 14, NULL, 70, 52, 'Jordan vs Argentina', '2026-06-28 02:00:00+00', 5, '2026-06-28 01:55:00+00', 'SCHEDULED', '2026-05-26 15:45:42.820344+00', '2026-05-26 15:45:42.820344+00', NULL, NULL, 0);


-- Data for Name: group_stage; Type: TABLE DATA; Schema: public; Owner: -
INSERT INTO group_stage VALUES (5, 2, 'A', 'Grupo A');
INSERT INTO group_stage VALUES (6, 2, 'B', 'Grupo B');
INSERT INTO group_stage VALUES (7, 2, 'C', 'Grupo C');
INSERT INTO group_stage VALUES (8, 2, 'D', 'Grupo D');
INSERT INTO group_stage VALUES (9, 2, 'E', 'Grupo E');
INSERT INTO group_stage VALUES (10, 2, 'F', 'Grupo F');
INSERT INTO group_stage VALUES (11, 2, 'G', 'Grupo G');
INSERT INTO group_stage VALUES (12, 2, 'H', 'Grupo H');
INSERT INTO group_stage VALUES (13, 2, 'I', 'Grupo I');
INSERT INTO group_stage VALUES (14, 2, 'J', 'Grupo J');
INSERT INTO group_stage VALUES (15, 2, 'K', 'Grupo K');
INSERT INTO group_stage VALUES (16, 2, 'L', 'Grupo L');


-- Data for Name: group_standing; Type: TABLE DATA; Schema: public; Owner: -
INSERT INTO group_standing VALUES (23, 2, 5, 47, 3, 0, 0, 0, 0, 0, 0, 0, '2026-05-26 16:47:20.547912+00');
INSERT INTO group_standing VALUES (24, 2, 5, 57, 4, 0, 0, 0, 0, 0, 0, 0, '2026-05-26 16:47:20.550784+00');
INSERT INTO group_standing VALUES (25, 2, 6, 79, 1, 0, 0, 0, 0, 0, 0, 0, '2026-05-26 16:47:20.553869+00');
INSERT INTO group_standing VALUES (26, 2, 6, 62, 2, 0, 0, 0, 0, 0, 0, 0, '2026-05-26 16:47:20.557064+00');
INSERT INTO group_standing VALUES (27, 2, 6, 73, 3, 0, 0, 0, 0, 0, 0, 0, '2026-05-26 16:47:20.558922+00');
INSERT INTO group_standing VALUES (28, 2, 6, 45, 4, 0, 0, 0, 0, 0, 0, 0, '2026-05-26 16:47:20.560767+00');
INSERT INTO group_standing VALUES (29, 2, 7, 77, 3, 0, 0, 0, 0, 0, 0, 0, '2026-05-26 16:47:20.563602+00');
INSERT INTO group_standing VALUES (30, 2, 7, 61, 4, 0, 0, 0, 0, 0, 0, 0, '2026-05-26 16:47:20.565286+00');
INSERT INTO group_standing VALUES (31, 2, 8, 76, 1, 0, 0, 0, 0, 0, 0, 0, '2026-05-26 16:47:20.566789+00');
INSERT INTO group_standing VALUES (32, 2, 8, 74, 2, 0, 0, 0, 0, 0, 0, 0, '2026-05-26 16:47:20.568212+00');
INSERT INTO group_standing VALUES (33, 2, 8, 48, 3, 0, 0, 0, 0, 0, 0, 0, '2026-05-26 16:47:20.569662+00');
INSERT INTO group_standing VALUES (34, 2, 8, 59, 4, 0, 0, 0, 0, 0, 0, 0, '2026-05-26 16:47:20.571103+00');
INSERT INTO group_standing VALUES (35, 2, 9, 51, 1, 0, 0, 0, 0, 0, 0, 0, '2026-05-26 16:47:20.572805+00');
INSERT INTO group_standing VALUES (36, 2, 9, 80, 2, 0, 0, 0, 0, 0, 0, 0, '2026-05-26 16:47:20.574175+00');
INSERT INTO group_standing VALUES (37, 2, 9, 64, 3, 0, 0, 0, 0, 0, 0, 0, '2026-05-26 16:47:20.575588+00');
INSERT INTO group_standing VALUES (38, 2, 9, 75, 4, 0, 0, 0, 0, 0, 0, 0, '2026-05-26 16:47:20.577076+00');
INSERT INTO group_standing VALUES (39, 2, 10, 63, 1, 0, 0, 0, 0, 0, 0, 0, '2026-05-26 16:47:20.578591+00');
INSERT INTO group_standing VALUES (40, 2, 10, 43, 2, 0, 0, 0, 0, 0, 0, 0, '2026-05-26 16:47:20.580078+00');
INSERT INTO group_standing VALUES (41, 2, 10, 36, 3, 0, 0, 0, 0, 0, 0, 0, '2026-05-26 16:47:20.581536+00');
INSERT INTO group_standing VALUES (42, 2, 10, 54, 4, 0, 0, 0, 0, 0, 0, 0, '2026-05-26 16:47:20.583002+00');
INSERT INTO group_standing VALUES (43, 2, 11, 33, 1, 0, 0, 0, 0, 0, 0, 0, '2026-05-26 16:47:20.584389+00');
INSERT INTO group_standing VALUES (44, 2, 11, 56, 2, 0, 0, 0, 0, 0, 0, 0, '2026-05-26 16:47:20.585831+00');
INSERT INTO group_standing VALUES (45, 2, 11, 49, 3, 0, 0, 0, 0, 0, 0, 0, '2026-05-26 16:47:20.58733+00');
INSERT INTO group_standing VALUES (46, 2, 11, 78, 4, 0, 0, 0, 0, 0, 0, 0, '2026-05-26 16:47:20.588665+00');
INSERT INTO group_standing VALUES (47, 2, 12, 40, 1, 0, 0, 0, 0, 0, 0, 0, '2026-05-26 16:47:20.590125+00');
INSERT INTO group_standing VALUES (48, 2, 12, 69, 2, 0, 0, 0, 0, 0, 0, 0, '2026-05-26 16:47:20.591344+00');
INSERT INTO group_standing VALUES (49, 2, 12, 50, 3, 0, 0, 0, 0, 0, 0, 0, '2026-05-26 16:47:20.592742+00');
INSERT INTO group_standing VALUES (50, 2, 12, 38, 4, 0, 0, 0, 0, 0, 0, 0, '2026-05-26 16:47:20.593992+00');
INSERT INTO group_standing VALUES (51, 2, 13, 34, 1, 0, 0, 0, 0, 0, 0, 0, '2026-05-26 16:47:20.595293+00');
INSERT INTO group_standing VALUES (52, 2, 13, 44, 2, 0, 0, 0, 0, 0, 0, 0, '2026-05-26 16:47:20.596799+00');
INSERT INTO group_standing VALUES (53, 2, 13, 71, 3, 0, 0, 0, 0, 0, 0, 0, '2026-05-26 16:47:20.598195+00');
INSERT INTO group_standing VALUES (54, 2, 13, 60, 4, 0, 0, 0, 0, 0, 0, 0, '2026-05-26 16:47:20.599653+00');
INSERT INTO group_standing VALUES (55, 2, 14, 58, 3, 0, 0, 0, 0, 0, 0, 0, '2026-05-26 16:47:20.602117+00');
INSERT INTO group_standing VALUES (56, 2, 14, 70, 4, 0, 0, 0, 0, 0, 0, 0, '2026-05-26 16:47:20.60389+00');
INSERT INTO group_standing VALUES (57, 2, 15, 53, 1, 0, 0, 0, 0, 0, 0, 0, '2026-05-26 16:47:20.605366+00');
INSERT INTO group_standing VALUES (58, 2, 15, 66, 2, 0, 0, 0, 0, 0, 0, 0, '2026-05-26 16:47:20.606717+00');
INSERT INTO group_standing VALUES (59, 2, 15, 72, 3, 0, 0, 0, 0, 0, 0, 0, '2026-05-26 16:47:20.608137+00');
INSERT INTO group_standing VALUES (60, 2, 15, 39, 4, 0, 0, 0, 0, 0, 0, 0, '2026-05-26 16:47:20.6095+00');
INSERT INTO group_standing VALUES (61, 2, 16, 41, 1, 0, 0, 0, 0, 0, 0, 0, '2026-05-26 16:47:20.611072+00');
INSERT INTO group_standing VALUES (62, 2, 16, 35, 2, 0, 0, 0, 0, 0, 0, 0, '2026-05-26 16:47:20.612771+00');
INSERT INTO group_standing VALUES (63, 2, 16, 65, 3, 0, 0, 0, 0, 0, 0, 0, '2026-05-26 16:47:20.614282+00');
INSERT INTO group_standing VALUES (64, 2, 16, 42, 4, 0, 0, 0, 0, 0, 0, 0, '2026-05-26 16:47:20.615632+00');
INSERT INTO group_standing VALUES (17, 2, 5, 46, 1, 1, 1, 0, 0, 2, 0, 3, '2026-05-26 16:49:41.315695+00');
INSERT INTO group_standing VALUES (18, 2, 5, 67, 2, 1, 0, 0, 1, 0, 2, 0, '2026-05-26 16:49:41.320599+00');
INSERT INTO group_standing VALUES (19, 2, 7, 37, 1, 1, 1, 0, 0, 3, 1, 3, '2026-05-26 16:49:41.333554+00');
INSERT INTO group_standing VALUES (20, 2, 7, 55, 2, 1, 0, 0, 1, 1, 3, 0, '2026-05-26 16:49:41.337673+00');
INSERT INTO group_standing VALUES (21, 2, 14, 52, 1, 1, 1, 0, 0, 4, 0, 3, '2026-05-26 16:49:41.375677+00');
INSERT INTO group_standing VALUES (22, 2, 14, 68, 2, 1, 0, 0, 1, 0, 4, 0, '2026-05-26 16:49:41.384286+00');


-- Data for Name: match_event; Type: TABLE DATA; Schema: public; Owner: -
-- Data for Name: private_league; Type: TABLE DATA; Schema: public; Owner: -
INSERT INTO private_league VALUES (1, 3, 2, 'Mi Oficina', 'OFICINA', 'Liga de desarrollo para validar el flujo completo', true, 20, '2026-05-26 15:00:13.723326+00', '2026-05-26 15:00:13.723326+00');
INSERT INTO private_league VALUES (2, 3, 2, 'Grupo de Amigos', 'AMIGOS', 'Liga privada de prueba', true, 10, '2026-05-26 15:00:13.723326+00', '2026-05-26 15:00:13.723326+00');


-- Data for Name: private_league_member; Type: TABLE DATA; Schema: public; Owner: -
INSERT INTO private_league_member VALUES (1, 1, 3, 'OWNER', '2026-05-26 15:00:13.723326+00');
INSERT INTO private_league_member VALUES (2, 1, 4, 'MEMBER', '2026-05-26 15:00:13.723326+00');
INSERT INTO private_league_member VALUES (3, 2, 3, 'OWNER', '2026-05-26 15:00:13.723326+00');
INSERT INTO private_league_member VALUES (4, 2, 4, 'MEMBER', '2026-05-26 15:00:13.723326+00');


-- Data for Name: role; Type: TABLE DATA; Schema: public; Owner: -
INSERT INTO role VALUES (1, 'ADMIN', 'Administrador', '2026-05-26 14:58:12.725924+00');
INSERT INTO role VALUES (2, 'USER', 'Usuario', '2026-05-26 14:58:12.725924+00');


-- Data for Name: stage; Type: TABLE DATA; Schema: public; Owner: -
INSERT INTO stage VALUES (2, 2, 'GROUPS', 'Fase de Grupos', 1);
INSERT INTO stage VALUES (3, 2, 'OCTAVOS', 'Octavos de Final', 2);
INSERT INTO stage VALUES (4, 2, 'CUARTOS', 'Cuartos de Final', 3);
INSERT INTO stage VALUES (5, 2, 'SEMIFINAL', 'Semifinales', 4);
INSERT INTO stage VALUES (6, 2, 'FINAL', 'Final', 5);
INSERT INTO stage VALUES (7, 2, 'TERCER_PUESTO', 'Tercer Puesto', 6);


-- Data for Name: team; Type: TABLE DATA; Schema: public; Owner: -
INSERT INTO team VALUES (33, 1, 'Belgium', 'BEL', 'BEL', 'Belgium', 'https://media.api-sports.io/football/teams/1.png', 'ACTIVE', '2026-05-26 15:36:47.507955+00', '2026-05-26 15:36:47.507955+00');
INSERT INTO team VALUES (34, 2, 'France', 'FRA', 'FRA', 'France', 'https://media.api-sports.io/football/teams/2.png', 'ACTIVE', '2026-05-26 15:36:47.507955+00', '2026-05-26 15:36:47.507955+00');
INSERT INTO team VALUES (35, 3, 'Croatia', 'CRO', 'CRO', 'Croatia', 'https://media.api-sports.io/football/teams/3.png', 'ACTIVE', '2026-05-26 15:36:47.507955+00', '2026-05-26 15:36:47.507955+00');
INSERT INTO team VALUES (36, 5, 'Sweden', 'SWE', 'SWE', 'Sweden', 'https://media.api-sports.io/football/teams/5.png', 'ACTIVE', '2026-05-26 15:36:47.507955+00', '2026-05-26 15:36:47.507955+00');
INSERT INTO team VALUES (37, 6, 'Brazil', 'BRA', 'BRA', 'Brazil', 'https://media.api-sports.io/football/teams/6.png', 'ACTIVE', '2026-05-26 15:36:47.507955+00', '2026-05-26 15:36:47.507955+00');
INSERT INTO team VALUES (38, 7, 'Uruguay', 'URU', 'URU', 'Uruguay', 'https://media.api-sports.io/football/teams/7.png', 'ACTIVE', '2026-05-26 15:36:47.507955+00', '2026-05-26 15:36:47.507955+00');
INSERT INTO team VALUES (39, 8, 'Colombia', 'COL', 'COL', 'Colombia', 'https://media.api-sports.io/football/teams/8.png', 'ACTIVE', '2026-05-26 15:36:47.507955+00', '2026-05-26 15:36:47.507955+00');
INSERT INTO team VALUES (40, 9, 'Spain', 'SPA', 'SPA', 'Spain', 'https://media.api-sports.io/football/teams/9.png', 'ACTIVE', '2026-05-26 15:36:47.507955+00', '2026-05-26 15:36:47.507955+00');
INSERT INTO team VALUES (41, 10, 'England', 'ENG', 'ENG', 'England', 'https://media.api-sports.io/football/teams/10.png', 'ACTIVE', '2026-05-26 15:36:47.507955+00', '2026-05-26 15:36:47.507955+00');
INSERT INTO team VALUES (42, 11, 'Panama', 'PAN', 'PAN', 'Panama', 'https://media.api-sports.io/football/teams/11.png', 'ACTIVE', '2026-05-26 15:36:47.507955+00', '2026-05-26 15:36:47.507955+00');
INSERT INTO team VALUES (43, 12, 'Japan', 'JAP', 'JAP', 'Japan', 'https://media.api-sports.io/football/teams/12.png', 'ACTIVE', '2026-05-26 15:36:47.507955+00', '2026-05-26 15:36:47.507955+00');
INSERT INTO team VALUES (44, 13, 'Senegal', 'SEN', 'SEN', 'Senegal', 'https://media.api-sports.io/football/teams/13.png', 'ACTIVE', '2026-05-26 15:36:47.507955+00', '2026-05-26 15:36:47.507955+00');
INSERT INTO team VALUES (45, 15, 'Switzerland', 'SWI', 'SWI', 'Switzerland', 'https://media.api-sports.io/football/teams/15.png', 'ACTIVE', '2026-05-26 15:36:47.507955+00', '2026-05-26 15:36:47.507955+00');
INSERT INTO team VALUES (46, 16, 'Mexico', 'MEX', 'MEX', 'Mexico', 'https://media.api-sports.io/football/teams/16.png', 'ACTIVE', '2026-05-26 15:36:47.507955+00', '2026-05-26 15:36:47.507955+00');
INSERT INTO team VALUES (47, 17, 'South Korea', 'KOR', 'KOR', 'South-Korea', 'https://media.api-sports.io/football/teams/17.png', 'ACTIVE', '2026-05-26 15:36:47.507955+00', '2026-05-26 15:36:47.507955+00');
INSERT INTO team VALUES (48, 20, 'Australia', 'AUS', 'AUS', 'Australia', 'https://media.api-sports.io/football/teams/20.png', 'ACTIVE', '2026-05-26 15:36:47.507955+00', '2026-05-26 15:36:47.507955+00');
INSERT INTO team VALUES (49, 22, 'Iran', 'IRA', 'IRA', 'Iran', 'https://media.api-sports.io/football/teams/22.png', 'ACTIVE', '2026-05-26 15:36:47.507955+00', '2026-05-26 15:36:47.507955+00');
INSERT INTO team VALUES (50, 23, 'Saudi Arabia', 'SAU', 'SAU', 'Saudi-Arabia', 'https://media.api-sports.io/football/teams/23.png', 'ACTIVE', '2026-05-26 15:36:47.507955+00', '2026-05-26 15:36:47.507955+00');
INSERT INTO team VALUES (51, 25, 'Germany', 'GER', 'GER', 'Germany', 'https://media.api-sports.io/football/teams/25.png', 'ACTIVE', '2026-05-26 15:36:47.507955+00', '2026-05-26 15:36:47.507955+00');
INSERT INTO team VALUES (52, 26, 'Argentina', 'ARG', 'ARG', 'Argentina', 'https://media.api-sports.io/football/teams/26.png', 'ACTIVE', '2026-05-26 15:36:47.507955+00', '2026-05-26 15:36:47.507955+00');
INSERT INTO team VALUES (53, 27, 'Portugal', 'POR', 'POR', 'Portugal', 'https://media.api-sports.io/football/teams/27.png', 'ACTIVE', '2026-05-26 15:36:47.507955+00', '2026-05-26 15:36:47.507955+00');
INSERT INTO team VALUES (54, 28, 'Tunisia', 'TUN', 'TUN', 'Tunisia', 'https://media.api-sports.io/football/teams/28.png', 'ACTIVE', '2026-05-26 15:36:47.507955+00', '2026-05-26 15:36:47.507955+00');
INSERT INTO team VALUES (55, 31, 'Morocco', 'MOR', 'MOR', 'Morocco', 'https://media.api-sports.io/football/teams/31.png', 'ACTIVE', '2026-05-26 15:36:47.507955+00', '2026-05-26 15:36:47.507955+00');
INSERT INTO team VALUES (56, 32, 'Egypt', 'EGY', 'EGY', 'Egypt', 'https://media.api-sports.io/football/teams/32.png', 'ACTIVE', '2026-05-26 15:36:47.507955+00', '2026-05-26 15:36:47.507955+00');
INSERT INTO team VALUES (57, 770, 'Czech Republic', 'CZE', 'CZE', 'Czech-Republic', 'https://media.api-sports.io/football/teams/770.png', 'ACTIVE', '2026-05-26 15:36:47.507955+00', '2026-05-26 15:36:47.507955+00');
INSERT INTO team VALUES (58, 775, 'Austria', 'AUS', 'AUS', 'Austria', 'https://media.api-sports.io/football/teams/775.png', 'ACTIVE', '2026-05-26 15:36:47.507955+00', '2026-05-26 15:36:47.507955+00');
INSERT INTO team VALUES (59, 777, 'Türkiye', 'TUR', 'TUR', 'Turkey', 'https://media.api-sports.io/football/teams/777.png', 'ACTIVE', '2026-05-26 15:36:47.507955+00', '2026-05-26 15:36:47.507955+00');
INSERT INTO team VALUES (60, 1090, 'Norway', 'NOR', 'NOR', 'Norway', 'https://media.api-sports.io/football/teams/1090.png', 'ACTIVE', '2026-05-26 15:36:47.507955+00', '2026-05-26 15:36:47.507955+00');
INSERT INTO team VALUES (61, 1108, 'Scotland', 'SCO', 'SCO', 'Scotland', 'https://media.api-sports.io/football/teams/1108.png', 'ACTIVE', '2026-05-26 15:36:47.507955+00', '2026-05-26 15:36:47.507955+00');
INSERT INTO team VALUES (62, 1113, 'Bosnia & Herzegovina', 'BOS', 'BOS', 'Bosnia', 'https://media.api-sports.io/football/teams/1113.png', 'ACTIVE', '2026-05-26 15:36:47.507955+00', '2026-05-26 15:36:47.507955+00');
INSERT INTO team VALUES (63, 1118, 'Netherlands', 'NET', 'NET', 'Netherlands', 'https://media.api-sports.io/football/teams/1118.png', 'ACTIVE', '2026-05-26 15:36:47.507955+00', '2026-05-26 15:36:47.507955+00');
INSERT INTO team VALUES (64, 1501, 'Ivory Coast', 'IVO', 'IVO', 'Ivory-Coast', 'https://media.api-sports.io/football/teams/1501.png', 'ACTIVE', '2026-05-26 15:36:47.507955+00', '2026-05-26 15:36:47.507955+00');
INSERT INTO team VALUES (65, 1504, 'Ghana', 'GHA', 'GHA', 'Ghana', 'https://media.api-sports.io/football/teams/1504.png', 'ACTIVE', '2026-05-26 15:36:47.507955+00', '2026-05-26 15:36:47.507955+00');
INSERT INTO team VALUES (66, 1508, 'Congo DR', 'CON', 'CON', 'Congo-DR', 'https://media.api-sports.io/football/teams/1508.png', 'ACTIVE', '2026-05-26 15:36:47.507955+00', '2026-05-26 15:36:47.507955+00');
INSERT INTO team VALUES (67, 1531, 'South Africa', 'SOU', 'SOU', 'South-Africa', 'https://media.api-sports.io/football/teams/1531.png', 'ACTIVE', '2026-05-26 15:36:47.507955+00', '2026-05-26 15:36:47.507955+00');
INSERT INTO team VALUES (68, 1532, 'Algeria', 'ALG', 'ALG', 'Algeria', 'https://media.api-sports.io/football/teams/1532.png', 'ACTIVE', '2026-05-26 15:36:47.507955+00', '2026-05-26 15:36:47.507955+00');
INSERT INTO team VALUES (69, 1533, 'Cape Verde Islands', 'CAP', 'CAP', 'Cape-Verde-Islands', 'https://media.api-sports.io/football/teams/1533.png', 'ACTIVE', '2026-05-26 15:36:47.507955+00', '2026-05-26 15:36:47.507955+00');
INSERT INTO team VALUES (70, 1548, 'Jordan', 'JOR', 'JOR', 'Jordan', 'https://media.api-sports.io/football/teams/1548.png', 'ACTIVE', '2026-05-26 15:36:47.507955+00', '2026-05-26 15:36:47.507955+00');
INSERT INTO team VALUES (71, 1567, 'Iraq', 'IRA', 'IRA', 'Iraq', 'https://media.api-sports.io/football/teams/1567.png', 'ACTIVE', '2026-05-26 15:36:47.507955+00', '2026-05-26 15:36:47.507955+00');
INSERT INTO team VALUES (72, 1568, 'Uzbekistan', 'UZB', 'UZB', 'Uzbekistan', 'https://media.api-sports.io/football/teams/1568.png', 'ACTIVE', '2026-05-26 15:36:47.507955+00', '2026-05-26 15:36:47.507955+00');
INSERT INTO team VALUES (73, 1569, 'Qatar', 'QAT', 'QAT', 'Qatar', 'https://media.api-sports.io/football/teams/1569.png', 'ACTIVE', '2026-05-26 15:36:47.507955+00', '2026-05-26 15:36:47.507955+00');
INSERT INTO team VALUES (74, 2380, 'Paraguay', 'PAR', 'PAR', 'Paraguay', 'https://media.api-sports.io/football/teams/2380.png', 'ACTIVE', '2026-05-26 15:36:47.507955+00', '2026-05-26 15:36:47.507955+00');
INSERT INTO team VALUES (75, 2382, 'Ecuador', 'ECU', 'ECU', 'Ecuador', 'https://media.api-sports.io/football/teams/2382.png', 'ACTIVE', '2026-05-26 15:36:47.507955+00', '2026-05-26 15:36:47.507955+00');
INSERT INTO team VALUES (76, 2384, 'USA', 'USA', 'USA', 'USA', 'https://media.api-sports.io/football/teams/2384.png', 'ACTIVE', '2026-05-26 15:36:47.507955+00', '2026-05-26 15:36:47.507955+00');
INSERT INTO team VALUES (77, 2386, 'Haiti', 'HAI', 'HAI', 'Haiti', 'https://media.api-sports.io/football/teams/2386.png', 'ACTIVE', '2026-05-26 15:36:47.507955+00', '2026-05-26 15:36:47.507955+00');
INSERT INTO team VALUES (78, 4673, 'New Zealand', 'ZEA', 'ZEA', 'New-Zealand', 'https://media.api-sports.io/football/teams/4673.png', 'ACTIVE', '2026-05-26 15:36:47.507955+00', '2026-05-26 15:36:47.507955+00');
INSERT INTO team VALUES (79, 5529, 'Canada', 'CAN', 'CAN', 'Canada', 'https://media.api-sports.io/football/teams/5529.png', 'ACTIVE', '2026-05-26 15:36:47.507955+00', '2026-05-26 15:36:47.507955+00');
INSERT INTO team VALUES (80, 5530, 'Curaçao', NULL, NULL, 'Curacao', 'https://media.api-sports.io/football/teams/5530.png', 'ACTIVE', '2026-05-26 15:36:47.507955+00', '2026-05-26 15:36:47.507955+00');


-- Data for Name: tournament; Type: TABLE DATA; Schema: public; Owner: -
INSERT INTO tournament VALUES (2, 'WC2026', 'World Cup 2026', 'USA,MEX,CAN', '2026-06-10 00:00:00+00', '2026-07-10 00:00:00+00', 'ACTIVE', '2026-05-26 15:00:13.658156+00', '2026-05-26 15:00:13.658156+00');


-- Data for Name: user_prediction; Type: TABLE DATA; Schema: public; Owner: -
INSERT INTO user_prediction VALUES (3, 2, 2, 124, 1, 1, NULL, '2026-05-26 16:41:16.41145+00', '2026-05-29 16:05:40.698895+00', false, NULL, 0, '2026-05-26 16:41:16.397545+00', '2026-05-26 16:41:16.397545+00');


-- Data for Name: user_role; Type: TABLE DATA; Schema: public; Owner: -
INSERT INTO user_role VALUES (1, 2);
INSERT INTO user_role VALUES (2, 1);


-- Data for Name: venue; Type: TABLE DATA; Schema: public; Owner: -
INSERT INTO venue VALUES (2, NULL, 'Estadio Demo', 'Ciudad Demo', 'Pais Demo', 50000, '2026-05-26 15:00:13.658156+00');


SELECT pg_catalog.setval('app_config_id_seq', 1, true);


SELECT pg_catalog.setval('app_user_id_seq', 4, true);


SELECT pg_catalog.setval('fixture_id_seq', 125, true);


SELECT pg_catalog.setval('group_stage_id_seq', 16, true);


SELECT pg_catalog.setval('group_standing_id_seq', 64, true);


SELECT pg_catalog.setval('match_event_id_seq', 1, false);


SELECT pg_catalog.setval('private_league_id_seq', 2, true);


SELECT pg_catalog.setval('private_league_member_id_seq', 4, true);


SELECT pg_catalog.setval('role_id_seq', 2, true);


SELECT pg_catalog.setval('stage_id_seq', 7, true);


SELECT pg_catalog.setval('team_id_seq', 80, true);


SELECT pg_catalog.setval('tournament_id_seq', 2, true);


SELECT pg_catalog.setval('user_prediction_id_seq', 3, true);


SELECT pg_catalog.setval('venue_id_seq', 2, true);


ALTER TABLE ONLY app_config
    ADD CONSTRAINT app_config_config_key_key UNIQUE (config_key);


ALTER TABLE ONLY app_config
    ADD CONSTRAINT app_config_pkey PRIMARY KEY (id);


ALTER TABLE ONLY app_user
    ADD CONSTRAINT app_user_email_key UNIQUE (email);


ALTER TABLE ONLY app_user
    ADD CONSTRAINT app_user_pkey PRIMARY KEY (id);


ALTER TABLE ONLY app_user
    ADD CONSTRAINT app_user_username_key UNIQUE (username);


ALTER TABLE ONLY fixture
    ADD CONSTRAINT fixture_external_provider_id_key UNIQUE (external_provider_id);


ALTER TABLE ONLY fixture
    ADD CONSTRAINT fixture_pkey PRIMARY KEY (id);


ALTER TABLE ONLY group_stage
    ADD CONSTRAINT group_stage_pkey PRIMARY KEY (id);


ALTER TABLE ONLY group_stage
    ADD CONSTRAINT group_stage_tournament_id_code_key UNIQUE (tournament_id, code);


ALTER TABLE ONLY group_standing
    ADD CONSTRAINT group_standing_pkey PRIMARY KEY (id);


ALTER TABLE ONLY match_event
    ADD CONSTRAINT match_event_pkey PRIMARY KEY (id);


ALTER TABLE ONLY private_league
    ADD CONSTRAINT private_league_code_key UNIQUE (code);


ALTER TABLE ONLY private_league_member
    ADD CONSTRAINT private_league_member_pkey PRIMARY KEY (id);


ALTER TABLE ONLY private_league
    ADD CONSTRAINT private_league_pkey PRIMARY KEY (id);


ALTER TABLE ONLY role
    ADD CONSTRAINT role_code_key UNIQUE (code);


ALTER TABLE ONLY role
    ADD CONSTRAINT role_pkey PRIMARY KEY (id);


ALTER TABLE ONLY stage
    ADD CONSTRAINT stage_pkey PRIMARY KEY (id);


ALTER TABLE ONLY stage
    ADD CONSTRAINT stage_tournament_id_code_key UNIQUE (tournament_id, code);


ALTER TABLE ONLY team
    ADD CONSTRAINT team_external_provider_id_key UNIQUE (external_provider_id);


ALTER TABLE ONLY team
    ADD CONSTRAINT team_pkey PRIMARY KEY (id);


ALTER TABLE ONLY tournament
    ADD CONSTRAINT tournament_code_key UNIQUE (code);


ALTER TABLE ONLY tournament
    ADD CONSTRAINT tournament_pkey PRIMARY KEY (id);


ALTER TABLE ONLY user_prediction
    ADD CONSTRAINT user_prediction_pkey PRIMARY KEY (id);


ALTER TABLE ONLY user_role
    ADD CONSTRAINT user_role_pkey PRIMARY KEY (user_id, role_id);


ALTER TABLE ONLY group_standing
    ADD CONSTRAINT ux_group_standing_group_team UNIQUE (group_stage_id, team_id);


ALTER TABLE ONLY private_league_member
    ADD CONSTRAINT ux_private_league_member UNIQUE (league_id, user_id);


ALTER TABLE ONLY user_prediction
    ADD CONSTRAINT ux_user_prediction_user_fixture UNIQUE (user_id, fixture_id);


ALTER TABLE ONLY venue
    ADD CONSTRAINT venue_external_provider_id_key UNIQUE (external_provider_id);


ALTER TABLE ONLY venue
    ADD CONSTRAINT venue_pkey PRIMARY KEY (id);


CREATE INDEX idx_match_event_fixture ON match_event USING btree (fixture_id);


CREATE INDEX idx_match_event_source ON match_event USING btree (source);


CREATE INDEX ix_private_league_member_league ON private_league_member USING btree (league_id);


CREATE INDEX ix_private_league_member_user ON private_league_member USING btree (user_id);


CREATE INDEX ix_private_league_tournament ON private_league USING btree (tournament_id);


CREATE INDEX ix_user_prediction_fixture_locked ON user_prediction USING btree (fixture_id, locked_at);


CREATE INDEX ix_user_prediction_locked_at ON user_prediction USING btree (locked_at);


CREATE TRIGGER trg_block_prediction_update_if_locked BEFORE UPDATE ON user_prediction FOR EACH ROW WHEN ((old.locked_at IS NOT NULL)) EXECUTE FUNCTION fn_block_prediction_update_if_locked();


ALTER TABLE ONLY fixture
    ADD CONSTRAINT fixture_away_team_id_fkey FOREIGN KEY (away_team_id) REFERENCES team(id) ON DELETE RESTRICT;


ALTER TABLE ONLY fixture
    ADD CONSTRAINT fixture_group_stage_id_fkey FOREIGN KEY (group_stage_id) REFERENCES group_stage(id) ON DELETE SET NULL;


ALTER TABLE ONLY fixture
    ADD CONSTRAINT fixture_home_team_id_fkey FOREIGN KEY (home_team_id) REFERENCES team(id) ON DELETE RESTRICT;


ALTER TABLE ONLY fixture
    ADD CONSTRAINT fixture_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES stage(id) ON DELETE RESTRICT;


ALTER TABLE ONLY fixture
    ADD CONSTRAINT fixture_tournament_id_fkey FOREIGN KEY (tournament_id) REFERENCES tournament(id) ON DELETE CASCADE;


ALTER TABLE ONLY fixture
    ADD CONSTRAINT fixture_venue_id_fkey FOREIGN KEY (venue_id) REFERENCES venue(id) ON DELETE SET NULL;


ALTER TABLE ONLY group_stage
    ADD CONSTRAINT group_stage_tournament_id_fkey FOREIGN KEY (tournament_id) REFERENCES tournament(id) ON DELETE CASCADE;


ALTER TABLE ONLY group_standing
    ADD CONSTRAINT group_standing_group_stage_id_fkey FOREIGN KEY (group_stage_id) REFERENCES group_stage(id) ON DELETE CASCADE;


ALTER TABLE ONLY group_standing
    ADD CONSTRAINT group_standing_team_id_fkey FOREIGN KEY (team_id) REFERENCES team(id) ON DELETE CASCADE;


ALTER TABLE ONLY group_standing
    ADD CONSTRAINT group_standing_tournament_id_fkey FOREIGN KEY (tournament_id) REFERENCES tournament(id) ON DELETE CASCADE;


ALTER TABLE ONLY match_event
    ADD CONSTRAINT match_event_fixture_id_fkey FOREIGN KEY (fixture_id) REFERENCES fixture(id) ON DELETE CASCADE;


ALTER TABLE ONLY match_event
    ADD CONSTRAINT match_event_team_id_fkey FOREIGN KEY (team_id) REFERENCES team(id);


ALTER TABLE ONLY private_league_member
    ADD CONSTRAINT private_league_member_league_id_fkey FOREIGN KEY (league_id) REFERENCES private_league(id) ON DELETE CASCADE;


ALTER TABLE ONLY private_league_member
    ADD CONSTRAINT private_league_member_user_id_fkey FOREIGN KEY (user_id) REFERENCES app_user(id) ON DELETE CASCADE;


ALTER TABLE ONLY private_league
    ADD CONSTRAINT private_league_owner_user_id_fkey FOREIGN KEY (owner_user_id) REFERENCES app_user(id) ON DELETE CASCADE;


ALTER TABLE ONLY private_league
    ADD CONSTRAINT private_league_tournament_id_fkey FOREIGN KEY (tournament_id) REFERENCES tournament(id) ON DELETE CASCADE;


ALTER TABLE ONLY stage
    ADD CONSTRAINT stage_tournament_id_fkey FOREIGN KEY (tournament_id) REFERENCES tournament(id) ON DELETE CASCADE;


ALTER TABLE ONLY user_prediction
    ADD CONSTRAINT user_prediction_fixture_id_fkey FOREIGN KEY (fixture_id) REFERENCES fixture(id) ON DELETE CASCADE;


ALTER TABLE ONLY user_prediction
    ADD CONSTRAINT user_prediction_predicted_winner_team_id_fkey FOREIGN KEY (predicted_winner_team_id) REFERENCES team(id) ON DELETE SET NULL;


ALTER TABLE ONLY user_prediction
    ADD CONSTRAINT user_prediction_tournament_id_fkey FOREIGN KEY (tournament_id) REFERENCES tournament(id) ON DELETE CASCADE;


ALTER TABLE ONLY user_prediction
    ADD CONSTRAINT user_prediction_user_id_fkey FOREIGN KEY (user_id) REFERENCES app_user(id) ON DELETE CASCADE;


ALTER TABLE ONLY user_role
    ADD CONSTRAINT user_role_role_id_fkey FOREIGN KEY (role_id) REFERENCES role(id) ON DELETE CASCADE;


ALTER TABLE ONLY user_role
    ADD CONSTRAINT user_role_user_id_fkey FOREIGN KEY (user_id) REFERENCES app_user(id) ON DELETE CASCADE;


