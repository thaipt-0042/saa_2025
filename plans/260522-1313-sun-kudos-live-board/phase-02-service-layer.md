---
phase: 2
title: Service Layer
status: pending
priority: critical
effort: M
blockedBy: [phase-01-db-migrations.md]
---

# Phase 2 — Service Layer

## Overview

Extend `lib/kudos/kudo-service.ts` and add new service files. All business logic here;
API routes are thin wrappers only (Constitution Principle IV).

---

## 2.1 New types — `lib/kudos/live-board-types.ts`

```typescript
export interface KudoPost {
  id: string
  sender: {
    id: string
    fullName: string | null
    avatarUrl: string | null
    department: string | null
    starCount: number        // 0, 1, 2, or 3 (derived from kudos received)
  }
  recipient: {
    id: string
    fullName: string | null
    avatarUrl: string | null
    department: string | null
    starCount: number
  }
  content: string
  hashtags: Array<{ id: string; name: string }>
  imageUrls: string[]
  likeCount: number
  likedByCurrentUser: boolean
  senderIsCurrentUser: boolean  // true → disable like button
  createdAt: string
}

export interface LiveBoardFilters {
  hashtagId: string | null
  department: string | null
}

export interface LiveBoardStats {
  kudosReceived: number
  kudosSent: number
  heartsReceived: number
  secretBoxesOpened: number
  secretBoxesUnopened: number
}

export interface SunnerActivity {
  userId: string
  fullName: string | null
  avatarUrl: string | null
  description: string   // e.g. "nhận Secret Box #3"
}

export interface SpotlightNode {
  userId: string
  fullName: string
  kudosReceived: number   // determines font size
  latestKudoAt: string
}

export interface KudosPage {
  items: KudoPost[]
  nextCursor: string | null  // "<created_at>_<id>" or null if last page
}
```

---

## 2.2 Extend `lib/kudos/kudo-service.ts`

Add these 4 functions:

### `listKudos`

```typescript
export async function listKudos(
  currentUserId: string,
  filters: { hashtagId?: string; department?: string },
  cursor: string | null,
  limit: number = 10,
  supabase: SupabaseClient,
  locale: string = 'vi'
): Promise<KudosPage>
```

- Query: `kudos` JOIN `profiles` (sender + recipient) JOIN `hashtags` JOIN `kudo_likes`
- Filter by `hashtag_id` in `kudos.hashtags` array if provided
- Filter by `profiles.department` of recipient if department provided
- Cursor decode: `cursor = "<iso_datetime>_<uuid>"` → `WHERE (created_at, id) < (ts, id)`
- Order: `created_at DESC, id DESC`
- Include per-kudo: `like_count`, `liked_by_current_user` (check `kudo_likes` for currentUserId)
- Map hashtag UUIDs → names via `hashtags` table (use locale)

### `getTopKudos`

```typescript
export async function getTopKudos(
  currentUserId: string,
  filters: { hashtagId?: string; department?: string },
  limit: number = 5,
  supabase: SupabaseClient,
  locale: string = 'vi'
): Promise<KudoPost[]>
```

- Same JOIN pattern as `listKudos`
- Order: total hearts (sum of `kudo_likes.hearts_added`) DESC, `created_at` DESC
- No cursor needed (always fetches top N)

### `toggleLike`

```typescript
export async function toggleLike(
  userId: string,
  kudoId: string,
  supabase: SupabaseClient
): Promise<{ liked: boolean; likeCount: number }>
```

Business rules:
1. Fetch kudo — verify it exists
2. If `kudo.sender_id === userId` → throw `Error('SENDER_CANNOT_LIKE')`
3. Check existing like in `kudo_likes`
4. If exists → DELETE (unlike), return `liked: false`
5. If not exists → INSERT with `hearts_added: 1` (special-day logic stubbed false for now)
6. Return updated `likeCount` (sum hearts_added for this kudo)

### `getKudoCount`

```typescript
export async function getKudoCount(supabase: SupabaseClient): Promise<number>
```

- Simple `SELECT count(*) FROM kudos`

---

## 2.3 New file — `lib/kudos/live-board-service.ts`

### `getUserStats`

```typescript
export async function getUserStats(
  userId: string,
  supabase: SupabaseClient
): Promise<LiveBoardStats>
```

- `kudosReceived`: `SELECT count(*) FROM kudos WHERE recipient_id = userId`
- `kudosSent`: `SELECT count(*) FROM kudos WHERE sender_id = userId`
- `heartsReceived`: `SELECT sum(hearts_added) FROM kudo_likes JOIN kudos ON kudos.id = kudo_likes.kudo_id WHERE kudos.sender_id = userId`
- `secretBoxesOpened`: `SELECT count(*) FROM secret_boxes WHERE user_id = userId AND is_opened = true`
- `secretBoxesUnopened`: `SELECT count(*) FROM secret_boxes WHERE user_id = userId AND is_opened = false`

### `getSpotlightData`

```typescript
export async function getSpotlightData(
  supabase: SupabaseClient,
  limit: number = 100
): Promise<SpotlightNode[]>
```

- Query: `kudos` GROUP BY `recipient_id`, count, join `profiles`
- Order by count DESC
- Returns top `limit` recipients

### `getRecentGiftRecipients`

```typescript
export async function getRecentGiftRecipients(
  supabase: SupabaseClient
): Promise<SunnerActivity[]>
```

- Query: `secret_boxes` WHERE `is_opened = true` ORDER BY `opened_at DESC` LIMIT 10
- Join `profiles` for name + avatar

---

## 2.4 New file — `lib/departments/department-service.ts`

```typescript
export async function getDepartments(
  supabase: SupabaseClient
): Promise<string[]>
```

- `SELECT DISTINCT department FROM profiles WHERE department IS NOT NULL ORDER BY department`

---

## Star count helper (pure function, no DB)

In `lib/kudos/live-board-types.ts` or a small util:

```typescript
export function computeStarCount(kudosReceived: number): number {
  if (kudosReceived >= 50) return 3
  if (kudosReceived >= 20) return 2
  if (kudosReceived >= 10) return 1
  return 0
}
```

---

## Todo

- [ ] Create `lib/kudos/live-board-types.ts`
- [ ] Extend `lib/kudos/kudo-service.ts` — add `listKudos`, `getTopKudos`, `toggleLike`, `getKudoCount`
- [ ] Create `lib/kudos/live-board-service.ts`
- [ ] Create `lib/departments/department-service.ts`
- [ ] Unit tests for `toggleLike` business rules (sender cannot like own kudo, one like per user)

## Success Criteria

- `toggleLike` throws `SENDER_CANNOT_LIKE` when sender calls it
- `toggleLike` is idempotent: like → unlike → like all correct
- `listKudos` cursor pagination returns correct pages in created_at DESC order
- All service functions are independently testable (no Next.js deps)
