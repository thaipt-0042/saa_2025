# Tasks: Hệ thống giải (Awards Information)

**Frame**: `zFYDgyj_pD-HeThongGiai`
**Prerequisites**: spec.md ✅ | plan.md ✅ | design-style.md ⚠️ (không có — fetch via `query_section` khi implement UI)

> **Note**: `design-style.md` chưa có. Implementer dùng MoMorph `query_section(screenId="zFYDgyj_pD")` để lấy CSS/token khi cần. Không block implementation.

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

- [x] T001 Create directory `app/awards-information/` và `app/awards-information/_components/` per plan

---

## Phase 2: Foundation (Blocking — MUST complete before US phases)

**Purpose**: Mở rộng data config — required by US1, US2, US3

**⚠️ CRITICAL**: Hoàn thành phase này trước khi bắt đầu bất kỳ user story nào

- [x] T002 Extend `AwardConfig` interface với 4 optional fields (`quantity?: string`, `unit?: string`, `value?: string | string[]`, `valueLabel?: string | string[]`) in `lib/homepage/awards.config.ts`
- [x] T003 Fill canonical data vào `AWARDS` array (quantity/unit/value/valueLabel cho 6 awards theo spec) in `lib/homepage/awards.config.ts`

**Checkpoint**: `AwardConfig` và `AWARDS` data hoàn chỉnh — user stories có thể bắt đầu

---

## Phase 3: User Story 1 — Xem danh sách hạng mục giải thưởng (Priority: P1) 🎯 MVP

**Goal**: Trang `/awards-information` hiển thị đầy đủ 6 hạng mục với title, description, quantity, unit, value. Auth guard redirect unauthenticated → `/login`.

**Independent Test**: Truy cập `/awards-information` với session hợp lệ → 6 thẻ giải thưởng hiển thị đúng data. Truy cập không auth → redirect `/login`.

### Tests (US1) — viết TRƯỚC khi implement

- [x] T004 [P] [US1] Write failing unit test for `AwardInfoBlock`: renders title, quantity, unit, single value, multi-value (Signature 2025), id=slug, image alt in `app/awards-information/_components/award-info-block.test.tsx`
- [x] T005 [P] [US1] Write failing E2E test for US1 scenarios: authenticated → 6 awards display in order; unauthenticated → redirect `/login` in `tests/e2e/awards-information.spec.ts`

### Implementation (US1)

- [x] T006 [US1] Implement `AwardInfoBlock` Server Component: receives `AwardConfig` prop, renders image (`imageBg`), title, description, quantity+unit, value(s), `id={slug}` anchor in `app/awards-information/_components/award-info-block.tsx`
- [x] T007 [US1] Implement `app/awards-information/page.tsx` as async Server Component: SSR auth guard (`createClient().auth.getUser()` → redirect if null), Keyvisual banner, Title section, map 6 `AwardInfoBlock` components, `Header` with `currentPath="/awards-information"`, `Footer`

**Checkpoint**: US1 complete — 6 awards visible, auth guard works, E2E + unit tests pass

---

## Phase 4: User Story 2 — Điều hướng nhanh bằng menu bên trái (Priority: P1)

**Goal**: Sticky left nav với 6 items. Click item → smooth scroll đến section + set active. Scrollspy tự động active item khi cuộn thủ công. URL hash on load → jump + active.

**Independent Test**: Click "Best Manager" trong menu → trang cuộn đến section Best Manager, menu item Best Manager active, các item khác inactive.

### Tests (US2) — viết TRƯỚC khi implement

- [x] T008 [US2] Write failing unit tests for `AwardsNav`: default activeSlug='top-talent', click item → activeSlug changes, `aria-current="true"` on active item only, click invalid section → no JS error, hover state in `app/awards-information/_components/awards-nav.test.tsx`

### Implementation (US2)

- [x] T009 [US2] Implement `AwardsNav` Client Component (`'use client'`): `useState<string>('top-talent')` for `activeSlug`, `useState<boolean>(false)` for `isScrolling`, click handler: set `isScrolling=true` → `scrollIntoView({behavior:'smooth',block:'start'})` → setTimeout 100ms reset `isScrolling`, `IntersectionObserver` scrollspy (disabled when `isScrolling`), URL hash on mount (`useEffect`: read `window.location.hash`, set activeSlug + scroll), sticky layout (`position:sticky; top:80px`), `aria-current="true"` on active item, nav `role="navigation" aria-label="Danh mục giải thưởng"` in `app/awards-information/_components/awards-nav.tsx`
- [x] T010 [US2] Add `scroll-margin-top` CSS to award section elements and verify `id={award.slug}` prop is used correctly in `app/awards-information/_components/award-info-block.tsx`
- [x] T011 [US2] Integrate `AwardsNav` into `page.tsx` 2-column layout: `flex` row with `AwardsNav` (left, sticky column) + scrollable content column (6 `AwardInfoBlock`); responsive: `lg:flex-row`, mobile: nav above content in `app/awards-information/page.tsx`
- [x] T012 [US2] Extend E2E test: click nav "Best Manager" → scroll + active state; URL hash `#top-project` → active on load; scrollspy auto-active on manual scroll in `tests/e2e/awards-information.spec.ts`

