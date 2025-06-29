-- Oremus Database Schema
-- This file contains the complete database schema for the Oremus application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types (enums)
CREATE TYPE mass_type AS ENUM ('regular', 'requiem', 'thanksgiving', 'gregorian', 'wedding', 'funeral', 'first_communion');
CREATE TYPE mass_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE mass_intention_status AS ENUM ('pending_payment', 'paid', 'rejected', 'cancelled', 'completed', 'scheduled', 'payment_failed', 'refunded');
CREATE TYPE track_type AS ENUM ('prayer', 'course', 'odb', 'mass');
CREATE TYPE segment_type AS ENUM ('listen', 'respond', 'meditate');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('card', 'blik', 'p24', 'transfer', 'cash');
CREATE TYPE payment_type AS ENUM ('mass_intention', 'donation', 'product');
CREATE TYPE announcement_priority AS ENUM ('low', 'normal', 'high');
CREATE TYPE user_role AS ENUM ('user', 'admin', 'priest', 'parish_admin');

-- User profiles table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'user',
  parish_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Parishes (churches) table
CREATE TABLE IF NOT EXISTS parishes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT DEFAULT 'Poland',
  timezone TEXT DEFAULT 'Europe/Warsaw',
  contact_email TEXT,
  contact_phone TEXT,
  website TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add foreign key constraint to users table after parishes is created
ALTER TABLE users ADD CONSTRAINT fk_users_parish 
  FOREIGN KEY (parish_id) REFERENCES parishes(id);

-- Priests table
CREATE TABLE IF NOT EXISTS priests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  parish_id UUID NOT NULL REFERENCES parishes(id),
  title TEXT,
  bio TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Mass schedules
CREATE TABLE IF NOT EXISTS mass_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parish_id UUID NOT NULL REFERENCES parishes(id),
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday, 6 = Saturday
  time TIME NOT NULL,
  type mass_type DEFAULT 'regular',
  language TEXT DEFAULT 'pl',
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Mass intentions
CREATE TABLE IF NOT EXISTS mass_intentions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parish_id UUID NOT NULL REFERENCES parishes(id),
  user_id UUID REFERENCES users(id),
  intention_for TEXT NOT NULL,
  mass_date DATE NOT NULL,
  mass_time TIME,
  mass_type mass_type DEFAULT 'regular',
  status mass_intention_status DEFAULT 'pending_payment',
  priest_id UUID REFERENCES priests(id),
  payment_id UUID,
  payment_status TEXT,
  is_paid BOOLEAN DEFAULT FALSE,
  requestor_name TEXT NOT NULL,
  requestor_email TEXT NOT NULL,
  requestor_phone TEXT,
  notes TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'PLN',
  status payment_status DEFAULT 'pending',
  method payment_method,
  type payment_type NOT NULL,
  reference_id UUID, -- Reference to mass_intention or other entity
  stripe_payment_intent_id TEXT,
  stripe_customer_id TEXT,
  receipt_url TEXT,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add foreign key constraint to mass_intentions after payments is created
ALTER TABLE mass_intentions ADD CONSTRAINT fk_mass_intentions_payment 
  FOREIGN KEY (payment_id) REFERENCES payments(id);

-- Candles
CREATE TABLE IF NOT EXISTS candles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  intention TEXT NOT NULL,
  nfc_id TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audio tracks
CREATE TABLE IF NOT EXISTS audio_tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  duration INTEGER NOT NULL, -- in seconds
  type track_type NOT NULL,
  language TEXT DEFAULT 'pl',
  is_premium BOOLEAN DEFAULT FALSE,
  transcript_url TEXT,
  interactive_segments JSONB,
  chapters JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User progress on audio tracks
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  track_id UUID NOT NULL REFERENCES audio_tracks(id),
  progress DECIMAL(5, 2) DEFAULT 0, -- percentage (0-100)
  completed BOOLEAN DEFAULT FALSE,
  last_position INTEGER DEFAULT 0, -- in seconds
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, track_id)
);

