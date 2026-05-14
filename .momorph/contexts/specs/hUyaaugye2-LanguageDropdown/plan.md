# Implementation Plan: Language Dropdown

**Frame**: `hUyaaugye2-LanguageDropdown`
**Date**: 2026-05-15
**Spec**: `specs/hUyaaugye2-LanguageDropdown/spec.md`

---

## Summary

The `LanguageSwitcher` component (`app/components/language-switcher.tsx`) already exists and partially implements this feature (toggle open/close, cookie write, `router.refresh()`, ARIA roles, 5 passing unit tests). This plan covers **three targeted patches** plus one asset download rather than a rewrite:

1. **Patch 0** (Asset): Download UK/EN flag SVG from Figma → `public/assets/login/icons/flag-en.svg`
2. **Patch 1** (Bug fix): Fix EN locale using wrong flag (`flag-vn.svg` → `flag-en.svg`)
3. **Patch 2** (FR-006): Add close-on-outside-click via `useRef` + `mousedown` listener
4. **Patch 3** (US3): Add full keyboard navigation — Escape closes, ArrowUp/Down moves focus, Tab closes and focuses next element

---

## Technical Context

**Language/Framework**: TypeScript / Next.js 16 App Router
**Primary Dependencies**: React 19, `next/navigation`, `next-intl`, Tailwind CSS 4
**Database**: N/A
**Testing**: Vitest + `@testing-library/react` + `userEvent`
**State Management**: Local `useState` only — no global store
**API Style**: N/A — client-side cookie write only

---

## Constitution Compliance Check

| Requirement | Constitution Rule | Status |
|-------------|-------------------|--------|
| Client Component | Principle I — `'use client'` only when interactivity required | ✅ Compliant |
| No localStorage | Principle VI — session data in HTTP cookies, not localStorage | ✅ Compliant |
| TypeScript strict | Principle V — `any` forbidden | ✅ Compliant |
| TDD | Principle III — failing test before implementation | 📋 Planned (per patch) |
| Design tokens | Principle II — CSS variables, no raw hex values | ⚠️ Existing code has raw values (`#0b0f12`, `#fff`, `fontWeight: 700`, `fontSize: 16`). Fixing these requires design tokens that may not exist yet — deferred to a dedicated design-token ticket. Patching only the behavior-level issues in scope. |
| Single responsibility | Principle V — one file = one concept | ✅ Component file stays under 100 lines after patches |
| Asset naming | Principle II — `kebab-case` under `public/assets/` | ✅ `flag-en.svg` |
| ESLint zero errors | Principle V — `eslint-config-next` must pass on every commit | ✅ Existing `eslint-disable-next-line` comment kept; new code must not introduce new errors |
| OWASP cookie security | Principle VI — cookies must use `SameSite=Lax`; no sensitive data in `localStorage` | ✅ Cookie written as `lang=<code>; path=/; max-age=31536000; SameSite=Lax` — non-sensitive locale value, not a session token |
| Responsive UI | Principle VII — layouts must work at all breakpoints | ✅ Dropdown is `position: absolute`, does not break header layout; no fixed-width pixel constraints added by patches |

---

## Architecture Decisions

### Component Structure

`LanguageSwitcher` remains a single Client Component at `app/components/language-switcher.tsx`. No new files needed — all patches apply to this file.

**Key changes per patch:**

| Patch | Change |
|-------|--------|
| 0 | Add `flag-en.svg` asset to `public/assets/login/icons/` |
| 1 | Fix `LOCALES[1].flag` to `'/assets/login/icons/flag-en.svg'` |
| 2 | Add `containerRef = useRef<HTMLDivElement>(null)` + `useEffect` mousedown handler; add Escape `onKeyDown` on `<ul>` |
| 3 | Add `focusedIndex` state + `triggerRef` + `optionRefs`; handle `onKeyDown` on button (Space/Enter) and on `<ul>` (ArrowUp/Down/Enter/Tab) |

### Close-on-outside-click Implementation

```typescript
const containerRef = useRef<HTMLDivElement>(null)

useEffect(() => {
  if (!open) return
  function handleMousedown(e: MouseEvent) {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setOpen(false)
    }
  }
  document.addEventListener('mousedown', handleMousedown)
  return () => document.removeEventListener('mousedown', handleMousedown)
}, [open])
```

