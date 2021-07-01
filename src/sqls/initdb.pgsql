-- Install modules
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users
(
    id              uuid    PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_id     VARCHAR(255),
    is_bot          BOOLEAN,
    first_name      VARCHAR(255),
    language_code   VARCHAR(10),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
)