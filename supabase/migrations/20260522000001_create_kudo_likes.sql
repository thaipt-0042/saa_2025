CREATE TABLE IF NOT EXISTS kudo_likes (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  kudo_id      uuid        NOT NULL REFERENCES kudos(id) ON DELETE CASCADE,
  user_id      uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  hearts_added integer     NOT NULL DEFAULT 1,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE(kudo_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_kudo_likes_kudo_id ON kudo_likes(kudo_id);
CREATE INDEX IF NOT EXISTS idx_kudo_likes_user_id  ON kudo_likes(user_id);

ALTER TABLE kudo_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users read likes"
  ON kudo_likes FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Users insert own likes"
  ON kudo_likes FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users delete own likes"
  ON kudo_likes FOR DELETE
  TO authenticated USING (user_id = auth.uid());
