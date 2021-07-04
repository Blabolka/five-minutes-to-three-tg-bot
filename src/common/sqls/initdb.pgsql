-- Install module for generating unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create an enum of user roles
CREATE TYPE role as ENUM ('student', 'group admin', 'admin');

-- Create an enum of available language codes (need to localisation in future)
CREATE TYPE langcode as ENUM ('ru', 'en');

CREATE TYPE week_day as ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');

CREATE TABLE users
(
    id              uuid    PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_id     INT UNIQUE,
    is_bot          BOOLEAN,
    first_name      VARCHAR(64),
    last_name       VARCHAR(64),
    username        VARCHAR(32),
    language_code   langcode DEFAULT 'ru',
    role            role,
    notifications   BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE subjects
(
    id              uuid    PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         uuid NOT NULL,
    title           VARCHAR(30),
    link            VARCHAR(100),
    week_day        week_day NOT NULL,
    time            TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
