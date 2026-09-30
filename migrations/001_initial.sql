BEGIN;
CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY, email text NOT NULL UNIQUE, name text NOT NULL,
  role text NOT NULL DEFAULT 'alumnus' CHECK (role IN ('alumnus','moderator','administrator')),
  verified boolean NOT NULL DEFAULT false, password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash text PRIMARY KEY, user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS programs (
  id text PRIMARY KEY, name text NOT NULL, short text NOT NULL
);
CREATE TABLE IF NOT EXISTS batches (
  year integer PRIMARY KEY CHECK (year BETWEEN 1900 AND 2100),
  theme text NOT NULL, subtitle text NOT NULL, cover_key text
);
CREATE TABLE IF NOT EXISTS alumni_profiles (
  id text PRIMARY KEY, user_id text NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  display_name text NOT NULL, graduation_year integer NOT NULL REFERENCES batches(year),
  program_id text NOT NULL REFERENCES programs(id), visibility text NOT NULL DEFAULT 'hidden'
    CHECK (visibility IN ('public','alumni','hidden')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','pending','published','rejected','archived')),
  search_name text GENERATED ALWAYS AS (lower(display_name)) STORED,
  data jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS profiles_directory_idx ON alumni_profiles (graduation_year, program_id, status, visibility);
CREATE INDEX IF NOT EXISTS profiles_search_idx ON alumni_profiles (search_name);
CREATE TABLE IF NOT EXISTS verification_requests (
  id text PRIMARY KEY, user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('draft','pending','published','rejected','archived')),
  data jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS memories (
  id text PRIMARY KEY, owner_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  graduation_year integer NOT NULL REFERENCES batches(year),
  visibility text NOT NULL CHECK (visibility IN ('public','alumni','hidden')),
  status text NOT NULL CHECK (status IN ('draft','pending','published','rejected','archived')),
  featured boolean NOT NULL DEFAULT false, data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS memories_feed_idx ON memories (graduation_year, status, visibility, created_at DESC);
CREATE TABLE IF NOT EXISTS photos (
  id text PRIMARY KEY, owner_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  object_key text NOT NULL UNIQUE, visibility text NOT NULL CHECK (visibility IN ('public','alumni','hidden')),
  status text NOT NULL CHECK (status IN ('draft','pending','published','rejected','archived')),
  data jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS reactions (
  memory_id text NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(memory_id,user_id)
);
CREATE TABLE IF NOT EXISTS comments (
  id text PRIMARY KEY, memory_id text NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('draft','pending','published','rejected','archived')),
  data jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS comments_review_idx ON comments (status, created_at DESC);
CREATE TABLE IF NOT EXISTS reports (
  id text PRIMARY KEY, reporter_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type text NOT NULL CHECK (target_type IN ('memory','comment','profile')),
  target_id text NOT NULL, status text NOT NULL CHECK (status IN ('open','resolved')),
  data jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS reports_status_idx ON reports (status, created_at DESC);
CREATE TABLE IF NOT EXISTS moderation_decisions (
  id text PRIMARY KEY, moderator_id text NOT NULL REFERENCES users(id),
  target_type text NOT NULL, target_id text NOT NULL, action text NOT NULL,
  note text NOT NULL DEFAULT '', created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS audit_events (
  id text PRIMARY KEY, actor_id text NOT NULL REFERENCES users(id), action text NOT NULL,
  target text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
COMMIT;

