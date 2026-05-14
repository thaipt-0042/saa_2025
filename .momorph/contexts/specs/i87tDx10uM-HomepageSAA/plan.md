# Implementation Plan: Homepage SAA

**Frame**: `i87tDx10uM-HomepageSAA`
**Date**: 2026-05-14
**Spec**: `specs/i87tDx10uM-HomepageSAA/spec.md`

---

## Summary

Replace the Next.js placeholder `app/page.tsx` with the full SAA 2025 homepage. The page is publicly
accessible; authenticated users additionally see a notification bell (with unread badge) and a
role-aware account dropdown. Core sections: hero + live countdown (client), static event info, six
award cards (static config), Sun* Kudos promo block, fixed widget button, enhanced header + footer
with full nav links.

Implementation follows the **Server Component default** (constitution Principle I). Only the
countdown timer, account dropdown, notification bell, and widget button require `'use client'`. All
other sections render as pure Server Components.

---

## Technical Context

**Language/Framework**: TypeScript / Next.js 16 App Router
**Primary Dependencies**: React 19, Tailwind CSS 4, next-intl 4, @supabase/ssr, Zod 4
**Database**: Supabase (PostgreSQL) — `profiles` table (role), `notifications` table (unread count)
**Testing**: Vitest 1.6 (unit/integration) + Playwright (E2E)
**State Management**: Local component state (`useState`) — no global store needed
**API Style**: Next.js Route Handlers (REST) for notification unread count

---

## Constitution Compliance Check

*GATE: Must pass before implementation can begin*

| Principle | Requirement | Approach | Status |
|-----------|-------------|----------|--------|
| I — Component-First | Server Components default; feature-based folders | `app/_components/` for page-specific; `'use client'` only for countdown, bell, dropdown, widget | ✅ |
| II — Design Tokens | No raw hex/px in component files | All values via `var(--color-*)` + Tailwind; new tokens in `globals.css` | ✅ |
| III — TDD | Failing test before each implementation task | Every phase starts with `*.test.ts(x)` written first | ✅ |
| IV — Layered Backend | Route handler → service → Supabase; no inline queries | `route.ts` → `notification-service.ts` → Supabase; `profile-service.ts` for role | ✅ |
| V — Clean Code | TypeScript strict; no `any`; Zod at boundaries; ≤40 lines per function | Zod schema on API response; `unknown` + narrowing where needed | ✅ |
| VI — Security (OWASP) | Session in HTTP-only cookies; no secrets in NEXT_PUBLIC_; parameterized queries | Supabase SSR cookies; role SSR; no secret env prefixed NEXT_PUBLIC_ | ✅ |
| VII — Responsive + A11y | Mobile-first; WCAG 2.1 AA; Core Web Vitals | Tailwind responsive prefixes; aria labels; LCP < 2.5 s targets | ✅ |

**Violations (if any)**:

| Violation | Justification | Alternative Rejected |
|-----------|---------------|---------------------|
| `NEXT_PUBLIC_EVENT_DATETIME` contains event datetime | Non-sensitive scheduling constant, read client-side by countdown; not a secret | Server-only env would require an API call for each client render — unnecessary overhead |

---

## Architecture Decisions

### Frontend Approach

- **Component Structure**: Feature-based, co-located under `app/_components/` for homepage-specific
  components; shared header/footer enhanced in `app/components/`.
- **Styling Strategy**: Tailwind utilities + CSS custom properties (`var(--color-*)`) in
  `app/globals.css`. New tokens added for nav link states and award card hover. No raw hex or px
  values in component files.
- **Data Fetching**:
  - Award list → static TypeScript config (`lib/homepage/awards.config.ts`) — no fetch.
  - User session + role → Supabase `auth.getUser()` + `profiles` query — SSR, passed as props.
  - Unread notification count → `GET /api/notifications/unread-count` — client fetch on mount.
  - Countdown → computed from `NEXT_PUBLIC_EVENT_DATETIME` env var — no fetch.
- **Countdown update**: `setInterval` at 60 000 ms cadence; cleanup on unmount.
- **Pre-launch mode decision**: Date-based auto-toggle — countdown shows `00 00 00` when event has
  passed; "Coming soon" label hides. No separate route needed.

### Backend Approach

- **API Design**: New route handler `app/api/notifications/unread-count/route.ts` (GET). Returns
  `{ count: number }`. Auth-gated: returns `{ count: 0 }` for unauthenticated requests (no 401 — UI
  simply shows no badge).
