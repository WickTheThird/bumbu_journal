-- ============================================================
-- HashIDEA D1 Schema — run these migrations in the Cloudflare
-- dashboard under D1 → hashidea-db → Console
-- ============================================================

-- ── Original tables (already created) ───────────────────────
-- Included here for reference. Do NOT re-run if already exists.

-- CREATE TABLE IF NOT EXISTS users (
--   id TEXT PRIMARY KEY,
--   github_id INTEGER UNIQUE NOT NULL,
--   username TEXT NOT NULL,
--   avatar_url TEXT,
--   created_at TEXT DEFAULT (datetime('now'))
-- );

-- CREATE TABLE IF NOT EXISTS projects (
--   id TEXT PRIMARY KEY,
--   owner_id TEXT,
--   title TEXT NOT NULL DEFAULT 'Untitled',
--   description TEXT,
--   is_public INTEGER DEFAULT 1,
--   view_count INTEGER DEFAULT 0,
--   remix_from TEXT,
--   created_at TEXT DEFAULT (datetime('now')),
--   updated_at TEXT DEFAULT (datetime('now'))
-- );

-- CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
-- CREATE INDEX IF NOT EXISTS idx_projects_public ON projects(is_public, created_at);

-- ── Billing migration (run these) ───────────────────────────

ALTER TABLE users ADD COLUMN plan TEXT DEFAULT 'free';
ALTER TABLE users ADD COLUMN stripe_customer_id TEXT;
ALTER TABLE users ADD COLUMN email TEXT;

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  plan TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TEXT,
  current_period_end TEXT,
  cancel_at_period_end INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_users_stripe ON users(stripe_customer_id);
