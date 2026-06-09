export const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  wallet        TEXT UNIQUE NOT NULL,
  display_name  TEXT,
  tier          TEXT NOT NULL DEFAULT 'free',
  paid_demo_at  TIMESTAMPTZ,
  paid_life_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agents (
  id              SERIAL PRIMARY KEY,
  owner_wallet    TEXT NOT NULL,
  agent_id        TEXT UNIQUE NOT NULL,
  api_key_hash    TEXT NOT NULL,
  agent_wallet    TEXT UNIQUE NOT NULL,
  agent_name      TEXT NOT NULL,
  avatar_seed     TEXT NOT NULL,
  registered_via  TEXT NOT NULL DEFAULT 'web',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at    TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS scores (
  id            SERIAL PRIMARY KEY,
  actor_kind    TEXT NOT NULL,
  actor_wallet  TEXT NOT NULL,
  display_name  TEXT NOT NULL,
  gold          BIGINT NOT NULL DEFAULT 0,
  kills         INT NOT NULL DEFAULT 0,
  resources     INT NOT NULL DEFAULT 0,
  combat_skill  INT NOT NULL DEFAULT 0,
  gather_skill  INT NOT NULL DEFAULT 0,
  score_total   BIGINT GENERATED ALWAYS AS (gold + (kills::BIGINT * 25) + (resources::BIGINT * 5)) STORED,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(actor_wallet)
);

CREATE INDEX IF NOT EXISTS scores_total_idx ON scores (score_total DESC);

CREATE TABLE IF NOT EXISTS payments (
  id            SERIAL PRIMARY KEY,
  wallet        TEXT NOT NULL,
  tx_signature  TEXT UNIQUE NOT NULL,
  amount_sol    NUMERIC(18,9) NOT NULL,
  tier          TEXT NOT NULL,
  verified_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS airdrops (
  id            SERIAL PRIMARY KEY,
  wallet        TEXT NOT NULL,
  amount_ui     NUMERIC(20,6) NOT NULL,
  rank          INT NOT NULL,
  reason        TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS airdrops_wallet_idx ON airdrops (wallet);
`;
