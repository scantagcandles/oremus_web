-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create RLS policies for users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Create candles table
CREATE TABLE IF NOT EXISTS public.candles (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users ON DELETE CASCADE,
  intention text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  nfc_id text,
  is_active boolean NOT NULL DEFAULT true,
  PRIMARY KEY (id)
);

-- Create RLS policies for candles
ALTER TABLE public.candles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own candles"
  ON public.candles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create candles"
  ON public.candles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own candles"
  ON public.candles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own candles"
  ON public.candles FOR DELETE
  USING (auth.uid() = user_id);

-- Create masses table
CREATE TABLE IF NOT EXISTS public.masses (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users ON DELETE CASCADE,
  intention text NOT NULL,
  scheduled_date timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  type text NOT NULL CHECK (type IN ('regular', 'requiem', 'thanksgiving')),
  status text NOT NULL CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  priest_notes text,
  PRIMARY KEY (id)
);

-- Create RLS policies for masses
ALTER TABLE public.masses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own masses"
  ON public.masses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create masses"
  ON public.masses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own masses"
  ON public.masses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own masses"
  ON public.masses FOR DELETE
  USING (auth.uid() = user_id);

-- Create audio_tracks table
CREATE TABLE IF NOT EXISTS public.audio_tracks (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  url text NOT NULL,
  duration integer NOT NULL,
  type text NOT NULL CHECK (type IN ('prayer', 'course', 'odb', 'mass')),
  language text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  is_premium boolean NOT NULL DEFAULT false,
  transcript_url text,
  interactive_segments jsonb,
  chapters jsonb,
  PRIMARY KEY (id)
);

-- Create RLS policies for audio_tracks
ALTER TABLE public.audio_tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view audio tracks"
  ON public.audio_tracks FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify audio tracks"
  ON public.audio_tracks FOR ALL
  USING (auth.uid() IN (SELECT id FROM public.users WHERE is_admin = true));

-- Create user_progress table
CREATE TABLE IF NOT EXISTS public.user_progress (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users ON DELETE CASCADE,
  track_id uuid NOT NULL REFERENCES public.audio_tracks ON DELETE CASCADE,
  progress integer NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_position integer NOT NULL DEFAULT 0,
  notes jsonb,
  PRIMARY KEY (id),
  UNIQUE (user_id, track_id)
);

-- Create RLS policies for user_progress
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON public.user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON public.user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON public.user_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Create user_favorites table
CREATE TABLE IF NOT EXISTS public.user_favorites (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users ON DELETE CASCADE,
  track_id uuid NOT NULL REFERENCES public.audio_tracks ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE (user_id, track_id)
);

-- Create RLS policies for user_favorites
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites"
  ON public.user_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own favorites"
  ON public.user_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON public.user_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Create notification_subscriptions table
CREATE TABLE IF NOT EXISTS public.notification_subscriptions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users ON DELETE CASCADE,
  endpoint text NOT NULL,
  p256dh_key text NOT NULL,
  auth_key text NOT NULL,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE (user_id, endpoint)
);

-- Create RLS policies for notification_subscriptions
ALTER TABLE public.notification_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON public.notification_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own subscriptions"
  ON public.notification_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscriptions"
  ON public.notification_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to get user stats
CREATE OR REPLACE FUNCTION get_user_stats(user_id uuid)
RETURNS TABLE (
  total_prayers bigint,
  total_time bigint,
  streak_days integer,
  favorite_type text
) AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    -- Get total prayers
    SELECT COUNT(*) as total_prayers,
           COALESCE(SUM(at.duration), 0) as total_time
    FROM user_progress up
    JOIN audio_tracks at ON up.track_id = at.id
    WHERE up.user_id = $1
    AND up.completed = true
  ),
  -- Get current streak
  streak AS (
    SELECT COUNT(DISTINCT DATE(updated_at)) as streak_days
    FROM user_progress
    WHERE user_id = $1
    AND updated_at >= CURRENT_DATE - interval '30 days'
    GROUP BY user_id
  ),
  -- Get favorite type
  fav_type AS (
    SELECT at.type,
           COUNT(*) as type_count
    FROM user_favorites uf
    JOIN audio_tracks at ON uf.track_id = at.id
    WHERE uf.user_id = $1
    GROUP BY at.type
    ORDER BY type_count DESC
    LIMIT 1
  )
  SELECT
    stats.total_prayers,
    stats.total_time,
    COALESCE(streak.streak_days, 0),
    COALESCE(fav_type.type, 'none')
  FROM stats
  LEFT JOIN streak ON true
  LEFT JOIN fav_type ON true;
END;
$$ LANGUAGE plpgsql;
