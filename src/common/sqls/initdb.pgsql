-- Install module for generating unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create an enum of user roles
CREATE TYPE role as ENUM ('student', 'group admin', 'admin');

CREATE TYPE week_day as ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');

CREATE TABLE users
(
    id              uuid    PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_id     INT UNIQUE,
    is_bot          BOOLEAN,
    first_name      VARCHAR(64),
    last_name       VARCHAR(64),
    username        VARCHAR(32),
    language_code   VARCHAR(4) DEFAULT 'ru',
    role            role,
    notifications   BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE subjects
(
    id              uuid    PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         uuid NOT NULL,
    title           VARCHAR(30),
    week_day        week_day NOT NULL,
    time            TIMESTAMPTZ NOT NULL,
    link            VARCHAR(100),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