Listener is only registered while `open === true` to minimize overhead.

### Keyboard Navigation Implementation

- **Trigger button `onKeyDown`**: Space/Enter → `setOpen(true)` + `setFocusedIndex(0)` (focus first option via `optionRefs.current[0]?.focus()`)
- **`<ul>` `onKeyDown`**: ArrowDown/Up → increment/decrement `focusedIndex` (clamped to 0–N-1) + call `optionRefs.current[newIndex]?.focus()`; Enter → `selectLocale(LOCALES[focusedIndex].code)`; Escape → `setOpen(false)` + `triggerRef.current?.focus()`; Tab → `setOpen(false)` (allow natural focus flow)
- **Additional state**: `const [focusedIndex, setFocusedIndex] = useState(-1)` — reset to `-1` when dropdown closes
- **Refs**: `triggerRef = useRef<HTMLButtonElement>(null)` (for Escape refocus); `optionRefs = useRef<(HTMLLIElement | null)[]>([])` (for ArrowKey focus)
- `e.preventDefault()` on ArrowUp/ArrowDown only (prevents page scroll)

---

## Project Structure

### Documentation

```text
.momorph/contexts/specs/hUyaaugye2-LanguageDropdown/
├── spec.md     # Feature specification ✅
├── plan.md     # This file ✅
└── tasks.md    # Task breakdown (next step)
```

### Source Code

```text
# Modified
app/components/language-switcher.tsx     # All 3 patches applied here

# New Asset
public/assets/login/icons/flag-en.svg    # UK flag for EN locale

# Modified (tests only)
app/components/language-switcher.test.tsx  # Add tests for patches 1-3
```

### New Files

| File | Purpose |
|------|---------|
| `public/assets/login/icons/flag-en.svg` | UK/EN flag icon downloaded from Figma |

### Modified Files

| File | Changes |
|------|---------|
| `app/components/language-switcher.tsx` | Fix EN flag path; add `containerRef` + mousedown effect; add keyboard handlers |
| `app/components/language-switcher.test.tsx` | Add tests for: correct EN flag, outside-click close, Escape close, keyboard nav |

### Dependencies

No new npm packages required.

---

## Implementation Strategy

### Phase 0: Asset Preparation

- Use `list_media_nodes(screenId="hUyaaugye2")` to find flag icon node IDs
- Use `get_media_file(fileKey, nodeId)` to download UK/EN flag SVG
- Save to `public/assets/login/icons/flag-en.svg`

### Phase 1: Bug Fix — EN Flag (Patch 1)

TDD cycle:
1. Write failing test: `currentLocale="en"` → button shows `flag-en.svg` img src
2. Confirm test fails
3. Fix `LOCALES[1].flag` → `'/assets/login/icons/flag-en.svg'`
4. Confirm test passes

### Phase 2: US2 — Close-on-outside-click + Escape (Patch 2)

TDD cycle:
1. Write failing tests: outside-click → dropdown closes; Escape → closes + refocuses trigger
2. Confirm tests fail
3. Implement `containerRef` + `useEffect` mousedown listener; add `onKeyDown` Escape handler
4. Confirm tests pass

### Phase 3: US3 — Keyboard Navigation (Patch 3)

TDD cycle:
1. Write failing tests: Enter/Space on trigger → opens + focuses first option; ArrowDown/Up → moves focus; Enter on option → selects + closes; Tab → closes
2. Confirm tests fail
3. Implement keyboard handlers on trigger button and `<ul>`
4. Confirm tests pass

### Phase 4: Polish

- Run full Vitest suite (`npx vitest run`) — all tests must pass (existing 5 + new tests)
- Run `npx tsc --noEmit` — zero TypeScript errors
- Run `npx eslint app/components/language-switcher.tsx` — zero new errors

### Edge Cases — Existing Code Already Handles

These spec edge cases require **no new implementation** — the existing code already covers them:

| Edge Case (spec) | How existing code handles it |
|------------------|------------------------------|
| Invalid locale cookie → default `vi` | `LOCALES.find(l => l.code === currentLocale) ?? LOCALES[0]` |
| Missing `currentLocale` prop (null/undefined) | Same `?? LOCALES[0]` fallback |
| Rapid clicks | `useState` toggle is synchronous — no race condition possible |

### E2E Testing — Out of Scope