- **Data Access**: New `lib/notifications/notification-service.ts` — query `notifications` table
  (`COUNT WHERE user_id = $uid AND read_at IS NULL`). No business logic in route handler.
- **Validation**: Zod schema for API response shape.
- **Role resolution**: Extend `lib/auth/profile-service.ts` with `getProfile(userId, supabase)`
  returning `{ role: 'admin' | 'user'; ... }`. Already used during upsert — read variant added.
- **Client-side sign-out**: `AccountDropdown` must use the **browser Supabase client** from
  `lib/supabase/client.ts` (`createBrowserClient`) — NOT the server client — to call
  `supabase.auth.signOut()`. Server client is unavailable in `'use client'` components.

### Integration Points

- **Existing Services**:
  - `lib/auth/profile-service.ts` — extend with `getProfile()` for role lookup
  - `lib/supabase/server.ts` — `createClient()` for SSR session; `createServiceClient()` for service
  - `app/components/header.tsx` — enhanced with nav links + authenticated controls
  - `app/components/footer.tsx` — enhanced with full nav link set
  - `app/components/language-switcher.tsx` — reused as-is (already built for Login)
- **Shared Components**: `Header`, `Footer`, `LanguageSwitcher` — all reused from Login screen
- **API Contracts**: `GET /api/notifications/unread-count` — predicted endpoint
- **Header backward compatibility**: The enhanced `Header` adds optional `user: User | null` and
  `role: 'admin' | 'user' | null` props (both default to `null`). Login page (`app/login/page.tsx`)
  continues to work without changes — it does not pass these props and the header renders without
  authenticated controls in that context.

---

## Project Structure

### Documentation (this feature)

```text
.momorph/contexts/specs/i87tDx10uM-HomepageSAA/
├── spec.md              # Feature specification
├── plan.md              # This file
├── design-style.md      # REQUIRED before implementation (run momorph.design first)
└── tasks.md             # Task breakdown (next step)
```

### New Source Files

| File | Purpose |
|------|---------|
| `app/_components/hero-section.tsx` | Server Component wrapper: hero keyvisual image (lazy), B2 event info (static time/venue/Facebook), B4 Root Further paragraph, B3.1/B3.2 CTA buttons; renders `<CountdownTimer>` as child |
| `app/_components/hero-section.test.tsx` | Vitest tests: CTA hrefs, "Coming soon" toggle, event info static text |
| `app/_components/countdown-timer.tsx` | Client countdown: reads env var, setInterval, 2-digit pad, "Coming soon" toggle |
| `app/_components/countdown-timer.test.tsx` | Vitest unit tests for countdown logic |
| `app/_components/award-card.tsx` | Server Component: award thumbnail + title + description + "Chi tiết" link |
| `app/_components/award-card.test.tsx` | Vitest unit tests for award card rendering and href generation |
| `app/_components/award-grid.tsx` | Server Component: renders 6 AwardCard in responsive grid |
| `app/_components/kudos-section.tsx` | Server Component: Sun* Kudos promo block with "Chi tiết" link |
| `app/_components/notification-bell.tsx` | Client Component: fetches unread count, shows badge, toggles `<NotificationPanel>` |
| `app/_components/notification-bell.test.tsx` | Vitest unit tests for badge visibility logic |
| `app/_components/notification-panel.tsx` | Client Component: minimal placeholder overlay shell opened by bell click (content out of scope); renders as empty panel with close affordance |
| `app/_components/account-dropdown.tsx` | Client Component: role-aware menu (Profile / Sign out / Admin Dashboard); uses `lib/supabase/client.ts` (browser client) for sign-out |
| `app/_components/account-dropdown.test.tsx` | Vitest unit tests for role-based item visibility + keyboard nav + sign-out call |
| `app/_components/widget-button.tsx` | Client Component: fixed pill button, opens quick-action menu |
| `app/_components/widget-button.test.tsx` | Vitest unit tests: visibility on mount, toggle open/close |
| `lib/homepage/awards.config.ts` | Static award list: `{ slug, title, description, imageAsset }[]` |
| `lib/notifications/notification-service.ts` | Service: `getUnreadCount(userId, supabase)` |
| `lib/notifications/notification-service.test.ts` | Vitest unit tests for unread count service |
| `app/api/notifications/unread-count/route.ts` | GET route handler: auth-gated unread count endpoint |
| `app/api/notifications/unread-count/route.test.ts` | Integration tests for the API route |
| `supabase/migrations/YYYYMMDDHHMMSS_add_notifications_table.sql` | Create `notifications(id, user_id, content, read_at, created_at)` + RLS policies; create if table absent |
| `supabase/migrations/YYYYMMDDHHMMSS_add_profiles_role.sql` | Add `role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin','user'))` to `profiles`; RLS policies updated |
| `tests/e2e/homepage.spec.ts` | Playwright E2E: countdown, nav, award cards, auth features |

