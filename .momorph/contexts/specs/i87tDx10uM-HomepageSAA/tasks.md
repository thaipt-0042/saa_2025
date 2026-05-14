# Tasks: Homepage SAA

**Frame**: `i87tDx10uM-HomepageSAA`
**Prerequisites**: plan.md ✅, spec.md ✅, design-style.md ✅

---

## Task Format

```
- [ ] T### [P?] [US?] Description | file/path.ts
```

- **[P]**: Can run in parallel (different files, no blocking dependencies)
- **[US#]**: Which user story this belongs to (US1–US6)

---

## Phase 1: Setup

**Purpose**: Asset download, CSS tokens, and font setup — all UI tasks depend on this phase

- [x] T001 Download Figma homepage assets using MoMorph get_media_files (keyvisual BG, 6 award BG images, 6 award name SVGs, kudos BG, kudos logo, notification icon, user profile icon) to public/assets/homepage/ per design-style.md Assets Map | public/assets/homepage/
- [x] T002 [P] Add 4 new CSS tokens to app/globals.css :root block: --color-badge (#D4271D), --color-account-border (#998C5F), --color-card-glow (#FAE287), --color-nav-glow (#FAE287) | app/globals.css
- [x] T003 [P] Setup Digital Numbers font: check Google Fonts availability; if unavailable self-host as public/fonts/digital-numbers.woff2; add @font-face rule and --font-digital CSS variable to app/globals.css; fallback: monospace | app/globals.css, public/fonts/

---

## Phase 2: Foundation (Blocking Prerequisites)

**Purpose**: DB migrations, static config, backend services, and i18n keys required by all user stories

**⚠️ CRITICAL**: No user story implementation can begin until this phase is complete

- [x] T004 Create Supabase migration supabase/migrations/20260514000001_add_profiles_role.sql: ADD COLUMN role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin','user')) to profiles table; add RLS policies allowing users to read own role | supabase/migrations/20260514000001_add_profiles_role.sql
- [x] T005 [P] Create Supabase migration supabase/migrations/20260514000002_add_notifications_table.sql: CREATE TABLE notifications(id uuid PK DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, content text NOT NULL, read_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()); enable RLS; add policy: authenticated users can SELECT own rows | supabase/migrations/20260514000002_add_notifications_table.sql
- [x] T006 [P] Create lib/homepage/awards.config.ts: export AWARDS constant typed as AwardConfig[] with 6 entries (slug, title, description, imageAsset path) for: top-talent, top-project, top-project-leader, best-manager, signature-2025-creator, mvp-most-valuable-person | lib/homepage/awards.config.ts
- [x] T007 [P] Add homepage i18n namespace to messages/vi.json: nav labels (About SAA 2025, Awards Information, Sun* Kudos, Tiêu chuẩn chung), section headings (Sun* annual awards 2025, Hệ thống giải thưởng), CTA text (ABOUT AWARDS, ABOUT KUDOS, Chi tiết), event info (18h30, Nhà hát nghệ thuật quân đội, Facebook note), "Comming soon" label (preserve double-m typo exactly), Root Further body paragraphs | messages/vi.json
- [x] T008 [P] Add homepage i18n namespace to messages/en.json: translated equivalents of all keys from T007; preserve "Comming soon" typo in value to match Figma exactly | messages/en.json
- [x] T009 [P] Write failing tests for getProfile() in lib/auth/profile-service.test.ts (add to file if it already exists): found user returns {id, email, role, ...}, user not found returns null, Supabase DB error returns null safely | lib/auth/profile-service.test.ts
- [x] T010 Add getProfile(userId: string, supabase: SupabaseClient): Promise<Profile | null> to lib/auth/profile-service.ts — SELECT from profiles WHERE id = userId; on error log and return null | lib/auth/profile-service.ts
- [x] T011 [P] Write failing tests for getUnreadCount() in lib/notifications/notification-service.test.ts: authenticated user with 3 unread returns 3, zero unread returns 0, Supabase DB error returns 0 safely | lib/notifications/notification-service.test.ts
- [x] T012 [P] Create lib/notifications/notification-service.ts: implement getUnreadCount(userId: string, supabase: SupabaseClient): Promise<number> — COUNT(*) from notifications WHERE user_id = userId AND read_at IS NULL; on error return 0 | lib/notifications/notification-service.ts

**Checkpoint**: Foundation complete — T009 passes before T010 begins; T011 passes before T012 begins; all user story phases can now start

---

## Phase 3: User Story 1 — View homepage content and live countdown (P1) 🎯 MVP

**Goal**: Any visitor lands on the homepage and sees the ROOT FURTHER hero, a live countdown (DAYS/HOURS/MINUTES), static event info, and CTA buttons

**Independent Test**: Navigate to / without session cookie; assert hero content, 3 countdown units, and CTA buttons are visible. Set NEXT_PUBLIC_EVENT_DATETIME to invalid string → countdown shows `00 00 00`, no crash.

- [x] T013 [US1] Write failing unit tests in app/_components/countdown-timer.test.tsx: 2-digit zero-pad (5→"05"), clamps at "00" when event passed, invalid env var → "00 00 00" without crash, "Comming soon" label visible when eventStarted=false / hidden when eventStarted=true, setInterval called with 60000ms cadence | app/_components/countdown-timer.test.tsx
- [x] T014 [US1] Implement CountdownTimer ('use client') in app/_components/countdown-timer.tsx: reads NEXT_PUBLIC_EVENT_DATETIME, wraps parse in try/catch (invalid → safe fallback), setInterval(60000) computing DAYS/HOURS/MINUTES from now to target, clamps each unit at 0, clears interval on unmount, renders two 51×82px digit tiles per unit with Digital Numbers font, renders DAYS/HOURS/MINUTES labels, shows "Comming soon" when eventStarted=false | app/_components/countdown-timer.tsx
- [x] T015 [US1] Write failing tests in app/_components/hero-section.test.tsx: ABOUT AWARDS CTA href=/awards-information, ABOUT KUDOS CTA href=/sun-kudos, event info contains "18h30" and venue string, Root Further paragraph text is present, CountdownTimer component is rendered | app/_components/hero-section.test.tsx
- [x] T016 [US1] Implement HeroSection server component in app/_components/hero-section.tsx: hero keyvisual <Image loading="lazy" fill alt="..."> as absolute background, B2 static event info (time, venue, Facebook note — text from i18n), B4 Root Further paragraphs (from i18n homepage namespace, text-justify, 24px/700 Montserrat white), B3.1 ABOUT AWARDS CTA button (276×60px, border-radius-8, #FFEA9E bg) linking to /awards-information, B3.2 ABOUT KUDOS CTA linking to /sun-kudos, renders <CountdownTimer> child | app/_components/hero-section.tsx

**Checkpoint**: US1 complete and independently testable (run `vitest countdown-timer award-card hero-section`)

---

## Phase 4: User Story 2 — Navigate to other pages (P1)

**Goal**: Header nav links, footer links, and CTA buttons all work; active state on "About SAA 2025" at /

**Independent Test**: Assert each link href is correct. Assert active CSS class on "About SAA 2025" at pathname=/. Assert footer has all 4 nav link hrefs. Assert Kudos "Chi tiết" links to /sun-kudos.

- [x] T017 [US2] Write failing tests in app/components/header.test.tsx (create file if absent): "About SAA 2025" href=/, active class applied at pathname=/, "Awards Information" href=/awards-information, "Sun* Kudos" href=/sun-kudos; when user=null → no bell or dropdown rendered; when user!=null → bell and dropdown slots present | app/components/header.test.tsx
- [x] T018 [US2] Enhance app/components/header.tsx: add nav links array (About SAA 2025 →/, Awards Information → /awards-information, Sun* Kudos → /sun-kudos); add optional props user: User | null = null and role: 'admin' | 'user' | null = null; add currentPath prop to determine active state (border-bottom + text-shadow on active link); render <NotificationBell user={user}> when user!=null; render <AccountDropdown user={user} role={role}> when user!=null; backward-compatible — Login page continues to work without passing these props | app/components/header.tsx
- [x] T019 [P] [US2] Enhance app/components/footer.tsx: add SAA logo link (69×64px, →/), add nav links (About SAA 2025 →/, Awards Information → /awards-information, Sun* Kudos → /sun-kudos, Tiêu chuẩn chung → /standards), copyright text using var(--font-montserrat-alt) 16px/700; border-top: 1px solid var(--color-divider) | app/components/footer.tsx
- [x] T020 [P] [US2] Implement app/_components/kudos-section.tsx server component: Sun* Kudos promo section with kudos BG image (1120×500px), kudos logo (364×72px), description text (from i18n), D2.1 "Chi tiết" CTA button (126×56px, border-radius-4, #FFEA9E bg) linking to /sun-kudos | app/_components/kudos-section.tsx

**Checkpoint**: US2 complete and independently testable (nav links and footer work with static routing)

---

## Phase 5: User Story 3 — Browse award categories (P2)

**Goal**: Six award category cards with correct hashtag href anchors and responsive 3-col/2-col grid

**Independent Test**: Render AwardGrid with AWARDS config; assert 6 cards; each card href=/awards-information#{slug}; missing slug → /awards-information; description text truncated at 2 lines.

- [x] T021 [P] [US3] Write failing unit tests in app/_components/award-card.test.tsx: card renders image, title, description, "Chi tiết" link; href=/awards-information#top-talent for slug='top-talent'; href=/awards-information when slug is undefined; description has line-clamp-2 styling; "Chi tiết" link includes arrow icon | app/_components/award-card.test.tsx
- [x] T022 [P] [US3] Implement AwardCard server component in app/_components/award-card.tsx: card image (336×336px, border-radius-24, border var(--color-cta-primary), box-shadow with var(--color-card-glow), mix-blend-mode:screen on image), award title (24px/400 var(--color-cta-primary)), description (16px/400 white, line-clamp-2 overflow-hidden), "Chi tiết" link (16px/500 white, padding-y-4, arrow icon MM_MEDIA_Up 24×24) → /awards-information#{slug} or /awards-information when slug absent | app/_components/award-card.tsx
- [x] T023 [US3] Implement AwardGrid server component in app/_components/award-grid.tsx: import AWARDS from lib/homepage/awards.config.ts; render 6 AwardCards in responsive grid (grid grid-cols-2 lg:grid-cols-3 gap-20); section title "Hệ thống giải thưởng" (57px/700 var(--color-cta-primary)) and caption "Sun* annual awards 2025" (24px/700 white) with divider; card width 336px with 80px gap | app/_components/award-grid.tsx

**Checkpoint**: US3 complete and independently testable

---

## Phase 6: User Story 4 — Authenticated features: notifications and account menu (P2)

**Goal**: Logged-in users see notification bell with unread badge and role-aware account dropdown; unauthenticated users see neither

**Independent Test**: Inject Supabase session cookie → bell renders with badge when unread > 0; test admin vs regular role for Admin Dashboard option; sign-out calls supabase.auth.signOut() and redirects to /login.

- [x] T024 [P] [US4] Write failing tests in app/api/notifications/unread-count/route.test.ts: authenticated request returns 200 {count: N} with Zod-valid shape, unauthenticated request returns 200 {count: 0} (NOT 401), DB error returns 200 {count: 0} | app/api/notifications/unread-count/route.test.ts
- [x] T025 [P] [US4] Implement GET route in app/api/notifications/unread-count/route.ts: createClient() from @supabase/ssr; auth.getUser(); if no user return {count: 0}; call notification-service.getUnreadCount(user.id, supabase); Zod schema validates {count: number}; return NextResponse.json({count}) | app/api/notifications/unread-count/route.ts
- [x] T026 [P] [US4] Write failing unit tests in app/_components/notification-bell.test.tsx: badge (8×8px red) visible when unreadCount > 0, badge absent when count = 0, badge absent while loading (null state), bell not rendered when user prop is null | app/_components/notification-bell.test.tsx
- [x] T027 [US4] Implement NotificationBell client component ('use client') in app/_components/notification-bell.tsx: accepts user prop; fetches GET /api/notifications/unread-count on mount (only when user != null); stores unreadCount (null while loading); shows 8×8px badge with background: var(--color-badge) when count > 0; toggles NotificationPanel open/closed on click; aria-label on button; refetches when panel closes | app/_components/notification-bell.tsx
- [x] T028 [P] [US4] Implement NotificationPanel placeholder in app/_components/notification-panel.tsx: client component; accepts open: boolean and onClose: () => void props; renders a fixed/absolute overlay panel shell when open=true; close button calls onClose; empty body (notification list is out of scope per spec) | app/_components/notification-panel.tsx
- [x] T029 [P] [US4] Write failing unit tests in app/_components/account-dropdown.test.tsx: "Admin Dashboard" present when role='admin', absent when role='user'; "Profile" and "Sign out" present for all authenticated users; dropdown closes on Escape keydown; dropdown closes on outside mousedown click; sign-out calls supabase.auth.signOut() then router.push('/login'); Enter/Space on trigger toggles dropdown | app/_components/account-dropdown.test.tsx
- [x] T030 [US4] Implement AccountDropdown client component ('use client') in app/_components/account-dropdown.tsx: uses createClient() from lib/supabase/client.ts (browser client) for signOut(); open state toggle on trigger click; useEffect adds mousedown listener for outside-click close + keydown listener for Escape close on cleanup; renders: Profile link (→/profile placeholder), Sign out button, Admin Dashboard link (→/admin) only when role='admin'; aria-expanded on trigger; 40×40px account icon button with border: 1px solid var(--color-account-border), border-radius-4 | app/_components/account-dropdown.tsx

**Checkpoint**: US4 complete and independently testable with session fixtures

---

## Phase 7: User Story 5 — Switch language (P2)

**Goal**: Language switcher works on homepage; lang cookie persists across reload

**Independent Test**: Click A1.7 language button → VN/EN dropdown → select EN → lang cookie = 'en' → page re-renders in English.

- [x] T031 [US5] Verify LanguageSwitcher component (already built from Login screen) is wired into Header; confirm homepage i18n keys from T007/T008 are present in both locale files; verify lang cookie persists across homepage reload; note: NO new component needed — existing LanguageSwitcher is reused as-is | app/components/header.tsx, messages/vi.json, messages/en.json

**Checkpoint**: US5 complete — language switching works on homepage using existing component

---

## Phase 8: User Story 6 — Quick widget action (P3)

**Goal**: Fixed pill button permanently visible in bottom-right corner; opens quick-action menu on click

**Independent Test**: Assert widget visible in DOM on page load; assert widget remains visible after scrolling; click → open state toggles true.

- [x] T032 [P] [US6] Write failing unit tests in app/_components/widget-button.test.tsx: widget button present in DOM on mount, open state is false initially, click toggles open to true, click again toggles open to false, button has fixed CSS positioning class | app/_components/widget-button.test.tsx
- [x] T033 [US6] Implement WidgetButton client component ('use client') in app/_components/widget-button.tsx: fixed position bottom-right corner (fixed bottom-6 right-6 z-50); pill shape with background: var(--color-cta-primary) (#FFEA9E); contains pen icon (MM_MEDIA_Pen 24×24) + "/" separator + kudos logo icon (MM_MEDIA_Kudos Logo 24×24); toggles open state on click; renders quick-action menu placeholder when open=true; aria-label="Quick actions"; aria-expanded on trigger | app/_components/widget-button.tsx

**Checkpoint**: US6 complete and independently testable

---

## Phase 9: Page Assembly

**Purpose**: Wire all components into app/page.tsx and verify public access remains unrestricted

- [x] T034 Implement app/page.tsx as Server Component: createClient() from lib/supabase/server.ts → auth.getUser() → user (null if unauthenticated); if user: getProfile(user.id, supabase) → role (default 'user' on error); read locale from getLocale(); render in order: <Header user={user} role={role} currentPath="/">, <HeroSection>, <AwardGrid>, <KudosSection>, <WidgetButton>, <Footer>; unauthenticated users receive full page without auth redirect | app/page.tsx
- [x] T035 [P] Verify middleware.ts matcher is scoped to ['/login'] only (or equivalent auth-required routes); confirm / (homepage) does NOT trigger auth redirect for unauthenticated users; adjust matcher if needed | middleware.ts

**Checkpoint**: Full homepage renders correctly for both authenticated (with bell+dropdown) and unauthenticated users (without)

---

## Phase 10: Polish & Accessibility

**Purpose**: WCAG 2.1 AA compliance, performance baseline, zero 404s, and edge case hardening

- [x] T036 [P] Audit and add aria-label to all icon-only buttons: notification bell → aria-label="Thông báo" / "Notifications", account icon → aria-label="Tài khoản" / "Account", widget button → aria-label="Quick actions" in respective component files | app/_components/notification-bell.tsx, app/_components/account-dropdown.tsx, app/_components/widget-button.tsx
- [x] T037 [P] Add aria-expanded attribute to all dropdown triggers and verify it toggles correctly on open/close: account dropdown trigger, language switcher trigger, widget button trigger; verify with unit tests | app/_components/account-dropdown.tsx, app/components/header.tsx, app/_components/widget-button.tsx
- [x] T038 [P] Verify award card description has overflow-hidden line-clamp-2 applied in app/_components/award-card.tsx; verify with a long 3-line description in unit test that text is visually truncated with ellipsis | app/_components/award-card.tsx
- [x] T039 [P] Fix countdown tile bg opacity: tile background div at opacity-50 over linear-gradient (white → rgba white 10%); digit text div at full opacity on top; backdrop-filter: blur(16.64px) on tile; verify tiles render correctly at 51×82px per design-style.md note 4 | app/_components/countdown-timer.tsx
- [x] T040 Run FR-015 link check: `next build && next start`; run Playwright script or curl loop asserting all <a href> targets in header nav, footer nav, award cards, and CTA buttons return HTTP 200 (or 3xx→200 chain); fail build if any 404 detected | tests/e2e/link-check.spec.ts or inline script
- [x] T041 [P] Run @axe-core/playwright accessibility audit on homepage (unauthenticated + authenticated states): assert zero WCAG 2.1 AA violations; fix any identified issues in component files before marking complete | tests/e2e/a11y.spec.ts or inline in homepage.spec.ts

**Checkpoint**: Homepage meets WCAG 2.1 AA, all links return 200, countdown tiles render per design spec

---

## Phase 11: E2E Tests

**Purpose**: End-to-end verification of all user stories in a real browser environment

- [x] T042 Write complete Playwright E2E test suite in tests/e2e/homepage.spec.ts covering all 6 user stories: **US1** (hero content visible, 3 countdown units render, countdown decrements with mocked datetime, invalid NEXT_PUBLIC_EVENT_DATETIME → 00 00 00); **US2** (all nav link hrefs correct, "About SAA 2025" active at /, CTA buttons navigate to /awards-information and /sun-kudos, footer nav links correct); **US3** (6 award cards visible, each href=/awards-information#{slug}, missing slug → /awards-information); **US4** (unauthenticated → no bell/dropdown, authenticated → bell visible, admin role → Admin Dashboard in dropdown, sign-out → redirects to /login); **US5** (language switch sets lang cookie, page re-renders in selected locale, cookie persists on reload); **US6** (widget button visible on load, visible after scroll, click → quick-action menu opens) | tests/e2e/homepage.spec.ts

**Checkpoint**: All user stories verified end-to-end in browser; CI-ready

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
  └─→ Phase 2 (Foundation)   [BLOCKS all user story phases]
        ├─→ Phase 3 (US1) ──┐
        ├─→ Phase 4 (US2) ──┤  [Can run in parallel — different files]
        ├─→ Phase 5 (US3) ──┤
        ├─→ Phase 6 (US4) ──┤
        ├─→ Phase 7 (US5) ──┤
        └─→ Phase 8 (US6) ──┘
              └─→ Phase 9 (Page Assembly)   [Requires US1, US2, US4, US6]
                    └─→ Phase 10 (Polish)
                          └─→ Phase 11 (E2E)
```

### Within Each Phase (TDD Order)

- Test tasks MUST run and FAIL before their paired implementation tasks
- T009 (notification-service.test.ts) → T010 (notification-service.ts): sequential
- T011 (profile-service.test.ts) → T012 (profile-service.ts): sequential
- T013 (countdown-timer.test.tsx) → T014 (countdown-timer.tsx): sequential
- T015 (hero-section.test.tsx) → T016 (hero-section.tsx): sequential
- T017 (header.test.tsx) → T018 (header.tsx): sequential
- T021 (award-card.test.tsx) → T022 (award-card.tsx): sequential
- T024 (route.test.ts) → T025 (route.ts): sequential
- T026 (notification-bell.test.tsx) → T027 (notification-bell.tsx): sequential
- T029 (account-dropdown.test.tsx) → T030 (account-dropdown.tsx): sequential
- T032 (widget-button.test.tsx) → T033 (widget-button.tsx): sequential

### Parallel Opportunities

| Batch | Tasks | Condition |
|-------|-------|-----------|
| Phase 1 parallel | T002, T003 | Different files — run with T001 |
| Phase 2 parallel | T005, T006, T007, T008 | Different files — run with T004 |
| Phase 2 parallel | T009, T011 | Different test files — run simultaneously |
| Phase 3 + Phase 4 | T013–T016 and T017–T020 | Different component files |
| Phase 5 + Phase 6 | T021–T023 and T024–T030 | Different files after Foundation |
| Phase 6 internal | T024, T025, T026, T029 | Different test files — batch together |
| Phase 8 + Phase 7 | T031–T033 | Independent after Foundation |
| Phase 10 | T036, T037, T038, T039, T041 | All [P] — run in parallel |

---

## Implementation Strategy

### MVP First (Recommended)

1. **Phase 1 + Phase 2** — Setup + Foundation (all blocking prerequisites)
2. **Phase 3 + Phase 4 in parallel** — US1 Countdown/Hero + US2 Navigation
3. **Phase 9** — Page Assembly (functional homepage with countdown + nav)
4. **STOP AND VALIDATE** — `npm run test && npm run dev`; confirm page renders for auth and unauth
5. **Phase 5 + Phase 6 + Phase 8 in parallel** — Awards, Auth features, Widget
6. **Phase 7** — Language verification
7. **Phase 10** — Polish
8. **Phase 11** — E2E tests

### Incremental Delivery

1. Setup + Foundation → ✅ services and migrations ready
2. US1 + US2 + Page Assembly → ✅ functional homepage with countdown + nav
3. US3 (Awards) → ✅ award grid visible with correct links
4. US4 (Auth features) → ✅ bell + account dropdown for logged-in users
5. US5 (Language) → ✅ language switching works (reused component)
6. US6 (Widget) → ✅ fixed widget button with menu
7. Polish + E2E → ✅ production-ready homepage

---

## Notes

- **Commit** after each phase completes (all tasks in phase marked `[x]` and `vitest` passes)
- **"Comming soon" typo** — preserve exact double-m spelling from Figma in i18n values; do NOT fix
- **Award assets** — if Phase 1 download fails for any asset, use a placeholder image in Phase 5 and swap when assets are ready
- **Profile route** — AccountDropdown links to `/profile` as placeholder; update when Profile screen is specced
- **Common Standards route** — Footer "Tiêu chuẩn chung" links to `/standards` as placeholder
- **Header backward-compatibility** — Login page (`app/login/page.tsx`) does NOT pass `user`/`role` props; header MUST render without them (both default to `null`)
- **Browser Supabase client** — AccountDropdown (T030) MUST use `createClient()` from `lib/supabase/client.ts` for `signOut()`; the server client is not available in `'use client'` components
- **Digital Numbers font** (T003) — if unavailable on Google Fonts, self-host; the countdown will fall back to `monospace` during development until font is ready
- **Countdown tile opacity** (T039) — tile bg div at `opacity-50`, digit text div at full opacity on top; both inside the same tile container
