---
phase: 1
title: DB Migrations
status: pending
priority: critical
effort: S
---

# Phase 1 — DB Migrations

## Overview

3 new migrations required. Must run before any service/API work.

---

## Migration 1: `kudo_likes`

**File**: `supabase/migrations/20260522000001_create_kudo_likes.sql`

```sql
CREATE TABLE IF NOT EXISTS kudo_likes (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  kudo_id     uuid        NOT NULL REFERENCES kudos(id) ON DELETE CASCADE,
  user_id     uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  hearts_added integer    NOT NULL DEFAULT 1,  -- 2 on special days
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(kudo_id, user_id)
);

CREATE INDEX idx_kudo_likes_kudo_id ON kudo_likes(kudo_id);
CREATE INDEX idx_kudo_likes_user_id ON kudo_likes(user_id);

ALTER TABLE kudo_likes ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read likes (needed to show like count + user's own like status)
CREATE POLICY "Authenticated users read likes"
  ON kudo_likes FOR SELECT
  TO authenticated USING (true);

-- Users can only insert likes as themselves
CREATE POLICY "Users insert own likes"
  ON kudo_likes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can delete only their own likes (unlike)
CREATE POLICY "Users delete own likes"
  ON kudo_likes FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
```

---

## Migration 2: `department` column on profiles

**File**: `supabase/migrations/20260522000002_add_department_to_profiles.sql`

```sql
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS department text;

-- Authenticated users can now read department in profiles
-- Existing "Users read own profile" policy is too restrictive for live board
-- Add a read-all policy for authenticated users (profiles are semi-public)
DROP POLICY IF EXISTS "Users read own profile" ON profiles;

CREATE POLICY "Authenticated users read profiles"
  ON profiles FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

> **Note**: The original `"Users read own profile"` policy must be replaced with a
> read-all policy because the live board displays sender/recipient info for all kudos.

---

## Migration 3: `secret_boxes`

**File**: `supabase/migrations/20260522000003_create_secret_boxes.sql`

```sql
CREATE TABLE IF NOT EXISTS secret_boxes (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_opened   boolean     NOT NULL DEFAULT false,
  opened_at   timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_secret_boxes_user_id ON secret_boxes(user_id);
CREATE INDEX idx_secret_boxes_opened_at ON secret_boxes(opened_at DESC NULLS LAST);

ALTER TABLE secret_boxes ENABLE ROW LEVEL SECURITY;

-- Users read only their own boxes
CREATE POLICY "Users read own secret boxes"
  ON secret_boxes FOR SELECT
  TO authenticated USING (user_id = auth.uid());

-- Only service role can insert/update secret boxes (admin grants them)
-- No user-facing insert/update policy → controlled by admin/system
```

---

## Todo

- [ ] Create `supabase/migrations/20260522000001_create_kudo_likes.sql`
- [ ] Create `supabase/migrations/20260522000002_add_department_to_profiles.sql`
- [ ] Create `supabase/migrations/20260522000003_create_secret_boxes.sql`
- [ ] Run `npx supabase db push` to apply migrations
- [ ] Verify tables exist: `kudo_likes`, `profiles.department`, `secret_boxes`

## Success Criteria

- All 3 migrations apply without error
- `kudo_likes` UNIQUE(kudo_id, user_id) constraint verified
- RLS policies active on all 3 tables