-- User favorites
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  track_id UUID NOT NULL REFERENCES audio_tracks(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, track_id)
);

-- Announcements
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parish_id UUID NOT NULL REFERENCES parishes(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_published BOOLEAN DEFAULT FALSE,
  priority announcement_priority DEFAULT 'normal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Calendar events
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parish_id UUID NOT NULL REFERENCES parishes(id),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location TEXT,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern TEXT, -- RRULE format
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Feature flags
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_enabled BOOLEAN DEFAULT FALSE,
  conditions JSONB, -- JSON conditions for targeted rollout
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notification templates
CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL, -- email, sms, push
  variables JSONB, -- List of variables used in the template
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL, -- email, sms, push
  read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notification logs
CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  template_id UUID REFERENCES notification_templates(id),
  type TEXT NOT NULL, -- email, sms, push
  status TEXT NOT NULL, -- sent, failed, delivered, read
  error TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Scheduled notifications
CREATE TABLE IF NOT EXISTS scheduled_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  template_id UUID REFERENCES notification_templates(id),
  scheduled_time TIMESTAMPTZ NOT NULL,
  type TEXT NOT NULL, -- email, sms, push
  variables JSONB, -- Variables to inject into the template
  status TEXT DEFAULT 'pending', -- pending, processed, failed
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notification subscriptions
CREATE TABLE IF NOT EXISTS notification_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

-- Analytics events
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  event_type TEXT NOT NULL,
  page TEXT,
  component TEXT,
  properties JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Webhook events
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider TEXT NOT NULL, -- stripe, p24, etc.
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Courses
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  duration INTEGER, -- total duration in minutes
  level TEXT, -- beginner, intermediate, advanced
  is_published BOOLEAN DEFAULT FALSE,
  is_premium BOOLEAN DEFAULT FALSE,
  price DECIMAL(10, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Lessons
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  duration INTEGER, -- in minutes
  order_number INTEGER NOT NULL,
  track_id UUID REFERENCES audio_tracks(id),
  has_quiz BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Student courses (enrollments)
CREATE TABLE IF NOT EXISTS student_courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  course_id UUID NOT NULL REFERENCES courses(id),
  enrollment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed BOOLEAN DEFAULT FALSE,
  completion_date TIMESTAMPTZ,
  progress DECIMAL(5, 2) DEFAULT 0, -- percentage (0-100)
  certificate_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Student lessons (progress)
CREATE TABLE IF NOT EXISTS student_lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  lesson_id UUID NOT NULL REFERENCES lessons(id),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  progress DECIMAL(5, 2) DEFAULT 0, -- percentage (0-100)
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Quizzes
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID NOT NULL REFERENCES lessons(id),
  title TEXT NOT NULL,
  description TEXT,
  passing_score INTEGER DEFAULT 70, -- percentage required to pass
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Quiz questions
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id),
  question TEXT NOT NULL,
  type TEXT NOT NULL, -- multiple_choice, true_false, fill_in
  options JSONB, -- For multiple choice questions
  correct_answer TEXT NOT NULL,
  points INTEGER DEFAULT 1,
  order_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Quiz attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  quiz_id UUID NOT NULL REFERENCES quizzes(id),
  score INTEGER NOT NULL,
  passed BOOLEAN,
  answers JSONB,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Course analytics
CREATE TABLE IF NOT EXISTS course_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id),
  enrollments_count INTEGER DEFAULT 0,
  completion_count INTEGER DEFAULT 0,
  average_progress DECIMAL(5, 2) DEFAULT 0,
  average_completion_time INTEGER, -- in minutes
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Report configs
CREATE TABLE IF NOT EXISTS report_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  schedule TEXT, -- cron format
  recipients JSONB,
  parameters JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reports
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  config_id UUID NOT NULL REFERENCES report_configs(id),
  name TEXT NOT NULL,
  description TEXT,
  query TEXT,
  parameters JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Generated reports
