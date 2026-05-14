# Tasks: Countdown — Prelaunch Page

**Frame**: `8PJQswPZmU-CountdownPrelaunch`
**Prerequisites**: spec.md ✅ | plan.md ✅ | design-style.md ⚠️ (không có — fetch via `query_section(screenId="8PJQswPZmU")` khi implement UI)

> **Note**: `design-style.md` chưa có. Implementer dùng MoMorph `query_section(screenId="8PJQswPZmU")` để lấy CSS/token khi implement page layout `/countdown`. Không block task breakdown.

---

## Task Format

```
- [ ] T### [P?] [Story?] Description | file/path.ts
```

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this belongs to (US1, US2, US3)
- **TDD**: Tests MUST be written and confirmed failing BEFORE implementation (Constitution Principle III)

---

## Phase 1: Setup

**Purpose**: Tạo directory structure cho feature

- [x] T001 [P] Create directory `app/countdown/` per plan | app/countdown/
- [x] T002 [P] Create directory `lib/config/` (nếu chưa tồn tại) | lib/config/

---

## Phase 2: Foundation (Blocking — MUST complete before US phases)

**Purpose**: `isPrelaunchMode()` helper — required by US1, US2, US3

**⚠️ CRITICAL**: Hoàn thành phase này trước khi bắt đầu bất kỳ user story nào

- [x] T003 Add `NEXT_PUBLIC_EVENT_DATETIME` và `NEXT_PUBLIC_PRELAUNCH_MODE` (với comments) vào `.env.example` | .env.example
- [x] T004 Write failing unit tests cho `isPrelaunchMode()` — 6 scenarios: future date→true, past date→false, undefined env→false (fail-safe), malformed date→false (fail-safe), override=true→true, override=false→false | lib/config/event.test.ts
- [x] T005 Implement `isPrelaunchMode()` trong `lib/config/event.ts` — confirm T004 tests pass | lib/config/event.ts

**Checkpoint**: `isPrelaunchMode()` unit tests xanh — user stories có thể bắt đầu

---

## Phase 3: User Story 1 — Xem Real-Time Countdown Timer (Priority: P1) 🎯 MVP

**Goal**: Trang `/countdown` hiển thị DAYS/HOURS/MINUTES đúng, tự cập nhật mỗi 60s. Auth guard + isPrelaunch guard hoạt động.

**Independent Test**: Mở `/countdown` với session hợp lệ + `NEXT_PUBLIC_PRELAUNCH_MODE=true` → 3 countdown units visible với giá trị đúng. Wait 60s → values update.

### Tests (US1) — viết TRƯỚC khi implement

- [x] T006 [P] [US1] Write failing unit tests cho CountdownTimer Patch 1 (aria: `role="timer"`, `aria-live`, `aria-label`) + Patch 2 (DAYS cap tại 99 khi value≥100) | app/_components/countdown-timer.test.tsx
- [x] T007 [P] [US1] Write failing E2E test cho US1: authenticated + `NEXT_PUBLIC_PRELAUNCH_MODE=true` → `/countdown` shows DAYS/HOURS/MINUTES labels + digit tiles | tests/e2e/countdown.spec.ts

### Implementation (US1)

- [x] T008 [US1] Apply Patch 1 vào `CountdownTimer`: thêm `role="timer"` + `aria-live="polite"` vào container; thêm `aria-label={`${value} ${label.toLowerCase()}`}` vào `CountdownUnit` | app/_components/countdown-timer.tsx
- [x] T009 [US1] Apply Patch 2 vào `computeRemaining`: `days: Math.min(days, 99)` — cap DAYS tại 99 cho MVP | app/_components/countdown-timer.tsx
- [x] T010 [US1] Implement `app/countdown/page.tsx` Server Component: auth guard, isPrelaunch guard, full-page layout với bg image + `<CountdownTimer />` | app/countdown/page.tsx

**Checkpoint**: `/countdown` accessible (auth + prelaunch=true), DAYS/HOURS/MINUTES hiển thị đúng, unit tests + E2E US1 pass

---

## Phase 4: User Story 2 — Timer Reaches Zero (Priority: P2)

**Goal**: Khi event datetime đã qua, tất cả units hiển thị `00`. Không có giá trị âm.

**Independent Test**: Set `NEXT_PUBLIC_EVENT_DATETIME` = past ISO date → navigate `/countdown` → DAYS=`00`, HOURS=`00`, MINUTES=`00`.

> **Note**: US2 phần lớn đã được cover bởi: (a) existing `computeRemaining` clamp `Math.max(0, diffMs)`, (b) Patch 2 (T009) cap DAYS≤99. Existing tests trong `countdown-timer.test.tsx` đã cover case past date. Chỉ cần thêm E2E verification.

### Tests (US2)

- [x] T011 [US2] Add E2E test cho past event datetime → tất cả digit tiles = "0" trong `countdown.spec.ts` | tests/e2e/countdown.spec.ts

**Checkpoint**: US1 + US2 complete — countdown display và zero-state hoạt động đúng

---

## Phase 5: User Story 3 — Routing & Access Control (Priority: P3)

