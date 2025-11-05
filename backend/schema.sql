-- Users with unique username
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  active INTEGER NOT NULL DEFAULT 1,
  api_key_hash TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Endpoints with optional response schema
CREATE TABLE IF NOT EXISTS endpoints (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  method TEXT NOT NULL,
  response_json TEXT NOT NULL,
  is_public INTEGER NOT NULL DEFAULT 1,
  response_schema TEXT,
  validate_with_schema INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(owner_id) REFERENCES users(id),
  UNIQUE(owner_id, slug)
);
