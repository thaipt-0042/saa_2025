CREATE TABLE IF NOT EXISTS kudos (
  id                     uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id              uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id           uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content                text        NOT NULL,
  hashtags               uuid[]      NOT NULL DEFAULT '{}',
  image_urls             text[]      NOT NULL DEFAULT '{}',
  is_anonymous           boolean     NOT NULL DEFAULT false,
  anonymous_display_name text,
  created_at             timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE kudos ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read all kudos (live board)
CREATE POLICY "Authenticated users can read kudos"
  ON kudos FOR SELECT
  TO authenticated
  USING (true);

-- Users can only insert kudos as themselves
CREATE POLICY "Users insert own kudos"
  ON kudos FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

-- Kudos are immutable after creation
-- No UPDATE or DELETE policies → blocked for all roles
