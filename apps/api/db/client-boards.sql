CREATE TABLE IF NOT EXISTS client_boards (
  owner_id text PRIMARY KEY,
  clients jsonb NOT NULL,
  revision integer NOT NULL DEFAULT 0,
  CHECK (jsonb_typeof(clients) = 'array')
);
