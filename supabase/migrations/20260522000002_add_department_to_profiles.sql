ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS department text;

-- Replace restrictive "read own only" policy with read-all for authenticated users.
-- Live board displays sender/recipient info for all kudos — profiles are semi-public.
DROP POLICY IF EXISTS "Users read own profile" ON profiles;

CREATE POLICY "Authenticated users read profiles"
  ON profiles FOR SELECT
  TO authenticated USING (true);
