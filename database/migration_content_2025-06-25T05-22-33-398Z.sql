-- OREMUS Complete Database Schema
-- Generated from project analysis
-- Generated at: 2025-06-25T05:22:33.412Z
-- Total tables: 5

-- Required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CONTENT TABLES

-- Table: prayers (content)
-- Source files: project-analysis
CREATE TABLE prayers (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  audio_url TEXT,
  duration INTEGER,
  category TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'pl',
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
COMMENT ON TABLE prayers IS 'Category: content. Sources: project-analysis';

-- Table: courses (content)
-- Source files: project-analysis, CourseMetrics.tsx, academyService.ts
CREATE TABLE courses (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  lessons_count INTEGER NOT NULL DEFAULT 0,
  price INTEGER NOT NULL DEFAULT 0,
  difficulty_level TEXT NOT NULL DEFAULT 'beginner',
  duration_minutes INTEGER,
  thumbnail_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
COMMENT ON TABLE courses IS 'Category: content. Sources: project-analysis, CourseMetrics.tsx, academyService.ts';

-- Table: quizzes (content)
-- Source files: project-analysis
CREATE TABLE quizzes (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL,
  questions JSONB NOT NULL,
  correct_answers JSONB NOT NULL,
  passing_score INTEGER NOT NULL DEFAULT 70,
  time_limit_minutes INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);
COMMENT ON TABLE quizzes IS 'Category: content. Sources: project-analysis';

-- Table: community_posts (content)
-- Source files: project-analysis
CREATE TABLE community_posts (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  organization_id UUID,
  content TEXT NOT NULL,
  type TEXT NOT NULL,
  prayer_request BOOLEAN NOT NULL DEFAULT false,
  anonymous BOOLEAN NOT NULL DEFAULT false,
  is_public BOOLEAN NOT NULL DEFAULT true,
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
COMMENT ON TABLE community_posts IS 'Category: content. Sources: project-analysis';

-- Table: prayer_requests (content)
-- Source files: project-analysis
CREATE TABLE prayer_requests (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  organization_id UUID,
  request_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  response_count INTEGER NOT NULL DEFAULT 0,
  anonymous BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);
COMMENT ON TABLE prayer_requests IS 'Category: content. Sources: project-analysis';

-- FOREIGN KEY CONSTRAINTS

ALTER TABLE prayers ADD CONSTRAINT fk_prayers_created_by
  FOREIGN KEY (created_by) REFERENCES users(id)
  ON DELETE CASCADE;

ALTER TABLE courses ADD CONSTRAINT fk_courses_created_by
  FOREIGN KEY (created_by) REFERENCES users(id)
  ON DELETE CASCADE;

ALTER TABLE quizzes ADD CONSTRAINT fk_quizzes_course_id
  FOREIGN KEY (course_id) REFERENCES courses(id)
  ON DELETE CASCADE;

ALTER TABLE community_posts ADD CONSTRAINT fk_community_posts_user_id
  FOREIGN KEY (user_id) REFERENCES users(id)
  ON DELETE CASCADE;

ALTER TABLE community_posts ADD CONSTRAINT fk_community_posts_organization_id
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
  ON DELETE CASCADE;

ALTER TABLE prayer_requests ADD CONSTRAINT fk_prayer_requests_user_id
  FOREIGN KEY (user_id) REFERENCES users(id)
  ON DELETE CASCADE;

ALTER TABLE prayer_requests ADD CONSTRAINT fk_prayer_requests_organization_id
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
  ON DELETE CASCADE;

-- INDEXES

ALTER TABLE prayers ADD PRIMARY KEY (id);
CREATE INDEX idx_prayers_created_by ON prayers(created_by);
CREATE INDEX idx_prayers_created_at ON prayers(created_at);

ALTER TABLE courses ADD PRIMARY KEY (id);
CREATE INDEX idx_courses_created_by ON courses(created_by);
CREATE INDEX idx_courses_created_at ON courses(created_at);

ALTER TABLE quizzes ADD PRIMARY KEY (id);
CREATE INDEX idx_quizzes_course_id ON quizzes(course_id);
CREATE INDEX idx_quizzes_created_at ON quizzes(created_at);

ALTER TABLE community_posts ADD PRIMARY KEY (id);
CREATE INDEX idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX idx_community_posts_organization_id ON community_posts(organization_id);
CREATE INDEX idx_community_posts_created_at ON community_posts(created_at);
CREATE INDEX idx_community_posts_organization_id ON community_posts(organization_id);
CREATE INDEX idx_community_posts_user_id ON community_posts(user_id);

ALTER TABLE prayer_requests ADD PRIMARY KEY (id);
CREATE INDEX idx_prayer_requests_user_id ON prayer_requests(user_id);
CREATE INDEX idx_prayer_requests_organization_id ON prayer_requests(organization_id);
CREATE INDEX idx_prayer_requests_created_at ON prayer_requests(created_at);
CREATE INDEX idx_prayer_requests_organization_id ON prayer_requests(organization_id);
CREATE INDEX idx_prayer_requests_user_id ON prayer_requests(user_id);

-- ROW LEVEL SECURITY

ALTER TABLE prayers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can access" ON prayers

  FOR SELECT USING (auth.role() = 'authenticated');

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can access" ON courses

  FOR SELECT USING (auth.role() = 'authenticated');

ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can access" ON quizzes

  FOR SELECT USING (auth.role() = 'authenticated');

ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own data in organization" ON community_posts

  FOR ALL USING (

    user_id = auth.uid() AND

    organization_id IN (

      SELECT organization_id FROM memberships WHERE user_id = auth.uid()

    )

  );

ALTER TABLE prayer_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own data in organization" ON prayer_requests

  FOR ALL USING (

    user_id = auth.uid() AND

    organization_id IN (

      SELECT organization_id FROM memberships WHERE user_id = auth.uid()

    )

  );

-- TRIGGERS

-- Function to automatically update timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_prayers
  BEFORE UPDATE ON prayers
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_courses
  BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_community_posts
  BEFORE UPDATE ON community_posts
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
