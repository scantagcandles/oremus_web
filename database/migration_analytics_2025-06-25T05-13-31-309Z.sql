-- OREMUS Complete Database Schema
-- Generated from project analysis
-- Generated at: 2025-06-25T05:13:31.325Z
-- Total tables: 2

-- Required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ANALYTICS TABLES

-- Table: user_prayers (analytics)
-- Source files: project-analysis
CREATE TABLE user_prayers (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  prayer_id UUID NOT NULL,
  completed_at TIMESTAMP,
  streak_count INTEGER NOT NULL DEFAULT 0,
  last_prayed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);
COMMENT ON TABLE user_prayers IS 'Category: analytics. Sources: project-analysis';

-- Table: user_progress (analytics)
-- Source files: project-analysis
CREATE TABLE user_progress (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  course_id UUID NOT NULL,
  lesson_id UUID,
  completed BOOLEAN NOT NULL DEFAULT false,
  score INTEGER,
  time_spent_minutes INTEGER NOT NULL DEFAULT 0,
  last_accessed_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);
COMMENT ON TABLE user_progress IS 'Category: analytics. Sources: project-analysis';

-- FOREIGN KEY CONSTRAINTS

ALTER TABLE user_prayers ADD CONSTRAINT fk_user_prayers_user_id
  FOREIGN KEY (user_id) REFERENCES users(id)
  ON DELETE CASCADE;

ALTER TABLE user_prayers ADD CONSTRAINT fk_user_prayers_prayer_id
  FOREIGN KEY (prayer_id) REFERENCES prayers(id)
  ON DELETE CASCADE;

ALTER TABLE user_progress ADD CONSTRAINT fk_user_progress_user_id
  FOREIGN KEY (user_id) REFERENCES users(id)
  ON DELETE CASCADE;

ALTER TABLE user_progress ADD CONSTRAINT fk_user_progress_course_id
  FOREIGN KEY (course_id) REFERENCES courses(id)
  ON DELETE CASCADE;

-- INDEXES

ALTER TABLE user_prayers ADD PRIMARY KEY (id);
CREATE INDEX idx_user_prayers_user_id ON user_prayers(user_id);
CREATE INDEX idx_user_prayers_prayer_id ON user_prayers(prayer_id);
CREATE INDEX idx_user_prayers_created_at ON user_prayers(created_at);
CREATE INDEX idx_user_prayers_user_id ON user_prayers(user_id);

ALTER TABLE user_progress ADD PRIMARY KEY (id);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_course_id ON user_progress(course_id);
CREATE INDEX idx_user_progress_created_at ON user_progress(created_at);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);

-- ROW LEVEL SECURITY

ALTER TABLE user_prayers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own data" ON user_prayers

  FOR ALL USING (user_id = auth.uid());

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own data" ON user_progress

  FOR ALL USING (user_id = auth.uid());

-- TRIGGERS

-- Function to automatically update timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$ LANGUAGE plpgsql;