**Goal**: Root `/` route correctly theo isPrelaunch + auth state. Direct access `/countdown` có guards đầy đủ.

**Independent Test**: `/` unauthenticated + `NEXT_PUBLIC_PRELAUNCH_MODE=true` → redirect `/login`. Authenticated + same → redirect `/countdown`.

### Tests (US3) — viết TRƯỚC khi implement

- [x] T012 [US3] Write failing E2E tests cho 6 routing scenarios: (1) unauthenticated+`/`+prelaunch→`/login`, (2) unauthenticated+`/countdown`→`/login`, (3) auth+`/`+prelaunch=true→`/countdown`, (4) auth+`/`+prelaunch=false→homepage rendered, (5) auth+`/countdown`+prelaunch=false→`/`, (6) expired session+`/countdown`→`/login` | tests/e2e/countdown.spec.ts

### Implementation (US3)

- [x] T013 [US3] Modify `app/page.tsx`: import `isPrelaunchMode` từ `lib/config/event`; chèn sau `getUser()` hiện có và trước `getProfile()`: `if (!user) redirect('/login'); if (isPrelaunchMode()) redirect('/countdown')` | app/page.tsx

**Checkpoint**: Tất cả 3 user stories complete — countdown page, timer zero-state, routing guards

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verification cuối + accessibility + responsive

- [x] T014 [P] Run full unit test suite `npm test` — confirm tất cả pass (countdown-timer, event.test) | 117 tests passed across 20 files
- [x] T015 [P] Run Playwright E2E suite — confirm routing + display scenarios pass | 2 active tests pass, 7 skipped (require auth fixture)
- [ ] T016 Manual verify: set `NEXT_PUBLIC_PRELAUNCH_MODE=true` trong `.env.local`, start dev server, kiểm tra `/` → redirect `/countdown`, `/countdown` shows timer, sign out → redirect `/login` | (manual dev test)

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup) → Phase 2 (Foundation) → Phase 3 (US1) → Phase 4 (US2) → Phase 5 (US3) → Phase 6 (Polish)
```

- **Phase 1**: Không phụ thuộc — bắt đầu ngay, T001 và T002 chạy song song
- **Phase 2**: Phụ thuộc Phase 1 — **BLOCKS** tất cả user stories
- **Phase 3 (US1)**: Phụ thuộc Phase 2. T006 và T007 song song (khác file). T008→T009 tuần tự (cùng file). T010 sau T008+T009.
- **Phase 4 (US2)**: Phụ thuộc Phase 3 (T010 phải có trước để test E2E `countdown.spec.ts`)
- **Phase 5 (US3)**: Phụ thuộc Phase 4 (T012 là E2E test cùng file, T013 depends on T005 isPrelaunchMode)
- **Phase 6**: Phụ thuộc Phase 3+4+5 hoàn thành

### Within Each Phase — TDD Order

```
Test (failing) → Confirm failing → Implement → Confirm passing
```

- T006, T007 phải FAIL trước khi bắt đầu T008, T009, T010
- T012 phải FAIL trước khi bắt đầu T013

### Parallel Opportunities

| Parallel Group | Tasks | Condition |
|---|---|---|
| Setup | T001, T002 | Phase 1 — chạy ngay |
| US1 tests | T006, T007 | Sau Phase 2 complete — khác file |
| Polish validation | T014, T015 | Sau Phase 5 complete |

---

## Implementation Strategy

### MVP First (Recommended)

1. Complete Phase 1 + 2 (Setup + Foundation)
2. Complete Phase 3 (US1 — countdown page display + patches)
3. **STOP và VALIDATE**: `npm test`, E2E US1 pass, manual verify `/countdown`
4. Complete Phase 4 (US2 — timer zero-state E2E)
5. Complete Phase 5 (US3 — routing)
6. Phase 6 (Polish)

### Incremental Delivery

```
T001,T002 (Setup) → T003→T004→T005 (Foundation)
  → T006,T007 (Tests US1) → T008→T009→T010 (Impl US1) → VALIDATE
  → T011 (E2E US2) → VALIDATE
  → T012 (Tests US3) → T013 (Impl US3) → VALIDATE
  → T014,T015,T016 (Polish)
```

---

## Notes

- `CountdownTimer` đã implement sẵn tại `app/_components/countdown-timer.tsx` — T008+T009 chỉ là patch nhỏ, không rewrite
- Existing tests tại `app/_components/countdown-timer.test.tsx` cover US1 + US2 display logic — T006 chỉ thêm aria + cap tests
- `design-style.md` chưa có: dùng `query_section(screenId="8PJQswPZmU", nodeId="<NodeID>")` để lấy CSS token khi implement T010. Node IDs: `2268:35139` (DAYS), `2268:35144` (HOURS), `2268:35149` (MINUTES)
- Sau mỗi task commit với conventional format: `feat(countdown): ...`
- E2E routing tests (US3) cần auth fixture — xem `tests/e2e/` cho pattern hiện có
- `NEXT_PUBLIC_PRELAUNCH_MODE=true` trong `.env.local` để test prelaunch state khi dev
