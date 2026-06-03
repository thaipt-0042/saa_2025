---
phase: 3
title: API Routes
status: pending
priority: critical
effort: S
blockedBy: [phase-02-service-layer.md]
---

# Phase 3 — API Routes

All routes are thin: auth check → parse → delegate to service → return JSON.
No business logic in route handlers (Constitution Principle IV).

---

## 3.1 `GET /api/kudos` — Add to existing `app/api/kudos/route.ts`

```typescript
// Query params: hashtagId?, department?, cursor?
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const hashtagId = searchParams.get('hashtagId') ?? undefined
  const department = searchParams.get('department') ?? undefined
  const cursor = searchParams.get('cursor') ?? null
  const locale = searchParams.get('locale') ?? 'vi'

  const page = await listKudos(user.id, { hashtagId, department }, cursor, 10, supabase, locale)
  return NextResponse.json(page)
}
```

**Response shape:**
```json
{
  "items": [KudoPost, ...],
  "nextCursor": "2026-05-10T08:00:00Z_<uuid>" | null
}
```

---

## 3.2 `POST /api/kudos/[id]/like` — new file

**File**: `app/api/kudos/[id]/like/route.ts`

```typescript
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const result = await toggleLike(user.id, params.id, supabase)
    return NextResponse.json(result)          // { liked: boolean, likeCount: number }
  } catch (err) {
    if (err instanceof Error && err.message === 'SENDER_CANNOT_LIKE')
      return NextResponse.json({ error: 'Cannot like own kudo' }, { status: 403 })
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 })
  }
}
```

---

## 3.3 `GET /api/kudos/top` — new file

**File**: `app/api/kudos/top/route.ts`

```typescript
// Query params: hashtagId?, department?, limit? (default 5, max 10)
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const hashtagId = searchParams.get('hashtagId') ?? undefined
  const department = searchParams.get('department') ?? undefined
  const locale = searchParams.get('locale') ?? 'vi'
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '5'), 10)

  const items = await getTopKudos(user.id, { hashtagId, department }, limit, supabase, locale)
  return NextResponse.json({ items })
}
```

---

## 3.4 `GET /api/departments` — new file

**File**: `app/api/departments/route.ts`

```typescript
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const departments = await getDepartments(supabase)
  return NextResponse.json({ departments })
}
```

---

## 3.5 `GET /api/live-board/stats` — new file

**File**: `app/api/live-board/stats/route.ts`

```typescript
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const stats = await getUserStats(user.id, supabase)
  return NextResponse.json(stats)
}
```

**Response shape:**
```json
{
  "kudosReceived": 25,
  "kudosSent": 12,
  "heartsReceived": 48,
  "secretBoxesOpened": 3,
  "secretBoxesUnopened": 2
}
```

---

## 3.6 `GET /api/live-board/spotlight` — new file

**File**: `app/api/live-board/spotlight/route.ts`

```typescript
// Query params: limit? (default 100, max 200)
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '100'), 200)

  const [nodes, totalCount] = await Promise.all([
    getSpotlightData(supabase, limit),
    getKudoCount(supabase),
  ])
  return NextResponse.json({ nodes, totalCount })
}
```

---

## 3.7 `GET /api/live-board/recent-gifts` — new file

**File**: `app/api/live-board/recent-gifts/route.ts`

```typescript
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const recipients = await getRecentGiftRecipients(supabase)
  return NextResponse.json({ recipients })
}
```

---

## Todo

- [ ] Add `GET` handler to `app/api/kudos/route.ts`
- [ ] Create `app/api/kudos/[id]/like/route.ts`
- [ ] Create `app/api/kudos/top/route.ts`
- [ ] Create `app/api/departments/route.ts`
- [ ] Create `app/api/live-board/stats/route.ts`
- [ ] Create `app/api/live-board/spotlight/route.ts`
- [ ] Create `app/api/live-board/recent-gifts/route.ts`

## Success Criteria

- All routes return 401 without auth
- `POST /api/kudos/[id]/like` returns 403 when sender tries to like own kudo
- `GET /api/kudos` respects cursor and returns `nextCursor: null` on last page
- `GET /api/kudos/top` returns ≤ 5 items sorted by hearts DESC
