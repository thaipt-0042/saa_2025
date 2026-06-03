-- Add INSERT policy for profiles table to allow users to create their own profile
CREATE POLICY "Users insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
