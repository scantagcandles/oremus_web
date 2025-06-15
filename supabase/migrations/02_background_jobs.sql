-- Create functions for background jobs and notifications

-- Function to mark expired candles as inactive
CREATE OR REPLACE FUNCTION check_expired_candles()
RETURNS void AS $$
BEGIN
  UPDATE candles
  SET is_active = false
  WHERE is_active = true
    AND expires_at <= now();
END;
$$ LANGUAGE plpgsql;

-- Function to send reminder for upcoming masses
CREATE OR REPLACE FUNCTION check_mass_reminders()
RETURNS void AS $$
DECLARE
  reminder record;
BEGIN
  FOR reminder IN
    SELECT m.id, m.user_id, m.scheduled_date, u.email
    FROM masses m
    JOIN users u ON m.user_id = u.id
    WHERE m.status = 'confirmed'
      AND m.scheduled_date > now()
      AND m.scheduled_date <= now() + interval '24 hours'
      AND NOT EXISTS (
        SELECT 1
        FROM mass_reminders mr
        WHERE mr.mass_id = m.id
          AND mr.reminder_type = '24h'
      )
  LOOP
    -- Insert reminder record
    INSERT INTO mass_reminders (mass_id, reminder_type)
    VALUES (reminder.id, '24h');

    -- Here you would typically call your notification service
    -- This could be an edge function, external service, etc.
    PERFORM http_post(
      'https://your-notification-service.com/send',
      json_build_object(
        'user_id', reminder.user_id,
        'email', reminder.email,
        'type', 'mass_reminder',
        'scheduled_date', reminder.scheduled_date
      )
    );
  END;
END;
$$ LANGUAGE plpgsql;

-- Table for tracking mass reminders
CREATE TABLE IF NOT EXISTS public.mass_reminders (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  mass_id uuid NOT NULL REFERENCES public.masses ON DELETE CASCADE,
  reminder_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE (mass_id, reminder_type)
);

-- Add scheduled jobs
SELECT cron.schedule(
  'check-expired-candles',
  '*/5 * * * *', -- Every 5 minutes
  'SELECT check_expired_candles();'
);

SELECT cron.schedule(
  'check-mass-reminders',
  '0 * * * *', -- Every hour
  'SELECT check_mass_reminders();'
);

-- Add function for getting upcoming masses
CREATE OR REPLACE FUNCTION get_upcoming_masses(user_id_param uuid)
RETURNS TABLE (
  id uuid,
  intention text,
  scheduled_date timestamptz,
  type text,
  status text,
  priest_notes text,
  reminder_sent boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.intention,
    m.scheduled_date,
    m.type,
    m.status,
    m.priest_notes,
    EXISTS (
      SELECT 1
      FROM mass_reminders mr
      WHERE mr.mass_id = m.id
    ) as reminder_sent
  FROM masses m
  WHERE m.user_id = user_id_param
    AND m.scheduled_date > now()
    AND m.status != 'cancelled'
  ORDER BY m.scheduled_date ASC;
END;
$$ LANGUAGE plpgsql;
