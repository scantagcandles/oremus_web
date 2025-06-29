-- OREMUS Complete Database Schema
-- Generated from project analysis
-- Generated at: 2025-06-25T05:22:33.401Z
-- Total tables: 15

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

-- CORE TABLES

-- Table: organizations (core)
-- Source files: project-analysis, multi-tenant.ts, organizationService.ts
CREATE TABLE organizations (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  custom_domain TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  plan TEXT NOT NULL DEFAULT 'basic',
  contact_email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  nip TEXT,
  regon TEXT,
  settings JSONB NOT NULL DEFAULT '{}',
  branding JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
COMMENT ON TABLE organizations IS 'Category: core. Sources: project-analysis, multi-tenant.ts, organizationService.ts';

-- Table: memberships (core)
-- Source files: project-analysis, multi-tenant.ts
CREATE TABLE memberships (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  role TEXT NOT NULL,
  permissions JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active',
  invited_by UUID,
  invited_at TIMESTAMP,
  joined_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);
COMMENT ON TABLE memberships IS 'Category: core. Sources: project-analysis, multi-tenant.ts';

-- Table: churches (core)
-- Source files: project-analysis, church.ts, mass.ts, MassService.ts
CREATE TABLE churches (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT,
  country TEXT NOT NULL DEFAULT 'Poland',
  latitude DECIMAL,
  longitude DECIMAL,
  phone TEXT,
  email TEXT,
  website TEXT,
  masses_schedule JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
COMMENT ON TABLE churches IS 'Category: core. Sources: project-analysis, church.ts, mass.ts, MassService.ts';

-- BUSINESS TABLES

-- Table: payments (business)
-- Source files: project-analysis, payment.ts, PaymentService.ts, paymentService.ts, PaymentStatusService.ts
CREATE TABLE payments (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  organization_id UUID,
  stripe_payment_id TEXT,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'PLN',
  status TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
COMMENT ON TABLE payments IS 'Category: business. Sources: project-analysis, payment.ts, PaymentService.ts, paymentService.ts, PaymentStatusService.ts';

-- Table: mass_intentions (business)
-- Source files: project-analysis, mass-intention.ts, mass.ts, parish.ts, MassIntentionService.ts, useMassIntentions.ts, MassOrderingService.ts, MassService.ts, massIntentionService.ts
CREATE TABLE mass_intentions (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  church_id UUID,
  intention_text TEXT NOT NULL,
  mass_date TIMESTAMP NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_id UUID,
  priest_id UUID,
  amount INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
COMMENT ON TABLE mass_intentions IS 'Category: business. Sources: project-analysis, mass-intention.ts, mass.ts, parish.ts, MassIntentionService.ts, useMassIntentions.ts, MassOrderingService.ts, MassService.ts, massIntentionService.ts';

-- Table: oremus_candles (business)
-- Source files: project-analysis, candle.ts, CandleService.ts
CREATE TABLE oremus_candles (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  nfc_tag_id TEXT UNIQUE,
  user_id UUID NOT NULL,
  organization_id UUID,
  purchase_date TIMESTAMP NOT NULL,
  status TEXT NOT NULL,
  intention TEXT,
  duration_hours INTEGER NOT NULL DEFAULT 24,
  lit_at TIMESTAMP,
  extinguished_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);
COMMENT ON TABLE oremus_candles IS 'Category: business. Sources: project-analysis, candle.ts, CandleService.ts';

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

-- SYSTEM TABLES

-- Table: notifications (system)
-- Source files: project-analysis, notifications.ts, NotificationService.ts, NotificationTaskService.ts, notificationService.ts
CREATE TABLE notifications (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  read_at TIMESTAMP,
  sent_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);
COMMENT ON TABLE notifications IS 'Category: system. Sources: project-analysis, notifications.ts, NotificationService.ts, NotificationTaskService.ts, notificationService.ts';

-- FOREIGN KEY CONSTRAINTS

ALTER TABLE memberships ADD CONSTRAINT fk_memberships_user_id
  FOREIGN KEY (user_id) REFERENCES users(id)
  ON DELETE CASCADE;

ALTER TABLE memberships ADD CONSTRAINT fk_memberships_organization_id
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
  ON DELETE CASCADE;

ALTER TABLE memberships ADD CONSTRAINT fk_memberships_invited_by
  FOREIGN KEY (invited_by) REFERENCES users(id)
  ON DELETE CASCADE;

ALTER TABLE payments ADD CONSTRAINT fk_payments_user_id
  FOREIGN KEY (user_id) REFERENCES users(id)
  ON DELETE CASCADE;

ALTER TABLE payments ADD CONSTRAINT fk_payments_organization_id
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
  ON DELETE CASCADE;

ALTER TABLE mass_intentions ADD CONSTRAINT fk_mass_intentions_user_id
  FOREIGN KEY (user_id) REFERENCES users(id)
  ON DELETE CASCADE;

ALTER TABLE mass_intentions ADD CONSTRAINT fk_mass_intentions_organization_id
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
  ON DELETE CASCADE;

ALTER TABLE mass_intentions ADD CONSTRAINT fk_mass_intentions_church_id
  FOREIGN KEY (church_id) REFERENCES churches(id)
  ON DELETE CASCADE;

ALTER TABLE mass_intentions ADD CONSTRAINT fk_mass_intentions_payment_id
  FOREIGN KEY (payment_id) REFERENCES payments(id)
  ON DELETE CASCADE;

ALTER TABLE mass_intentions ADD CONSTRAINT fk_mass_intentions_priest_id
  FOREIGN KEY (priest_id) REFERENCES users(id)
  ON DELETE CASCADE;

ALTER TABLE oremus_candles ADD CONSTRAINT fk_oremus_candles_user_id
  FOREIGN KEY (user_id) REFERENCES users(id)
  ON DELETE CASCADE;

ALTER TABLE oremus_candles ADD CONSTRAINT fk_oremus_candles_organization_id
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
  ON DELETE CASCADE;

ALTER TABLE churches ADD CONSTRAINT fk_churches_organization_id
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
  ON DELETE CASCADE;

ALTER TABLE prayers ADD CONSTRAINT fk_prayers_created_by
  FOREIGN KEY (created_by) REFERENCES users(id)
  ON DELETE CASCADE;

ALTER TABLE user_prayers ADD CONSTRAINT fk_user_prayers_user_id
  FOREIGN KEY (user_id) REFERENCES users(id)
  ON DELETE CASCADE;

ALTER TABLE user_prayers ADD CONSTRAINT fk_user_prayers_prayer_id
  FOREIGN KEY (prayer_id) REFERENCES prayers(id)
  ON DELETE CASCADE;

ALTER TABLE courses ADD CONSTRAINT fk_courses_created_by
  FOREIGN KEY (created_by) REFERENCES users(id)
  ON DELETE CASCADE;

ALTER TABLE user_progress ADD CONSTRAINT fk_user_progress_user_id
  FOREIGN KEY (user_id) REFERENCES users(id)
  ON DELETE CASCADE;

ALTER TABLE user_progress ADD CONSTRAINT fk_user_progress_course_id
  FOREIGN KEY (course_id) REFERENCES courses(id)
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

ALTER TABLE notifications ADD CONSTRAINT fk_notifications_user_id
  FOREIGN KEY (user_id) REFERENCES users(id)
  ON DELETE CASCADE;

-- INDEXES

ALTER TABLE users ADD PRIMARY KEY (id);
CREATE INDEX idx_users_created_at ON users(created_at);

ALTER TABLE organizations ADD PRIMARY KEY (id);
CREATE INDEX idx_organizations_created_at ON organizations(created_at);

ALTER TABLE memberships ADD PRIMARY KEY (id);
CREATE INDEX idx_memberships_user_id ON memberships(user_id);
CREATE INDEX idx_memberships_organization_id ON memberships(organization_id);
CREATE INDEX idx_memberships_invited_by ON memberships(invited_by);
CREATE INDEX idx_memberships_created_at ON memberships(created_at);
CREATE INDEX idx_memberships_organization_id ON memberships(organization_id);
CREATE INDEX idx_memberships_user_id ON memberships(user_id);

ALTER TABLE payments ADD PRIMARY KEY (id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_organization_id ON payments(organization_id);
CREATE INDEX idx_payments_created_at ON payments(created_at);
CREATE INDEX idx_payments_organization_id ON payments(organization_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);

ALTER TABLE mass_intentions ADD PRIMARY KEY (id);
CREATE INDEX idx_mass_intentions_user_id ON mass_intentions(user_id);
CREATE INDEX idx_mass_intentions_organization_id ON mass_intentions(organization_id);
CREATE INDEX idx_mass_intentions_church_id ON mass_intentions(church_id);
CREATE INDEX idx_mass_intentions_payment_id ON mass_intentions(payment_id);
CREATE INDEX idx_mass_intentions_priest_id ON mass_intentions(priest_id);
CREATE INDEX idx_mass_intentions_created_at ON mass_intentions(created_at);
CREATE INDEX idx_mass_intentions_organization_id ON mass_intentions(organization_id);
CREATE INDEX idx_mass_intentions_user_id ON mass_intentions(user_id);

ALTER TABLE oremus_candles ADD PRIMARY KEY (id);
CREATE INDEX idx_oremus_candles_user_id ON oremus_candles(user_id);
CREATE INDEX idx_oremus_candles_organization_id ON oremus_candles(organization_id);
CREATE INDEX idx_oremus_candles_created_at ON oremus_candles(created_at);
CREATE INDEX idx_oremus_candles_organization_id ON oremus_candles(organization_id);
CREATE INDEX idx_oremus_candles_user_id ON oremus_candles(user_id);

ALTER TABLE churches ADD PRIMARY KEY (id);
CREATE INDEX idx_churches_organization_id ON churches(organization_id);
CREATE INDEX idx_churches_created_at ON churches(created_at);
CREATE INDEX idx_churches_organization_id ON churches(organization_id);

ALTER TABLE prayers ADD PRIMARY KEY (id);
CREATE INDEX idx_prayers_created_by ON prayers(created_by);
CREATE INDEX idx_prayers_created_at ON prayers(created_at);

ALTER TABLE user_prayers ADD PRIMARY KEY (id);
CREATE INDEX idx_user_prayers_user_id ON user_prayers(user_id);
CREATE INDEX idx_user_prayers_prayer_id ON user_prayers(prayer_id);
CREATE INDEX idx_user_prayers_created_at ON user_prayers(created_at);
CREATE INDEX idx_user_prayers_user_id ON user_prayers(user_id);

ALTER TABLE courses ADD PRIMARY KEY (id);
CREATE INDEX idx_courses_created_by ON courses(created_by);
CREATE INDEX idx_courses_created_at ON courses(created_at);

ALTER TABLE user_progress ADD PRIMARY KEY (id);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_course_id ON user_progress(course_id);
CREATE INDEX idx_user_progress_created_at ON user_progress(created_at);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);

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

ALTER TABLE notifications ADD PRIMARY KEY (id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- ROW LEVEL SECURITY

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON users

  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON users

  FOR UPDATE USING (id = auth.uid());

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organizations" ON organizations

  FOR SELECT USING (id IN (

    SELECT organization_id FROM memberships WHERE user_id = auth.uid()

  ));

ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own memberships" ON memberships

  FOR SELECT USING (user_id = auth.uid());

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own data in organization" ON payments

  FOR ALL USING (

    user_id = auth.uid() AND

    organization_id IN (

      SELECT organization_id FROM memberships WHERE user_id = auth.uid()

    )

  );

ALTER TABLE mass_intentions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own data in organization" ON mass_intentions

  FOR ALL USING (

    user_id = auth.uid() AND

    organization_id IN (

      SELECT organization_id FROM memberships WHERE user_id = auth.uid()

    )

  );

ALTER TABLE oremus_candles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own data in organization" ON oremus_candles

  FOR ALL USING (

    user_id = auth.uid() AND

    organization_id IN (

      SELECT organization_id FROM memberships WHERE user_id = auth.uid()

    )

  );

ALTER TABLE churches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access organization data" ON churches

  FOR ALL USING (

    organization_id IN (

      SELECT organization_id FROM memberships WHERE user_id = auth.uid()

    )

  );

ALTER TABLE prayers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can access" ON prayers

  FOR SELECT USING (auth.role() = 'authenticated');

ALTER TABLE user_prayers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own data" ON user_prayers

  FOR ALL USING (user_id = auth.uid());

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can access" ON courses

  FOR SELECT USING (auth.role() = 'authenticated');

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own data" ON user_progress

  FOR ALL USING (user_id = auth.uid());

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

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own data" ON notifications

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

CREATE TRIGGER set_timestamp_users
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_organizations
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_payments
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_mass_intentions
  BEFORE UPDATE ON mass_intentions
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_churches
  BEFORE UPDATE ON churches
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_prayers
  BEFORE UPDATE ON prayers
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_courses
  BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_community_posts
  BEFORE UPDATE ON community_posts
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