### Modified Source Files

| File | Changes |
|------|---------|
| `app/page.tsx` | Complete rewrite — full Homepage SAA server component; SSR resolves user + role + locale; renders all sections |
| `app/components/header.tsx` | Add nav links (About SAA / Awards Info / Kudos), optional `user: User \| null`, optional `role: 'admin' \| 'user' \| null`, `currentLocale: string`; renders bell + dropdown only when user != null; Login page unchanged (backward-compatible) |
| `app/components/footer.tsx` | Add nav links: "About SAA 2025" → `/`, "Awards Information" → `/awards-information`, "Sun* Kudos" → `/sun-kudos`, "Tiêu chuẩn chung" → `/standards` (placeholder); logo link → `/` |
| `app/globals.css` | Add tokens: `--color-nav-hover`, `--color-nav-active`, `--color-badge`, `--color-card-border`, `--color-card-glow` (exact values from design-style.md Phase 0) |
| `lib/auth/profile-service.ts` | Add `getProfile(userId: string, supabase: SupabaseClient): Promise<Profile \| null>` — SELECT from `profiles` WHERE id = userId |
| `lib/auth/profile-service.test.ts` | Add tests for `getProfile()`: found user, not-found user, DB error |
| `messages/vi.json` | Add `homepage` namespace: nav labels (About SAA 2025, Awards Information, Sun* Kudos), section headings, CTA text (ABOUT AWARDS, ABOUT KUDOS, Chi tiết), event info strings |
| `messages/en.json` | Add `homepage` namespace: translated equivalents |

### Dependencies

No new npm packages required. All needed libraries (`next-intl`, `@supabase/ssr`, `zod`,
`@testing-library/react`, `playwright`) are already installed.

---

## Implementation Strategy

### Phase 0: Design Style Fetch (prerequisite — run before Phase 1)

- Fetch `design-style.md` for `i87tDx10uM` using `momorph.design` or `query_section` MoMorph tool.
- Save to `.momorph/contexts/specs/i87tDx10uM-HomepageSAA/design-style.md`.
- Extract tokens for: hero section colors, award card dimensions/hover style, nav link active/hover
  colors, widget button style, notification badge color.
- Update `app/globals.css` with new CSS custom properties before any UI task begins.

### Phase 1: Foundation — Static Config + Profile Service Extension

Deliverables: award config, profile `getProfile()`, notification service, i18n keys.

- `lib/homepage/awards.config.ts` — export `AWARDS` constant (6 entries with slug, title,
  description placeholder, imageAsset path).
- Extend `lib/auth/profile-service.ts` with `getProfile()`.
- `lib/notifications/notification-service.ts` with `getUnreadCount()`.
- Add `homepage` namespace to `messages/vi.json` and `messages/en.json`.
- Update `app/globals.css` with new design tokens (once design-style.md is available).

### Phase 2: API Route — Notification Unread Count (US4)

Deliverables: working `GET /api/notifications/unread-count` endpoint.

- Failing test first (route.test.ts): authenticated returns count, unauthenticated returns 0.
- Implement thin route handler → `notification-service.getUnreadCount()`.
- Zod validation of response.

### Phase 3: Core UI — CountdownTimer + Hero Section (US1)

Deliverables: functional countdown with env-var target, correct display, "Coming soon" toggle; hero
section with event info, Root Further paragraph, and CTA buttons.

- Failing unit tests: correct 2-digit format, clamping at 0, invalid env var → `00 00 00`; CTA
  button hrefs (`/awards-information`, `/sun-kudos`); event info static text present.
- Implement `CountdownTimer` client component (`'use client'`): reads `NEXT_PUBLIC_EVENT_DATETIME`,
  `setInterval(60000)`, cleanup on unmount, 2-digit zero-pad, clamp at `00`.
- Implement `HeroSection` server component (`app/_components/hero-section.tsx`):
  - Hero keyvisual background image (`<Image loading="lazy">` — NOT priority, TR-006)
  - B2 static event info: time "18h30", venue "Nhà hát nghệ thuật quân đội", Facebook note
  - B3.1 "ABOUT AWARDS" CTA → `/awards-information`; B3.2 "ABOUT KUDOS" CTA → `/sun-kudos`
  - B4 Root Further paragraph (static translated text)
  - Renders `<CountdownTimer>` child in the hero area

