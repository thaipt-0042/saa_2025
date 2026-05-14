# Tasks: Language Dropdown

**Frame**: `hUyaaugye2-LanguageDropdown`
**Prerequisites**: spec.md ✅ | plan.md ✅ | design-style.md ⚠️ (không có — behavior-only patches, không cần visual spec)

> **Note**: `design-style.md` không cần thiết cho feature này vì tất cả patches đều là behavior-level (flag asset, outside-click, keyboard nav). Không có new visual component nào được tạo.

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

**Purpose**: Chuẩn bị asset UK/EN flag từ Figma trước khi bắt đầu implement

- [x] T001 [P] Download UK/EN flag SVG từ Figma (screenId="hUyaaugye2", dùng `list_media_nodes` + `get_media_file`) → save to `public/assets/login/icons/flag-en.svg` | public/assets/login/icons/flag-en.svg
- [x] T002 [P] Verify existing 5 unit tests pass as baseline: `npx vitest run app/components/language-switcher.test.tsx` | app/components/language-switcher.test.tsx

---

## Phase 2: Foundation (Blocking Prerequisites)

**Purpose**: Không có foundational work riêng — T001+T002 đã cover setup. Foundation là existing component đang hoạt động.

**⚠️ CRITICAL**: T001 PHẢI hoàn thành trước Phase 3 (cần flag-en.svg để test pass)

---

## Phase 3: User Story 1 — Fix EN Flag Bug (Priority: P1) 🎯 MVP

**Goal**: EN locale hiển thị đúng UK flag (`flag-en.svg`) thay vì Vietnam flag.

**Independent Test**: Render `<LanguageSwitcher currentLocale="en" />` → button img src contains `flag-en.svg`.

- [x] T003 [US1] Write failing unit test: `currentLocale="en"` → trigger button img src = `/assets/login/icons/flag-en.svg` | app/components/language-switcher.test.tsx
- [x] T004 [US1] Fix bug: thay `LOCALES[1].flag` từ `flag-vn.svg` → `'/assets/login/icons/flag-en.svg'` và `LOCALES[1].flagAlt` → `'English flag'` | app/components/language-switcher.tsx
- [x] T005 [US1] Confirm T003 test passes + tất cả 5 existing tests vẫn xanh: `npx vitest run app/components/language-switcher.test.tsx` | app/components/language-switcher.test.tsx

**Checkpoint**: EN locale hiển thị UK flag đúng. 6 unit tests xanh.

---

## Phase 4: User Story 2 — Dismiss Dropdown (Priority: P2)

**Goal**: Dropdown đóng khi click outside hoặc nhấn Escape. Focus trả về trigger sau Escape.

**Independent Test**: (1) Open dropdown → click outside `<div.relative>` → `aria-expanded="false"`. (2) Open → press Escape → `aria-expanded="false"` + `document.activeElement` = trigger button.

- [x] T006 [US2] Write failing unit tests cho 2 dismiss scenarios: (a) click outside closes dropdown; (b) Escape key closes dropdown and returns focus to trigger button | app/components/language-switcher.test.tsx
- [x] T007 [US2] Add `triggerRef = useRef<HTMLButtonElement>(null)` + `containerRef = useRef<HTMLDivElement>(null)` to component; attach `ref={containerRef}` to outer `<div>` and `ref={triggerRef}` to `<button>` | app/components/language-switcher.tsx
- [x] T008 [US2] Implement `useEffect` mousedown outside-click handler: register `document.addEventListener('mousedown', handler)` when `open===true`, cleanup on close/unmount | app/components/language-switcher.tsx
- [x] T009 [US2] Add Escape `onKeyDown` handler to `<ul role="listbox">`: `if (e.key === 'Escape') { setOpen(false); triggerRef.current?.focus() }` | app/components/language-switcher.tsx
- [x] T010 [US2] Confirm T006 tests pass + all previous tests still green: `npx vitest run app/components/language-switcher.test.tsx` | app/components/language-switcher.test.tsx

**Checkpoint**: US1 + US2 complete. Outside-click và Escape dismiss work. 8+ unit tests xanh.

---

## Phase 5: User Story 3 — Keyboard Navigation (Priority: P3)

**Goal**: Full keyboard nav — Tab, Enter, Space, ArrowUp/Down để operate dropdown không cần mouse.

**Independent Test**: Tab to trigger → Enter → first option receives focus → ArrowDown → second option focused → Enter → locale selected + dropdown closed. Escape → dropdown closed + trigger focused.

