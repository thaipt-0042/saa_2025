---
phase: 5
title: Tests & Polish
status: pending
priority: high
effort: M
blockedBy: [phase-04-ui-components.md]
---

# Phase 5 — Tests & Polish

TDD rule (Constitution Principle III): tests for each service function and API route must be
written before or alongside implementation, not after.

---

## 5.1 Service Unit Tests

### `lib/kudos/kudo-service.test.ts` (extend existing)

New test cases for `toggleLike`:

```typescript
describe('toggleLike', () => {
  it('throws SENDER_CANNOT_LIKE when sender tries to like own kudo')
  it('inserts like and returns liked: true, correct likeCount')
  it('deletes like on second call (unlike) and returns liked: false')
  it('is idempotent — double unlike does not throw')
})
```

New test cases for `listKudos`:

```typescript
describe('listKudos', () => {
  it('returns items ordered by created_at DESC')
  it('respects cursor — returns only items older than cursor')
  it('returns nextCursor: null when fewer items than limit')
  it('filters by hashtagId')
  it('filters by department')
})
```

New test cases for `getTopKudos`:

```typescript
describe('getTopKudos', () => {
  it('returns kudos sorted by total hearts DESC')
  it('respects limit param')
  it('includes likedByCurrentUser correctly')
})
```

### `lib/kudos/live-board-service.test.ts` (new)

```typescript
describe('getUserStats', () => {
  it('returns correct kudosReceived count')
  it('returns correct kudosSent count')
  it('returns correct heartsReceived (sum of hearts_added where sender = user)')
  it('returns zero counts for new user')
})
```

### `lib/departments/department-service.test.ts` (new)

```typescript
describe('getDepartments', () => {
  it('returns unique non-null departments sorted alphabetically')
  it('returns empty array when no departments set')
})
```

---

## 5.2 API Route Tests

### `app/api/kudos/route.test.ts` (extend existing)

```typescript
describe('GET /api/kudos', () => {
  it('returns 401 when unauthenticated')
  it('returns paginated items with nextCursor')
  it('returns nextCursor: null on last page')
  it('filters by hashtagId query param')
  it('filters by department query param')
})
```

### `app/api/kudos/[id]/like/route.test.ts` (new)

```typescript
describe('POST /api/kudos/[id]/like', () => {
  it('returns 401 when unauthenticated')
  it('returns 403 when sender tries to like own kudo')
  it('returns { liked: true, likeCount: 1 } on first like')
  it('returns { liked: false, likeCount: 0 } on unlike')
})
```

### `app/api/kudos/top/route.test.ts` (new)

```typescript
describe('GET /api/kudos/top', () => {
  it('returns 401 when unauthenticated')
  it('returns ≤ 5 items by default')
  it('respects limit query param, capped at 10')
})
```

### `app/api/live-board/stats/route.test.ts` (new)

```typescript
describe('GET /api/live-board/stats', () => {
  it('returns 401 when unauthenticated')
  it('returns stats object with all 5 fields')
})
```

---

## 5.3 Component Tests

### `app/sun-kudos/_components/kudo-action-bar.test.tsx` (new)

```typescript
describe('KudoActionBar', () => {
  it('heart button is disabled when senderIsCurrentUser=true')
  it('heart button is enabled when senderIsCurrentUser=false')
  it('clicking heart calls onLikeToggle with kudoId')
  it('heart icon is filled red when likedByCurrentUser=true')
  it('clicking copy link button calls navigator.clipboard.writeText')
  it('"Xem chi tiết" button only renders when showDetailButton=true')
})
```

### `app/sun-kudos/_components/carousel-nav.test.tsx` (new)

```typescript
describe('CarouselNav', () => {
  it('renders current/total as "1/5"')
  it('prev button is disabled when current === 1')
  it('next button is disabled when current === total')
  it('clicking prev calls onPrev')
  it('clicking next calls onNext')
})
```

### `app/sun-kudos/_components/filter-bar.test.tsx` (new)

```typescript
describe('FilterBar', () => {
  it('renders hashtag dropdown with all options')
  it('renders department dropdown with all options')
  it('calls onFilterChange with hashtagId when hashtag selected')
  it('calls onFilterChange with department when dept selected')
})
```

### `app/sun-kudos/_components/write-kudo-trigger.test.tsx` (new)

```typescript
describe('WriteKudoTrigger', () => {
  it('renders with placeholder text')
  it('has role="button" and aria-label')
  it('calls onClick when clicked')
})
```

---

## 5.4 Polish Checklist

### Accessibility
- [ ] All interactive elements have accessible labels (`aria-label`, `aria-disabled`)
- [ ] Heart button `aria-pressed={likedByCurrentUser}` for screen readers
- [ ] Carousel: `aria-label="Highlight Kudos carousel"`, `role="region"`
- [ ] Filter dropdowns: associate `<label>` with `<select>`

### Edge Cases
- [ ] Empty top kudos list → show "Hiện tại chưa có Kudos nào." in carousel area
- [ ] Empty All Kudos list → show "Hiện tại chưa có Kudos nào."
- [ ] No departments in DB → department dropdown empty (show "Tất cả" only)
- [ ] Kudo content > 3 lines → clamp with ellipsis (highlight card)
- [ ] Kudo content > 5 lines → clamp with ellipsis (feed card)
- [ ] Image gallery > 5 images → only show first 5
- [ ] Hashtags > 5 → show first 5 with "..." overflow
- [ ] Single sunner in spotlight board → renders without crash
- [ ] Empty recent gifts list → show "Chưa có dữ liệu"

### Performance
- [ ] Initial page load SSR data avoids waterfall (all 7 fetches in `Promise.all`)
- [ ] Spotlight board: memoize node positions (stable across re-renders, not random each time)
- [ ] Infinite scroll: debounce intersection observer callback

### Error Handling
- [ ] Like toggle API failure: revert optimistic update + show error toast
- [ ] Load more failure: show retry button
- [ ] Filter change failure: show error state in both sections

---

## 5.5 ESLint + Type Check

```bash
npx eslint "app/sun-kudos/**/*.tsx" "lib/kudos/**/*.ts" "lib/departments/**/*.ts" "app/api/kudos/**/*.ts" "app/api/live-board/**/*.ts" "app/api/departments/**/*.ts"
npx tsc --noEmit
```

---

## 5.6 Full Test Suite

```bash
npx vitest run
```

All 171+ existing tests must remain green. New tests target ≥ 80% coverage on new code.

---

## Todo

- [ ] Write `toggleLike` tests before implementing `toggleLike`
- [ ] Write `listKudos` tests before implementing `listKudos`
- [ ] Write `kudo-action-bar` tests before implementing component
- [ ] Write `carousel-nav` tests before implementing component
- [ ] Write API route tests before implementing each route
- [ ] Accessibility audit — keyboard navigation through carousel
- [ ] Edge case: empty state in all sections
- [ ] ESLint check all new files
- [ ] Type check: `npx tsc --noEmit` clean

## Success Criteria

- `npx vitest run` → all tests green, zero regressions
- `npx tsc --noEmit` → no type errors
- ESLint → no new errors
- Heart toggle works with optimistic update + revert on failure
- Accessibility: screen reader can navigate carousel and toggle heart