### Phase 4: Core UI — Award Grid (US3)

Deliverables: 6 award cards with correct href anchors, responsive grid.

- Failing unit tests: each card href = `/awards-information#{slug}`; missing slug → base path.
- Implement `AwardCard` and `AwardGrid` server components.
- Responsive grid: 3-col desktop / 2-col tablet/mobile via Tailwind.

### Phase 5: Core UI — Notification Bell + Account Dropdown (US4)

Deliverables: authenticated controls in header, role-based menu items, keyboard nav.

- Failing tests:
  - Bell: badge visible when count > 0; hidden when 0 or null (loading); no render for unauthed.
  - Dropdown: Admin Dashboard present only for `role = 'admin'`; closes on Escape / outside click.
- Implement `NotificationBell` and `AccountDropdown` client components.
- Sign out action: call `supabase.auth.signOut()` then `router.push('/login')`.

### Phase 6: Header + Footer Enhancement (US2)

Deliverables: full nav links in header and footer, active state on homepage.

- Failing tests: active class on "About SAA 2025" nav item at `/`; all links have correct href.
- Update `Header` to accept `user: User | null` and `role: 'admin' | 'user' | null` props.
- Add nav links, notification bell slot (renders `<NotificationBell>` when user != null), account
  dropdown slot.
- Update `Footer` with full nav link set.

### Phase 7: Homepage Page Assembly (US1 + US2)

Deliverables: `app/page.tsx` complete, all sections wired, SSR session + role resolution.

- Implement `app/page.tsx` as Server Component:
  1. `createClient()` → `auth.getUser()` → resolve `user`.
  2. If user: `getProfile(user.id, supabase)` → resolve `role`.
  3. Read `lang` cookie → pass to Header.
  4. Render: Header (with user + role + locale), Hero section, Event info, Award grid,
     Kudos section, Widget button, Footer.
- Verify middleware does NOT redirect unauthenticated users from `/`.

### Phase 8: Kudos Section + Widget Button (US2 + US6)

Deliverables: static Kudos promo block, fixed widget button visible on scroll.

- Implement `KudosSection` server component with "Chi tiết" → `/sun-kudos`.
- Implement `WidgetButton` client component with fixed positioning and toggle open.

### Phase 9: Language Switcher Integration (US5)

Deliverables: language switching works on homepage (same as Login — component reused).

- No new component — `LanguageSwitcher` already built and wired into `Header`.
- Add homepage keys to both message files.
- Verify `lang` cookie persists across reload and page re-renders in correct locale.

### Phase 10: Polish + Accessibility

Deliverables: WCAG 2.1 AA, performance baseline, zero 404s (FR-015), edge cases.

- `aria-label` on all icon-only buttons: bell, account icon, widget button.
- `aria-expanded` on all dropdown triggers (account, language, widget).
- Focus ring visibility audit — all interactive elements keyboard-reachable.
- LCP < 2.5 s: hero keyvisual `<Image loading="lazy">`; header logo `<Image priority />`.
- Award card description: `line-clamp-2` (Tailwind) for 2-line truncation with ellipsis.
- Confirm `middleware.ts` matcher is `['/login']` only — homepage MUST remain public (no change needed but verify).
- **FR-015 link check**: Run `next build && next start`, then Playwright link-check script asserting
  all `<a href>` targets in header, footer, cards, and CTAs return HTTP 200 (or 308 redirect to 200).
  Fail if any 404 is detected.
- Run `@axe-core/playwright` accessibility audit: zero violations at AA level.

### Phase 11: E2E Tests (US1–US6)

Deliverables: `tests/e2e/homepage.spec.ts` covering all user stories.

- US1: countdown renders, decrements (mock datetime), shows `00 00 00` when expired.
- US2: nav link hrefs correct, active state on `/`, CTA buttons navigate correctly.
- US3: 6 award cards visible, each href resolves to `/awards-information#{slug}`.
- US4: authenticated session shows bell + dropdown; unauthenticated hides both.
- US5: language switch sets cookie, page re-renders in selected locale.
- US6: widget button fixed, visible on scroll.

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| `notifications` table not yet in Supabase | High | Medium | Migration file in Phase 1 (`supabase/migrations/…_add_notifications_table.sql`); API falls back to `{ count: 0 }` if table absent |
| `profiles.role` column not yet in schema | Medium | High | Migration file in Phase 1 (`supabase/migrations/…_add_profiles_role.sql`); DEFAULT `'user'` ensures all existing rows get safe role |
| Header prop drilling complexity | Low | Low | Header accepts typed props; page.tsx resolves SSR — clean vertical data flow |
| design-style.md missing (Homepage) | High | Medium | Phase 0 fetches it; all UI phases blocked until available |
| Countdown timezone mismatch | Low | Medium | Use UTC ISO-8601; document in env.example that `NEXT_PUBLIC_EVENT_DATETIME` must be UTC |
| Award assets not in `public/assets` | High | Low | Phase 0 downloads via `get_media_files`; placeholder images used in Phase 4 if not ready |

