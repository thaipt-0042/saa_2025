# Implementation Plan: Countdown — Prelaunch Page

**Frame**: `8PJQswPZmU-CountdownPrelaunch`
**Date**: 2026-05-15
**Spec**: `specs/8PJQswPZmU-CountdownPrelaunch/spec.md`

---

## Summary

Trang `/countdown` hiển thị countdown timer (DAYS / HOURS / MINUTES) trước khi sự kiện SAA 2025 diễn ra. Trang yêu cầu đăng nhập. Route gốc `/` được chuyển thành smart router: nếu `isPrelaunch = true` → redirect `/countdown`; ngược lại → render Homepage SAA như hiện tại.

**Key discovery**: `CountdownTimer` component và test (`app/_components/countdown-timer.tsx` + `.test.tsx`) **đã được implement sẵn** và sẵn sàng tái sử dụng. Env var chuẩn: `NEXT_PUBLIC_EVENT_DATETIME`.

---

## Technical Context

**Language/Framework**: TypeScript / Next.js 16 App Router
**Primary Dependencies**: React 19, @supabase/ssr, next-intl
**Database**: N/A (static env var config)
**Testing**: Vitest (unit), Playwright (E2E)
**State Management**: Local `useState` + `setInterval` (trong `CountdownTimer` đã có)
**API Style**: N/A

---

## Constitution Compliance Check

| Requirement | Rule | Status |
|---|---|---|
| Server Component default | Principle I | ✅ `app/countdown/page.tsx` là Server Component |
| `'use client'` chỉ khi cần | Principle I | ✅ Chỉ `CountdownTimer` là Client Component (đã có) |
| Design tokens qua CSS vars | Principle II | ✅ Không hardcode hex/px trong page files; `query_section` khi implement UI |
| TDD — test trước implement | Principle III | 📋 Theo plan: `lib/config/event.ts` tests viết trước |
| SSR auth guard | Principle VI | ✅ `getUser()` + `redirect('/login')` trong `app/countdown/page.tsx` |
| TypeScript strict | Principle V | ✅ Không dùng `any` |
| WCAG 2.1 AA | Principle VII | 📋 Planned — `CountdownTimer` hiện **chưa có** `role="timer"`, `aria-live`, `aria-label`. Cần patch trong Phase 3. |
| Responsive mobile-first | Principle VII | 📋 Verify layout `/countdown` responsive |
| `NEXT_PUBLIC_*` không phải secret | Principle VI | ✅ `NEXT_PUBLIC_EVENT_DATETIME` và `NEXT_PUBLIC_PRELAUNCH_MODE` là public (non-secret) |

**Violations**: Không có.

---

## Architecture Decisions

### Reuse — CountdownTimer đã implement (cần patch nhỏ)

`app/_components/countdown-timer.tsx` — tái sử dụng, cần 2 patch:

**Patch 1 — Accessibility** (spec yêu cầu):
- Thêm `role="timer"` + `aria-live="polite"` vào countdown container
- Thêm `aria-label={`${value} ${label.toLowerCase()}`}` vào mỗi `CountdownUnit`
- Update `aria-label` khi value thay đổi (dynamic — React re-render đã xử lý)

**Patch 2 — DAYS ≥ 100 cap** (spec edge case + display bug):
- `CountdownUnit` computes `tens = String(Math.floor(value / 10))` → nếu value=100, `tens="10"` (2 chars trong single-digit tile → visual break)
- Fix trong `computeRemaining`: `days: Math.min(days, 99)` — cap tại 99 cho MVP
- SAA 2025 event trong vòng ~60 ngày → case này không xảy ra thực tế, nhưng cần guard

Component bao gồm:
- `computeRemaining(targetIso)` — tính DAYS/HOURS/MINUTES, clamp về 0
- `DigitTile` — LED-style digit box
- `CountdownUnit` — 2 DigitTile + label + `aria-label`
- `CountdownTimer` — Client Component với `setInterval(60_000)` + cleanup + `role="timer"`

### Shared config: isPrelaunch helper

New file `lib/config/event.ts` — pure function, dễ unit test:

```typescript
export function isPrelaunchMode(): boolean {
  const override = process.env.NEXT_PUBLIC_PRELAUNCH_MODE
  if (override !== undefined && override !== '') return override === 'true'
  const eventDatetime = process.env.NEXT_PUBLIC_EVENT_DATETIME
  if (!eventDatetime) return false  // fail-safe: show homepage
  const target = new Date(eventDatetime)
  if (isNaN(target.getTime())) return false  // fail-safe: show homepage
  return new Date() < target
}
```

### Root router — app/page.tsx (modify)

