CREATE TABLE IF NOT EXISTS scope_reviews (
  token_hash text PRIMARY KEY,
  owner_id text NOT NULL,
  project text NOT NULL,
  proposal jsonb NOT NULL,
  choice text CHECK (choice IN ('swap', 'add')),
  decided_at timestamptz,
  CHECK ((choice IS NULL) = (decided_at IS NULL))
);

ALTER TABLE scope_reviews ADD COLUMN IF NOT EXISTS revoked boolean NOT NULL DEFAULT false;
