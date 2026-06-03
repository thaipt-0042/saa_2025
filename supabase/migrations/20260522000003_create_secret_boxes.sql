CREATE TABLE IF NOT EXISTS secret_boxes (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_opened   boolean     NOT NULL DEFAULT false,
  opened_at   timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_secret_boxes_user_id   ON secret_boxes(user_id);
CREATE INDEX IF NOT EXISTS idx_secret_boxes_opened_at ON secret_boxes(opened_at DESC NULLS LAST);

ALTER TABLE secret_boxes ENABLE ROW LEVEL SECURITY;

-- Users can only see their own boxes; admin grants boxes via service role
CREATE POLICY "Users read own secret boxes"
  ON secret_boxes FOR SELECT
  TO authenticated USING (user_id = auth.uid());
