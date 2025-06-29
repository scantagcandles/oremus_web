-- Create announcements table
CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  parish_id uuid NOT NULL REFERENCES public.parishes(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone,
  is_published boolean NOT NULL DEFAULT false,
  priority text NOT NULL CHECK (priority IN ('low', 'normal', 'high')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT announcements_pkey PRIMARY KEY (id)
);

-- Create RLS policies for announcements
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can do everything" ON public.announcements
  USING (auth.uid() IN (
    SELECT user_id FROM public.parish_admins 
    WHERE parish_id = parish_id
  ));

CREATE POLICY "Public can view published announcements" ON public.announcements
  FOR SELECT
  USING (
    is_published = true 
    AND start_date <= now()
    AND (end_date IS NULL OR end_date >= now())
  );

-- Create functions to manage announcements
CREATE OR REPLACE FUNCTION handle_announcement_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.created_at = NOW();
  END IF;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER announcements_timestamps
  BEFORE INSERT OR UPDATE ON public.announcements
  FOR EACH ROW
  EXECUTE FUNCTION handle_announcement_timestamps();
