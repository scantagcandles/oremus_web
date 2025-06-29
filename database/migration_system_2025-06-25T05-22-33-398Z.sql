-- OREMUS Complete Database Schema
-- Generated from project analysis
-- Generated at: 2025-06-25T05:22:33.413Z
-- Total tables: 1

-- Required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

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

ALTER TABLE notifications ADD CONSTRAINT fk_notifications_user_id
  FOREIGN KEY (user_id) REFERENCES users(id)
  ON DELETE CASCADE;

-- INDEXES

ALTER TABLE notifications ADD PRIMARY KEY (id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- ROW LEVEL SECURITY

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
