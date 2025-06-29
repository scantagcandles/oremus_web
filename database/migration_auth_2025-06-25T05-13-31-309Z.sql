-- OREMUS Complete Database Schema
-- Generated from project analysis
-- Generated at: 2025-06-25T05:13:31.324Z
-- Total tables: 1

-- Required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- AUTH TABLES

-- Table: users (auth)
-- Source files: project-analysis, parish.ts, AuthService.ts
CREATE TABLE users (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  email_verified BOOLEAN NOT NULL DEFAULT false,
  two_factor_enabled BOOLEAN NOT NULL DEFAULT false,
  last_login TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
COMMENT ON TABLE users IS 'Category: auth. Sources: project-analysis, parish.ts, AuthService.ts';

-- FOREIGN KEY CONSTRAINTS

-- INDEXES

ALTER TABLE users ADD PRIMARY KEY (id);
CREATE INDEX idx_users_created_at ON users(created_at);

-- ROW LEVEL SECURITY

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON users

  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON users

  FOR UPDATE USING (id = auth.uid());

-- TRIGGERS

-- Function to automatically update timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_users
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
