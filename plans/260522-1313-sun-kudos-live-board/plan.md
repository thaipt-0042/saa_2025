---
title: Sun* Kudos — Live Board
status: completed
branch: develop
blockedBy: []
blocks: []
created: 2026-05-22
momorph: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/MaZUn5xHXZ
---

# Blueprint: Sun* Kudos — Live Board

**Route**: `/sun-kudos`  
**Current state**: `app/sun-kudos/page.tsx` is a stub (placeholder text + WriteKudoButton only)  
**Goal**: Full Live Board implementation — hero, highlight carousel, spotlight board, all-kudos feed, sidebar

---

## Screen Overview (from Figma `MaZUn5xHXZ`)

| Section | ID | Description |
|---------|----|-----------| 
| A — KV Hero | `2940:13437` | Hero banner + write trigger pill |
| B — Highlight Kudos | `2940:13451` | Carousel of top-5 kudos by hearts + filters |
| B.7 — Spotlight Board | `2940:14174` | Word cloud of kudo recipients |
| C — All Kudos | `2940:13475` | Infinite-scroll feed |
| D — Right Sidebar | `2940:13488` | Stats block + recent gift list |

---

## Phases

| # | Phase | Status | File |
|---|-------|--------|------|
| 1 | DB Migrations | done | [phase-01-db-migrations.md](./phase-01-db-migrations.md) |
| 2 | Service Layer | done | [phase-02-service-layer.md](./phase-02-service-layer.md) |
| 3 | API Routes | done | [phase-03-api-routes.md](./phase-03-api-routes.md) |
| 4 | UI Components | done | [phase-04-ui-components.md](./phase-04-ui-components.md) |
| 5 | Tests & Polish | done | [phase-05-tests-polish.md](./phase-05-tests-polish.md) |

---

## Key Architecture Decisions

### 1. Route unchanged — no (main) group needed yet
`app/sun-kudos/page.tsx` already has its own auth check. The route group refactor (FAB
feature) is a separate plan and not a prerequisite here.

### 2. Filter state lives at `live-board-client.tsx`
Both Highlight Kudos and All Kudos sections use the same filters (hashtag + department).
Clicking a hashtag chip inside a kudo card also updates this state. Single source of truth.

### 3. Server-side initial load, client-side interaction
- `page.tsx` (Server Component): loads initial data (top kudos, first page of all kudos, hashtags, departments, user stats) — passed as props to client
- `live-board-client.tsx` (Client Component): manages filter state, pagination, like toggling

### 4. Like (heart) logic
- One like per user per kudo — enforced by DB UNIQUE constraint
- Sender cannot like own kudo — enforced in service layer
- Special-day double hearts — stubbed as false (config table in future)
- Optimistic UI update — revert on API error

### 5. Spotlight board — CSS scatter
No D3 or heavy chart library. Use CSS `position: absolute` scatter with `font-size` proportional
to kudo count. Limit to top 100 recipients. Pan via CSS `transform: translate()`, zoom via
CSS `transform: scale()`.

### 6. Infinite scroll for All Kudos
Cursor-based pagination: `(created_at DESC, id)` composite cursor. Use `IntersectionObserver`
to trigger next page load.

### 7. Secret box — stub only
D.1.8 "Mở quà" button renders but opens a placeholder dialog (feature not yet specced).
Stats (boxes opened/unopened) require `secret_boxes` table migration.

---

## New Files Summary

```
supabase/migrations/
  20260522000001_create_kudo_likes.sql
  20260522000002_add_department_to_profiles.sql
  20260522000003_create_secret_boxes.sql

lib/kudos/
  kudo-service.ts          (extended: listKudos, getTopKudos, toggleLike, getKudoCount)
  live-board-types.ts      (KudoPost, LiveBoardFilters, LiveBoardStats, SunnerActivity)
  live-board-service.ts    (getUserStats, getSpotlightData, getRecentGiftRecipients)

lib/departments/
  department-service.ts    (getDepartments)

app/api/kudos/route.ts     (add GET handler)
app/api/kudos/[id]/like/route.ts
app/api/live-board/stats/route.ts
app/api/departments/route.ts

app/sun-kudos/page.tsx     (replace stub with full SSR data fetch)
app/sun-kudos/_components/
  live-board-client.tsx
  kudo-hero-section.tsx
  write-kudo-trigger.tsx
  highlight-kudos-section.tsx
  filter-bar.tsx
  kudo-highlight-card.tsx
  carousel-nav.tsx
  spotlight-board.tsx
  all-kudos-section.tsx
  kudo-post-card.tsx
  kudo-image-gallery.tsx
  kudo-action-bar.tsx
  right-sidebar.tsx
  stats-block.tsx
  recent-gifts-list.tsx
```

**Reused (no changes):**
- `app/sun-kudos/_components/write-kudo-modal.tsx`
- `app/sun-kudos/_components/toast-notification.tsx`

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Hearts RLS (insert/delete own rows) | High | RLS policies in migration |
| Filter state drift between sections | Medium | Single filter state in live-board-client |
| Spotlight perf with many nodes | Medium | Cap at 100 nodes, CSS only |
| No departments in existing profiles | Medium | Migration adds column; null-safe |
| kudo_likes join cost | Low | Index on kudo_id + user_id |
| WriteKudoModal refresh after submit | Medium | Emit event/callback to refresh All Kudos |

---

## Out of Scope

- Secret box opening dialog (frame `1466:7676`) — stub button only
- Profile hover preview (`721:5827`) — click-through to profile only  
- "Xem chi tiết" kudo detail page — no spec yet, navigate to `#` stub
- Real-time live updates (Supabase Realtime) — manual refresh only
- Mouse drag pan for spotlight board — button-only pan/zoom