CREATE TABLE IF NOT EXISTS generated_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES reports(id),
  user_id UUID REFERENCES users(id),
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL, -- pdf, xlsx, csv
  parameters JSONB,
  status TEXT NOT NULL, -- processing, completed, failed
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Reminders
CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  reference_type TEXT NOT NULL, -- mass_intention, course, etc.
  reference_id UUID NOT NULL,
  remind_at TIMESTAMPTZ NOT NULL,
  type TEXT NOT NULL, -- before, after, specific
  channel TEXT NOT NULL, -- email, sms, push
  message TEXT,
  status TEXT DEFAULT 'pending', -- pending, sent, failed
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create function for user stats
CREATE OR REPLACE FUNCTION get_user_stats(user_id UUID)
RETURNS TABLE (
  total_prayers INTEGER,
  total_time INTEGER,
  streak_days INTEGER,
  favorite_type TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH user_data AS (
    SELECT
      COUNT(DISTINCT up.track_id) AS total_prayers,
      SUM(at.duration) AS total_time,
      (
        SELECT COUNT(DISTINCT DATE(created_at))
        FROM user_progress
        WHERE user_id = get_user_stats.user_id
        AND created_at > NOW() - INTERVAL '30 days'
      ) AS streak_days,
      (
        SELECT type
        FROM audio_tracks at
        JOIN user_progress up ON at.id = up.track_id
        WHERE up.user_id = get_user_stats.user_id
        GROUP BY at.type
        ORDER BY COUNT(*) DESC
        LIMIT 1
      ) AS favorite_type
    FROM user_progress up
    JOIN audio_tracks at ON up.track_id = at.id
    WHERE up.user_id = get_user_stats.user_id
  )
  SELECT
    COALESCE(total_prayers, 0),
    COALESCE(total_time, 0),
    COALESCE(streak_days, 0),
    COALESCE(favorite_type, 'prayer')
  FROM user_data;
END;
$$ LANGUAGE plpgsql;

-- Add Row Level Security (RLS) policies
-- This is just a starting point, you'll need to customize these policies
-- based on your application's specific security requirements

-- Enable RLS on tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE parishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE priests ENABLE ROW LEVEL SECURITY;
ALTER TABLE mass_intentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE candles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can read/update their own data
CREATE POLICY user_crud_own ON users
  FOR ALL USING (auth.uid() = id);

-- Admins can read all user data
CREATE POLICY admin_read_all ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can read their own mass intentions
CREATE POLICY user_read_own_intentions ON mass_intentions
  FOR SELECT USING (auth.uid() = user_id);

-- Priests can see mass intentions for their parish
CREATE POLICY priest_read_parish_intentions ON mass_intentions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM priests
      WHERE user_id = auth.uid()
      AND parish_id = mass_intentions.parish_id
    )
  );

-- Users can read their own payments
CREATE POLICY user_read_own_payments ON payments
  FOR SELECT USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_parish ON users(parish_id);
CREATE INDEX idx_priests_parish ON priests(parish_id);
CREATE INDEX idx_mass_intentions_parish ON mass_intentions(parish_id);
CREATE INDEX idx_mass_intentions_user ON mass_intentions(user_id);
CREATE INDEX idx_mass_intentions_date ON mass_intentions(mass_date);
CREATE INDEX idx_mass_intentions_status ON mass_intentions(status);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_reference ON payments(reference_id);
CREATE INDEX idx_user_progress_user ON user_progress(user_id);
CREATE INDEX idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_webhook_events_provider ON webhook_events(provider);
CREATE INDEX idx_webhook_events_type ON webhook_events(event_type);
CREATE INDEX idx_notification_logs_user ON notification_logs(user_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_scheduled_notifications_time ON scheduled_notifications(scheduled_time);
CREATE INDEX idx_reminders_time ON reminders(remind_at);
CREATE INDEX idx_student_courses_user ON student_courses(user_id);
CREATE INDEX idx_student_lessons_user ON student_lessons(user_id);
