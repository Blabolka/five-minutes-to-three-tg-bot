-- Install modules
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create an enum of user roles
CREATE TYPE role as ENUM ('student', 'group admin', 'admin');

-- Create an enum of available language codes
CREATE TYPE langcode as ENUM ('ru', 'en');

CREATE TABLE users
(
    id              uuid    PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_id     INT UNIQUE,
    is_bot          BOOLEAN,
    first_name      VARCHAR(255),
    last_name       VARCHAR(255),
    username        VARCHAR(255),
    language_code   langcode DEFAULT 'ru',
    role            role,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
)