SC-001 and SC-002 (verify all UI labels switch language) are E2E concerns. **Decision**: E2E tests for the language switcher are deferred — they require an authenticated session fixture and a running dev server with `next-intl` configured. The unit tests (Vitest + happy-dom) cover all behavioral contract requirements. A dedicated E2E test can be added to `tests/e2e/language-switcher.spec.ts` in a future polish pass.

---

## Integration Testing Strategy

### Test Scope

- [x] **Component/Module interactions**: `LanguageSwitcher` ↔ `useRouter` ↔ `document.cookie`
- [ ] **External dependencies**: N/A (no API)
- [ ] **Data layer**: N/A
- [x] **User workflows**: Click-to-switch, dismiss, keyboard navigation

### Test Categories

| Category | Applicable? | Key Scenarios |
|----------|-------------|---------------|
| UI ↔ Logic | Yes | Cookie write after locale select, dropdown open/close state |
| App ↔ External API | No | — |
| App ↔ Data Layer | No | — |
| Cross-platform | No | — |

### Mocking Strategy

| Dependency | Strategy | Rationale |
|------------|----------|-----------|
| `next/navigation` | Mock `useRouter` → `{ refresh: vi.fn() }` | Can't run Next.js router in Vitest/happy-dom |
| `next/image` | Mock → native `<img>` | happy-dom doesn't support Next.js image optimization |
| `document.cookie` | Real | happy-dom supports basic cookie API |
| `document.addEventListener` | Real (or spy) | Test outside-click via `userEvent.click` outside container |

### Test Scenarios Outline

1. **Happy Path**
   - [x] Current locale label + flag renders (existing)
   - [x] `aria-expanded` toggles on click (existing)
   - [x] Dropdown opens listing locales (existing)
   - [x] Cookie + refresh on locale select (existing)
   - [ ] EN locale shows `flag-en.svg` (new — Patch 1)

2. **Dismiss**
   - [ ] Click outside → dropdown closes, no locale change (new — Patch 2)
   - [ ] Escape → dropdown closes, focus returns to trigger (new — Patch 2)
   - [ ] Click trigger again → dropdown closes (toggle — already covered by aria-expanded test)

3. **Keyboard Navigation**
   - [ ] Enter on trigger → opens, first option focused (new — Patch 3)
   - [ ] ArrowDown → moves focus to next option (new — Patch 3)
   - [ ] ArrowUp → moves focus to previous option (new — Patch 3)
   - [ ] Enter on focused option → selects, closes (new — Patch 3)
   - [ ] Tab while open → closes (new — Patch 3)

### Coverage Goals

| Area | Target | Priority |
|------|--------|----------|
| Core switch behavior | 100% | High |
| Dismiss scenarios | 100% | High |
| Keyboard navigation | All 5 scenarios | Medium |

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| UK flag not in Figma media nodes | Low | Low | Use any publicly available UK flag SVG; confirm with design team |
| `happy-dom` doesn't support `focus()` correctly | Medium | Medium | Use `userEvent.tab()` or check `document.activeElement`; fallback to `data-testid` assertions |
| Keyboard handler conflicts with browser defaults | Low | Low | Use `e.preventDefault()` selectively (ArrowUp/Down only) |

---

## Dependencies & Prerequisites

### Required Before Start

- [x] `constitution.md` reviewed
- [x] `spec.md` approved (reviewed v1)
- [ ] UK/EN flag asset available in Figma (verify via `list_media_nodes`)

### External Dependencies

None.

---

## Next Steps

After plan approval:

1. **Run** `/momorph.tasks` to generate task breakdown
2. **Begin** implementation: Phase 0 (asset) → Phase 1 (flag fix) → Phase 2 (dismiss) → Phase 3 (keyboard nav)

---

## Notes

- **Existing tests must not regress**: The 5 existing tests in `language-switcher.test.tsx` must remain green after all patches.
- **No rewrite**: Patches are additive/minimal. Existing structure (`LOCALES` array, `selectLocale` function, JSX skeleton) stays unchanged.
- **Flag asset path convention**: VN flag is at `/assets/login/icons/flag-vn.svg`. EN flag goes to `/assets/login/icons/flag-en.svg` — consistent naming in the same directory.
- **`eslint-disable` comment**: Existing code has `// eslint-disable-next-line react-hooks/immutability` on the cookie write. Keep it — cookie write is intentional and the hook rule is a false positive here.
