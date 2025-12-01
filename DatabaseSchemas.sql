CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    username varchar(32) UNIQUE NOT NULL,
    name varchar(64) NOT NULL,
    password bytea NOT NULL
);

CREATE TABLE sessions (
    id varchar(32) PRIMARY KEY,
    secret_hash bytea NOT NULL,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at timestamp without time zone NOT NULL
);

CREATE TABLE stocks (
    symbol varchar(16) PRIMARY KEY,
    name varchar(128) NOT NULL
);

CREATE TABLE watchlists (
    stock varchar(16) NOT NULL REFERENCES stocks(symbol) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (stock, user_id)
);