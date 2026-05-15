CREATE TABLE IF NOT EXISTS hashtags (
  id       uuid  PRIMARY KEY DEFAULT gen_random_uuid(),
  name_vi  text  NOT NULL,
  name_en  text  NOT NULL,
  UNIQUE (name_vi),
  UNIQUE (name_en)
);

ALTER TABLE hashtags ENABLE ROW LEVEL SECURITY;

-- Everyone can read hashtags (used in kudo form without auth requirement)
CREATE POLICY "Hashtags are publicly readable"
  ON hashtags FOR SELECT
  USING (true);

-- Only service role can manage hashtags (admin-defined list)
-- INSERT/UPDATE/DELETE blocked for authenticated users via RLS