- [x] T011 [US3] Write failing unit tests cho 5 keyboard scenarios: (a) Enter/Space on trigger → opens + first option focused; (b) ArrowDown → next option focused; (c) ArrowUp → previous option focused; (d) Enter on focused option → selects + closes; (e) Tab while open → closes | app/components/language-switcher.test.tsx
- [x] T012 [US3] Add `focusedIndex` state (`useState(-1)`) + `optionRefs = useRef<(HTMLLIElement | null)[]>([])` to component | app/components/language-switcher.tsx
- [x] T013 [US3] Implement `onKeyDown` on `<button>`: Space/Enter → `setOpen(true); setFocusedIndex(0); optionRefs.current[0]?.focus()` | app/components/language-switcher.tsx
- [x] T014 [US3] Implement `onKeyDown` on `<ul>`: ArrowDown → increment index + focus next ref (`e.preventDefault()`); ArrowUp → decrement + focus prev ref (`e.preventDefault()`); Enter → `selectLocale(LOCALES[focusedIndex].code)`; Tab → `setOpen(false); setFocusedIndex(-1)` | app/components/language-switcher.tsx
- [x] T015 [US3] Attach `ref={el => optionRefs.current[idx] = el}` to each `<li>` option element; reset `focusedIndex` to `-1` in `setOpen(false)` calls | app/components/language-switcher.tsx
- [x] T016 [US3] Confirm T011 tests pass + all previous tests still green: `npx vitest run app/components/language-switcher.test.tsx` | app/components/language-switcher.test.tsx

**Checkpoint**: All 3 user stories complete. Full keyboard nav works. All unit tests xanh.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation — tất cả tests pass, TypeScript clean, ESLint clean

- [x] T017 [P] Run full Vitest suite: `npx vitest run` — xác nhận tất cả 20 test files pass, không có regression | (project root)
- [x] T018 [P] Run TypeScript check: `npx tsc --noEmit` — zero errors | (project root)
- [x] T019 Run ESLint: `npx eslint app/components/language-switcher.tsx app/components/language-switcher.test.tsx` — zero new errors | (project root)

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup) → Phase 3 (US1) → Phase 4 (US2) → Phase 5 (US3) → Phase 6 (Polish)
```

- **Phase 1**: T001 (asset) và T002 (baseline verify) chạy song song — bắt đầu ngay
- **Phase 2**: Không có tasks riêng
- **Phase 3 (US1)**: Phụ thuộc T001 hoàn thành (cần `flag-en.svg`). T003→T004→T005 sequential (TDD)
- **Phase 4 (US2)**: Phụ thuộc Phase 3 complete (cần triggerRef từ T007 để T009 Escape handler hoạt động đúng). T006→T007→T008→T009→T010 sequential
- **Phase 5 (US3)**: Phụ thuộc Phase 4 complete (triggerRef + containerRef đã có). T011→T012→T013→T014→T015→T016 sequential
- **Phase 6**: Phụ thuộc Phase 5. T017, T018, T019 có thể chạy song song

### Within Each Phase — TDD Order

```
Write failing test → Confirm failing → Implement → Confirm passing
```

- T003 phải FAIL trước khi bắt đầu T004
- T006 phải FAIL trước khi bắt đầu T007-T009
- T011 phải FAIL trước khi bắt đầu T012-T015

### Parallel Opportunities

| Parallel Group | Tasks | Condition |
|---|---|---|
| Setup | T001, T002 | Phase 1 — start immediately |
| Polish | T017, T018 | After Phase 5 complete |

---

## Implementation Strategy

### MVP First (Recommended)

1. Complete Phase 1 (asset + baseline verify)
2. Complete Phase 3 (US1 — fix EN flag bug)
3. **STOP và VALIDATE**: `npx vitest run` — 6 tests xanh
4. Complete Phase 4 (US2 — dismiss)
5. Complete Phase 5 (US3 — keyboard nav)
6. Phase 6 (Polish)

### Incremental Delivery

```
T001,T002 (Setup) → T003→T004→T005 (US1) → VALIDATE
  → T006→T007→T008→T009→T010 (US2) → VALIDATE
  → T011→T012→T013→T014→T015→T016 (US3) → VALIDATE
  → T017,T018,T019 (Polish)
```

---

## Notes

- **Không rewrite**: Tất cả patches là additive — existing `LOCALES` array, `selectLocale` function, JSX skeleton giữ nguyên
- **Existing 5 tests không được regress**: Sau mỗi phase, confirm existing tests vẫn pass
- **`eslint-disable` comment**: Giữ nguyên `// eslint-disable-next-line react-hooks/immutability` trên dòng cookie write
- **focusedIndex reset**: Mỗi khi `setOpen(false)` được gọi (select, Escape, outside-click, Tab), phải kèm `setFocusedIndex(-1)`
- **`e.preventDefault()`**: Chỉ gọi cho ArrowUp và ArrowDown (ngăn page scroll), không gọi cho Enter/Space/Tab/Escape
- Figma screenId để download flag: `hUyaaugye2` (fileKey: `9ypp4enmFmdK3YAFJLIu6C`)
