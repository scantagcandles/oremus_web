-- Create bucket for NFC logs
INSERT INTO storage.buckets (id, name, public)
VALUES ('nfc-logs', 'nfc-logs', false);

-- Create table for NFC logs
CREATE TABLE IF NOT EXISTS public.nfc_logs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  candle_id uuid NOT NULL REFERENCES public.candles ON DELETE CASCADE,
  nfc_id text NOT NULL,
  action text NOT NULL CHECK (action IN ('activate', 'deactivate', 'check')),
  location jsonb,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create RLS policies for NFC logs
ALTER TABLE public.nfc_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view all NFC logs"
  ON public.nfc_logs FOR SELECT
  USING (auth.uid() IN (SELECT id FROM public.users WHERE is_admin = true));

CREATE POLICY "Users can view own candle logs"
  ON public.nfc_logs FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id
      FROM candles
      WHERE id = candle_id
    )
  );

CREATE POLICY "Users can create logs for own candles"
  ON public.nfc_logs FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id
      FROM candles
      WHERE id = candle_id
    )
  );

-- Add function to validate and process NFC actions
CREATE OR REPLACE FUNCTION process_nfc_action(
  p_candle_id uuid,
  p_nfc_id text,
  p_action text,
  p_location jsonb DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_candle record;
  v_result jsonb;
BEGIN
  -- Get candle details
  SELECT *
  INTO v_candle
  FROM candles
  WHERE id = p_candle_id;

  -- Validate candle exists
  IF v_candle IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Candle not found'
    );
  END IF;

  -- Validate NFC ID matches
  IF v_candle.nfc_id != p_nfc_id THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Invalid NFC tag'
    );
  END IF;

  -- Process action
  CASE p_action
    WHEN 'activate' THEN
      IF v_candle.is_active THEN
        RETURN jsonb_build_object(
          'success', false,
          'message', 'Candle is already active'
        );
      END IF;

      UPDATE candles
      SET is_active = true
      WHERE id = p_candle_id;

    WHEN 'deactivate' THEN
      IF NOT v_candle.is_active THEN
        RETURN jsonb_build_object(
          'success', false,
          'message', 'Candle is already inactive'
        );
      END IF;

      UPDATE candles
      SET is_active = false
      WHERE id = p_candle_id;

    WHEN 'check' THEN
      -- Just log the check
      NULL;

    ELSE
      RETURN jsonb_build_object(
        'success', false,
        'message', 'Invalid action'
      );
  END CASE;

  -- Log the action
  INSERT INTO nfc_logs (
    candle_id,
    nfc_id,
    action,
    location,
    user_agent
  ) VALUES (
    p_candle_id,
    p_nfc_id,
    p_action,
    p_location,
    p_user_agent
  );

  -- Return success result with candle status
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Action processed successfully',
    'candle', jsonb_build_object(
      'id', v_candle.id,
      'is_active', CASE p_action
        WHEN 'activate' THEN true
        WHEN 'deactivate' THEN false
        ELSE v_candle.is_active
      END,
      'expires_at', v_candle.expires_at
    )
  );
END;
$$ LANGUAGE plpgsql;
