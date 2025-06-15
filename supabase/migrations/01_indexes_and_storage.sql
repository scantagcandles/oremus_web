-- Create triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_updated
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER progress_updated
  BEFORE UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Add indexes for performance
CREATE INDEX idx_candles_user_id ON candles(user_id);
CREATE INDEX idx_candles_expires_at ON candles(expires_at);
CREATE INDEX idx_masses_user_id ON masses(user_id);
CREATE INDEX idx_masses_scheduled_date ON masses(scheduled_date);
CREATE INDEX idx_audio_tracks_type ON audio_tracks(type);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_track_id ON user_progress(track_id);
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_track_id ON user_favorites(track_id);
CREATE INDEX idx_notification_subs_user_id ON notification_subscriptions(user_id);
CREATE INDEX idx_notification_subs_endpoint ON notification_subscriptions(endpoint);

-- Add storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('audio-files', 'audio-files', true),
  ('avatars', 'avatars', true),
  ('transcripts', 'transcripts', true);

-- Add storage policies
CREATE POLICY "Public access to audio files"
ON storage.objects FOR SELECT
USING (bucket_id = 'audio-files');

CREATE POLICY "Users can upload audio files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'audio-files'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Public access to transcripts"
ON storage.objects FOR SELECT
USING (bucket_id = 'transcripts');

CREATE POLICY "Users can upload transcripts"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'transcripts'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can access own avatars"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'avatars'
  AND (auth.uid() = owner)
);

CREATE POLICY "Users can upload own avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid() = owner
);

CREATE POLICY "Users can update own avatars"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND auth.uid() = owner
);

CREATE POLICY "Users can delete own avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars'
  AND auth.uid() = owner
);

-- Add realtime publication for subscribed tables
BEGIN;
  -- Enable publication for tables that need realtime
  ALTER PUBLICATION supabase_realtime ADD TABLE candles;
  ALTER PUBLICATION supabase_realtime ADD TABLE masses;
  ALTER PUBLICATION supabase_realtime ADD TABLE user_progress;
  ALTER PUBLICATION supabase_realtime ADD TABLE user_favorites;
COMMIT;
