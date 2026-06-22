-- DevOpsQuest Database Schema for Cloudflare D1

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  provider TEXT NOT NULL CHECK (provider IN ('google', 'github')),
  provider_id TEXT NOT NULL,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak_days INTEGER DEFAULT 0,
  last_active TEXT,
  theme TEXT DEFAULT 'web-developer',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Progress table
CREATE TABLE IF NOT EXISTS progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  technology TEXT NOT NULL,
  topic TEXT NOT NULL,
  completed INTEGER DEFAULT 0 CHECK (completed IN (0, 1)),
  xp_earned INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0,
  completed_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  achievement_key TEXT NOT NULL,
  earned_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_technology ON progress(technology);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_users_xp ON users(xp DESC);
CREATE INDEX IF NOT EXISTS idx_users_streak ON users(streak_days DESC);

-- Insert initial demo user (for development only)
INSERT OR IGNORE INTO users (id, email, name, provider, provider_id, xp, level, streak_days, theme)
VALUES (
  'demo-user-001',
  'demo@devopsquest.dev',
  'Demo Learner',
  'google',
  'demo-google-001',
  1250,
  4,
  5,
  'web-developer'
);