**Checkpoint**: US1 + US2 complete — menu navigation, scrollspy, URL hash, sticky nav all work

---

## Phase 5: User Story 3 — Điều hướng tới Sun* Kudos (Priority: P2)

**Goal**: Banner Sun* Kudos cuối trang với nút "Chi tiết" → `/sun-kudos` same-tab navigation.

**Independent Test**: Click "Chi tiết" trong Sun* Kudos banner → điều hướng tới `/sun-kudos` cùng tab.

### Implementation (US3)

- [x] T013 [P] [US3] Integrate `KudosSection` (reuse `app/_components/kudos-section.tsx`) vào `app/awards-information/page.tsx` bên dưới 6 award blocks
- [x] T014 [P] [US3] Add E2E test: Sun* Kudos banner present, "Chi tiết" click → navigate `/sun-kudos` same tab in `tests/e2e/awards-information.spec.ts`

**Checkpoint**: Tất cả 3 user stories complete

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, keyboard nav, final validation

- [x] T015 [P] Verify accessibility requirements: `<nav role="navigation" aria-label="Danh mục giải thưởng">`, `aria-current="true"` on active item, `alt="Keyvisual Sun* Annual Award 2025"`, award image alt texts, `aria-label="Xem chi tiết Sun* Kudos"` in `app/awards-information/_components/`
- [x] T016 Verify keyboard navigation: Tab focus through nav items, Enter/Space activates item in `app/awards-information/_components/awards-nav.tsx`
- [x] T017 [P] Run full test suite (`npm test` + Playwright E2E) and confirm all tests pass

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup) → Phase 2 (Foundation) → Phase 3 (US1) → Phase 4 (US2) → Phase 5 (US3) → Phase 6 (Polish)
```

- **Phase 1**: Không phụ thuộc — bắt đầu ngay
- **Phase 2**: Phụ thuộc Phase 1 — **BLOCKS** tất cả user stories
- **Phase 3 (US1)**: Phụ thuộc Phase 2 hoàn thành
- **Phase 4 (US2)**: Phụ thuộc Phase 3 hoàn thành (AwardInfoBlock cần có `id` prop trước khi nav scroll tới)
- **Phase 5 (US3)**: Có thể chạy song song với Phase 4 (T013, T014 độc lập)
- **Phase 6**: Phụ thuộc Phase 3+4+5 hoàn thành

### Within Each Phase — TDD Order

```
Test (failing) → Confirm failing → Implement → Confirm passing
```

- T004, T005 phải FAIL trước khi bắt đầu T006, T007
- T008 phải FAIL trước khi bắt đầu T009, T010, T011

### Parallel Opportunities

| Parallel Group | Tasks | Condition |
|---|---|---|
| US1 tests | T004, T005 | Sau Phase 2 complete |
| US3 integrate | T013, T014 | Sau Phase 3 complete, độc lập với Phase 4 |
| Polish | T015, T017 | Sau Phase 5 complete |

---

## Implementation Strategy

### MVP First (Recommended)

1. Complete Phase 1 + 2 (Setup + Data)
2. Complete Phase 3 (US1 only — 6 awards + auth guard)
3. **STOP và VALIDATE**: `npm test`, Playwright auth redirect test
4. Complete Phase 4 (US2 — nav + scrollspy)
5. Complete Phase 5 (US3 — Kudos CTA)
6. Phase 6 (Polish)

### Incremental Delivery

```
T001→T002→T003 (Foundation)
  → T004,T005 (Tests US1) → T006,T007 (Impl US1) → VALIDATE
  → T008 (Tests US2) → T009,T010,T011,T012 (Impl US2) → VALIDATE
  → T013,T014 (US3) → T015,T016,T017 (Polish)
```

---

## Notes

- `design-style.md` chưa có: Dùng `query_section(screenId="zFYDgyj_pD", nodeId="<NodeID>")` để lấy CSS token khi implement từng component. Node IDs có trong spec.md Screen Components table.
- Sau mỗi task commit với conventional format: `feat(awards): ...`
- `kudos-section.tsx` có inline styles (pixel values) — reuse as-is, không refactor trong scope này
- Codebase hiện dùng `@vitest-environment happy-dom` docblock cho component tests
- Mock pattern cho Client Components: `vi.hoisted()` cho functions dùng trong `vi.mock()` factories