`page.tsx` đã gọi `getUser()` unconditionally. Chèn isPrelaunch logic **sau** `getUser()` đã có, **trước** `getProfile()`:

```typescript
// Existing (keep as-is):
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()

// ADD: isPrelaunch routing (insert here — before getProfile block)
const isPrelaunch = isPrelaunchMode()
if (isPrelaunch) {
  if (!user) redirect('/login')
  redirect('/countdown')
}

// Existing (keep as-is):
let role: 'admin' | 'user' | null = null
if (user) {
  const profile = await getProfile(user.id, supabase)
  role = profile?.role ?? 'user'
}
// ... rest of homepage render
```

> **Lưu ý**: Khi `isPrelaunch = false`, homepage render bình thường — unauthenticated users vẫn thấy homepage (hành vi hiện tại không đổi). Không gọi `getUser()` lần hai.

### Countdown page — app/countdown/page.tsx (new)

Server Component:
1. Auth guard: `getUser()` → `redirect('/login')` nếu null
2. isPrelaunch guard: `isPrelaunchMode() === false` → `redirect('/')` (event đã open)
3. Render full-page countdown layout với `<CountdownTimer />`
4. Không có Header/Footer per design (holding page minimalist) — confirm với Figma `query_section` khi implement

---

## Project Structure

### New Files

| File | Purpose |
|---|---|
| `app/countdown/page.tsx` | Countdown page — Server Component: auth guard + isPrelaunch guard + layout |
| `lib/config/event.ts` | `isPrelaunchMode()` helper — shared between root page và countdown page |
| `lib/config/event.test.ts` | Unit tests cho `isPrelaunchMode()` (TDD — viết trước implement) |
| `tests/e2e/countdown.spec.ts` | E2E tests cho routing: auth redirect, isPrelaunch routing, event-open redirect |

### Modified Files

| File | Changes |
|---|---|
| `app/page.tsx` | Chèn `isPrelaunchMode()` check + redirect logic sau `getUser()` (~8 lines) |
| `app/_components/countdown-timer.tsx` | Patch 1: thêm `role="timer"` + `aria-live="polite"` + `aria-label` per unit. Patch 2: `days: Math.min(days, 99)` trong `computeRemaining` |
| `app/_components/countdown-timer.test.tsx` | Thêm tests cho Patch 1 (aria attrs) + Patch 2 (DAYS cap=99) |
| `.env.example` | Thêm `NEXT_PUBLIC_EVENT_DATETIME` và `NEXT_PUBLIC_PRELAUNCH_MODE` |

### Dependencies

Không cần thêm package mới. Tất cả đã có trong project.

---

## Implementation Approach

### Phase 0: Env + Config

- Thêm `NEXT_PUBLIC_EVENT_DATETIME` và `NEXT_PUBLIC_PRELAUNCH_MODE` vào `.env.example`
- Tạo và test `lib/config/event.ts` theo TDD

### Phase 1: Foundation — isPrelaunch helper (US1 + US2 + US3)

**TDD**: Viết `lib/config/event.test.ts` trước, confirm fail, implement `lib/config/event.ts`, confirm pass.

Test cases cho `isPrelaunchMode()`:
- `NEXT_PUBLIC_EVENT_DATETIME` tương lai → `true`
- `NEXT_PUBLIC_EVENT_DATETIME` quá khứ → `false`
- `NEXT_PUBLIC_EVENT_DATETIME` undefined/malformed → `false` (fail-safe)
- `NEXT_PUBLIC_PRELAUNCH_MODE=true` → `true` (override)
- `NEXT_PUBLIC_PRELAUNCH_MODE=false` → `false` (override)

### Phase 2: Root Router — app/page.tsx (US3)

**TDD**: E2E test trước (`tests/e2e/countdown.spec.ts`, skip scenarios cần auth).

Modify `app/page.tsx`:
- Import `isPrelaunchMode` từ `lib/config/event`
- Thêm 5–8 lines routing logic

### Phase 3: CountdownTimer patches + Countdown Page (US1 + US2)

**Step 3a — Patch CountdownTimer (TDD)**:
- Viết failing tests trước: aria attrs + DAYS cap=99
- Apply Patch 1 + Patch 2 vào `countdown-timer.tsx`
- Confirm all tests pass

**Step 3b — Countdown Page**:
- **TDD**: Viết E2E tests trước cho auth redirect + isPrelaunch guard (add to `countdown.spec.ts`)
- Implement `app/countdown/page.tsx`:
  - Auth guard: `getUser()` → `redirect('/login')` if null
  - isPrelaunch guard: `isPrelaunchMode() === false` → `redirect('/')`
  - Page layout: gọi `query_section(screenId="8PJQswPZmU")` từ Figma để lấy visual details (background, logo, spacing tokens)
  - Render `<CountdownTimer />`