### Estimated Complexity

- **Frontend**: High — many new components, header/footer refactor, role-aware rendering
- **Backend**: Low — single thin API route, service layer extension only
- **Testing**: Medium — countdown logic, role-based rendering, E2E across auth states

---

## Integration Testing Strategy

### Test Scope

- [x] **Component/Module interactions**: CountdownTimer ↔ env var; NotificationBell ↔ API route; AccountDropdown ↔ sign-out action
- [x] **External dependencies**: Supabase session (mock in unit tests, real in E2E fixture); notification count API
- [x] **Data layer**: `profiles` query for role; `notifications` query for count
- [x] **User workflows**: Unauthenticated browse, authenticated browse (regular + admin), language switch, nav links

### Test Categories

| Category | Applicable? | Key Scenarios |
|----------|-------------|---------------|
| UI ↔ Logic | Yes | Countdown decrement, badge visibility, dropdown toggle, card href generation |
| Service ↔ Service | Yes | `getUnreadCount()` ↔ Supabase `notifications` table |
| App ↔ External API | Yes | `NotificationBell` ↔ `/api/notifications/unread-count` |
| App ↔ Data Layer | Yes | Profile role query; notification count query |
| Cross-platform | Yes | Responsive grid: 3-col desktop / 2-col mobile |

### Test Environment

- **Environment type**: Local (Vitest), Playwright browser
- **Test data strategy**: Mocked Supabase client in unit tests; session fixture in Playwright
- **Isolation approach**: Fresh state per test; `beforeEach` resets mocks

### Mocking Strategy

| Dependency Type | Strategy | Rationale |
|-----------------|----------|-----------|
| Supabase client (unit) | Mock via `vi.mock()` | No real DB needed for pure service logic |
| `/api/notifications/unread-count` (unit) | `vi.fn()` fetch mock | Isolate bell component from network |
| Supabase session (E2E) | Playwright storage state fixture | Replicate cookie-based auth used in Login E2E |
| `NEXT_PUBLIC_EVENT_DATETIME` | `vi.stubEnv()` | Deterministic countdown value in tests |

---

## Dependencies & Prerequisites

### Required Before Start

- [x] `constitution.md` reviewed and understood
- [x] `spec.md` approved by stakeholders
- [ ] `design-style.md` fetched for Homepage SAA — **run Phase 0 first**
- [ ] `notifications` DB table + RLS migration applied
- [ ] `profiles.role` column confirmed (add migration if absent)
- [ ] Award image assets downloaded to `public/assets/homepage/`

### External Dependencies

- `NEXT_PUBLIC_EVENT_DATETIME` env var — must be set in `.env.local` and CI (UTC ISO-8601)
- `NEXT_PUBLIC_SITE_URL` — already set
- Supabase project must have `notifications` table with at minimum: `id`, `user_id`, `read_at`

---

## Open Questions

- [ ] **Q1 — Profile route for "Profile" menu item**: Account dropdown links to profile page (route
  TBD in spec). Assume `/profile` as placeholder; update when profile screen is specced.
- [ ] **Q2 — "Tiêu chuẩn chung" route**: Footer link destination unknown. Assume `/standards` as
  placeholder; update when Common Standards screen is specced.
- [ ] **Q3 — Award image assets**: Are homepage award card images available in Figma media items? If
  not, use placeholder images in Phase 4 and swap when assets are ready.
- [ ] **Q4 — Notifications DB migration**: Does the `notifications` table exist in Supabase? If not,
  Phase 1 must include migration file.

---

## Next Steps

After plan approval:

1. **Run** `momorph.design` on `i87tDx10uM` to generate `design-style.md` (Phase 0 prerequisite)
2. **Run** `/momorph.tasks` to generate task breakdown from this plan
3. **Begin** implementation with Phase 1 (Foundation), parallelizing with Phase 0 (design fetch)