### Phase 4: Polish + Validation

- Verify responsive layout `/countdown` trên mobile, tablet, desktop
- Run full test suite: `npm test` + Playwright E2E
- Confirm `NEXT_PUBLIC_PRELAUNCH_MODE` documented và có thể override dễ dàng

---

## Integration Testing Strategy

### Test Scope

- **Component ↔ Page**: `CountdownTimer` renders trong countdown page layout
- **Routing**: `/` + `/countdown` routing logic (isPrelaunch × auth state = 6 scenarios)
- **isPrelaunch helper**: pure unit tests

### Test Categories

| Category | Applicable | Key Scenarios |
|---|---|---|
| UI ↔ Logic | Yes | CountdownTimer trong countdown page layout |
| App ↔ Auth | Yes | auth guard trên `/countdown`, root router logic |
| App ↔ Data Layer | No | N/A — static config |

### Mocking Strategy

| Dependency | Strategy | Rationale |
|---|---|---|
| `process.env.*` | `vi.stubEnv` | Pure unit test, không cần real env |
| Supabase auth | Real (Playwright fixture) | Auth state cần real session cho E2E |
| `Date.now()` | `vi.useFakeTimers` | Cho `isPrelaunchMode()` time-based test |

### Test Scenarios Outline

1. **Unit: `isPrelaunchMode()`**
   - [ ] Future date → true
   - [ ] Past date → false
   - [ ] No env var → false (fail-safe)
   - [ ] Malformed date → false (fail-safe)
   - [ ] Override `NEXT_PUBLIC_PRELAUNCH_MODE=true` → true
   - [ ] Override `NEXT_PUBLIC_PRELAUNCH_MODE=false` → false

2. **E2E: Routing (US3)**
   - [ ] Unauthenticated + `/` + isPrelaunch=true → `/login`
   - [ ] Unauthenticated + `/countdown` → `/login`
   - [ ] Authenticated + `/` + isPrelaunch=true → `/countdown`
   - [ ] Authenticated + `/` + isPrelaunch=false → homepage rendered (not redirect)
   - [ ] Authenticated + `/countdown` + isPrelaunch=false → `/`
   - [ ] Expired session + `/countdown` → `/login` (session treated as unauthenticated — US3 Scenario 7)

3. **E2E: Countdown display (US1 + US2)**
   - [ ] Authenticated + `/countdown` + isPrelaunch=true → DAYS/HOURS/MINUTES visible
   - [ ] Past event datetime → all `00`

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| `CountdownTimer` accessibility gaps (`role="timer"`, `aria-label`) | Low | Medium | Verify và patch trong Phase 4; existing tests cover display logic |
| Figma design layout for `/countdown` page unknown (no design-style.md) | Medium | Low | Use `query_section(screenId="8PJQswPZmU")` at implement time |
| Root `app/page.tsx` isPrelaunch check adds latency (extra auth call) | Low | Low | Auth call already exists; only add in isPrelaunch=true branch |
| `NEXT_PUBLIC_PRELAUNCH_MODE` override forgotten in production | Low | High | Document in `.env.example` + add check in Phase 4 polish |

---

## Dependencies & Prerequisites

- [x] `constitution.md` — đã đọc
- [x] `spec.md` — đã review và fix
- [x] `CountdownTimer` — đã implement + tested
- [x] Auth pattern — đã có trong `awards-information/page.tsx`
- [ ] `NEXT_PUBLIC_EVENT_DATETIME` value — cần cấu hình trong `.env.local` trước khi chạy dev

---

## Notes

- **Env var name**: Spec ban đầu dùng `NEXT_PUBLIC_EVENT_DATE`; code hiện tại dùng `NEXT_PUBLIC_EVENT_DATETIME`. Đã align spec về `NEXT_PUBLIC_EVENT_DATETIME`.
- **CountdownTimer "Comming soon" label**: Có typo trong existing component (double-m). Out of scope — không sửa trong plan này.
- **design-style.md**: Chưa có. Implementer dùng `query_section(screenId="8PJQswPZmU")` khi implement UI của countdown page. Không block planning hay task breakdown.
- **Header/Footer trên countdown page**: Chưa rõ từ spec — Figma design sẽ xác định. Nếu không có → page layout chỉ gồm centered `<CountdownTimer />`.

---

## Next Steps

1. Run `/momorph.tasks` để generate task breakdown
2. Implement theo thứ tự: env config → `lib/config/event.ts` (TDD) → `app/page.tsx` modify → `app/countdown/page.tsx` (TDD) → accessibility polish
