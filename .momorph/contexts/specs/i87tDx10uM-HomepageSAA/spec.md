# Feature Specification: Homepage SAA

**Frame ID**: `i87tDx10uM`
**Frame Name**: `Homepage SAA`
**File Key**: `9ypp4enmFmdK3YAFJLIu6C`
**Created**: 2026-05-14
**Status**: Draft

---

## Overview

The Homepage SAA is the main landing page of the Sun Annual Awards 2025 web application. It
presents the event identity ("ROOT FURTHER"), a live countdown to the event start, static event
logistics (time/venue), a grid of award categories, a Sun* Kudos promotional section, and a fixed
quick-action widget. Navigation (header + footer), role-based controls (account dropdown,
notification bell), and language switching are all surfaced on this screen.

The page is **publicly accessible** — no authentication is required to view core content.
Authenticated users additionally see the notification bell and account menu.

**Target users:** Sun* employees — unauthenticated visitors and authenticated account holders
(regular users and admins).

**Business context:** Central hub driving awareness of SAA 2025; directs users to the Awards
Information and Sun* Kudos pages; provides countdown urgency and event logistics at a glance.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View homepage content and live countdown (Priority: P1)

Any visitor (authenticated or not) lands on the homepage, sees the hero section with the ROOT
FURTHER theme, a live countdown to the event start, static event info (time/venue), CTA buttons
("ABOUT AWARDS" / "ABOUT KUDOS"), and the Root Further description paragraph.

**Why this priority**: Core value proposition — the first thing every user sees. The countdown is
the key urgency mechanic. Without this, the page has no content.

**Independent Test**: Navigate to `/` without a session cookie. Assert hero content, countdown
units, and CTA buttons are all visible. Mock `NEXT_PUBLIC_EVENT_DATETIME` to 1 minute in the
future; wait 61 seconds and assert countdown decrements.

**Acceptance Scenarios**:

1. **Given** the event datetime env var is set to a future ISO-8601 timestamp, **When** any user loads `/`, **Then** the page shows the ROOT FURTHER title, "Coming soon" label, and three countdown blocks (DAYS / HOURS / MINUTES) each displaying a 2-digit zero-padded value.
2. **Given** the page is open with time remaining, **When** one minute elapses, **Then** the MINUTES value decrements by 1 (HOURS and DAYS adjust as needed) without a page reload.
3. **Given** a remaining value is a single digit (e.g. 5), **When** the countdown renders, **Then** it displays with a leading zero (e.g. `05`).
4. **Given** the current time equals or exceeds the event datetime, **When** the page loads or the countdown reaches zero, **Then** all three units show `00` and the "Coming soon" label is hidden.
5. **Given** the event datetime env var is absent or contains an invalid non–ISO-8601 string, **When** the page loads, **Then** the countdown displays `00 00 00` and the page does not crash (no unhandled error).
6. **Given** any visitor, **When** the page loads, **Then** static event info is displayed: time "18h30", venue "Nhà hát nghệ thuật quân đội", and the Facebook livestream note — non-interactive.

---

### User Story 2 - Navigate to other pages (Priority: P1)

Users click header nav links, footer links, CTA buttons, and section "Chi tiết" buttons to move
between pages. The active nav link reflects the current page.

**Why this priority**: Navigation is the primary function of the header/footer — broken nav makes
the whole app unusable.

**Independent Test**: Test with only static routing in place (even placeholder 404 pages). Assert
each link's `href` target is correct and the active state is applied to "About SAA 2025" when on
the homepage.

**Acceptance Scenarios**:

1. **Given** any user on any page, **When** the header or footer logo is clicked, **Then** the browser navigates to `/` and scrolls to the top of the page.
2. **Given** any user on any page, **When** "About SAA 2025" is clicked in the header or footer, **Then** the browser navigates to `/` and scrolls to top (re-scrolls if already on homepage).
3. **Given** any user, **When** "Awards Information" is clicked in header or footer, **Then** the browser navigates to the Awards Information page.
4. **Given** any user, **When** "Sun* Kudos" is clicked in header or footer, **Then** the browser navigates to the Sun* Kudos page.
5. **Given** a user on the homepage, **When** the "ABOUT AWARDS" CTA button (B3.1) is clicked, **Then** the browser navigates to the Awards Information page.
6. **Given** a user on the homepage, **When** the "ABOUT KUDOS" CTA button (B3.2) is clicked, **Then** the browser navigates to the Sun* Kudos page.
7. **Given** a user on the homepage, **When** the Sun* Kudos section "Chi tiết" button (D2.1) is clicked, **Then** the browser navigates to the Sun* Kudos detail page.
8. **Given** the user is on the homepage, **When** the header renders, **Then** the "About SAA 2025" link displays in selected/active state; other links display in normal state.
9. **Given** a user hovers over a non-active nav link, **When** the pointer enters the element, **Then** the link transitions to its hover state (distinct highlight).

---

### User Story 3 - Browse award categories and navigate to award details (Priority: P2)

Users view the six award category cards and click any card element (image, title, or "Chi tiết"
link) to land on the Awards Information page scrolled to that award's section.

**Why this priority**: Key discoverability feature for the awards programme; unblocked from US1 but
secondary to core navigation.

**Independent Test**: Render the award grid with static award data. Assert each of the 6 cards
produces the correct `href` (`/awards-information#{slug}`). Test hashtag anchor resolution.

**Acceptance Scenarios**:

1. **Given** a user on the homepage, **When** the awards section loads, **Then** exactly 6 award cards display: Top Talent, Top Project, Top Project Leader, Best Manager, Signature 2025 - Creator, MVP (Most Valuable Person).
2. **Given** a desktop viewport, **When** the awards grid renders, **Then** cards are in a 3-column layout.
3. **Given** a tablet or mobile viewport, **When** the awards grid renders, **Then** cards are in a 2-column layout.
4. **Given** any award card, **When** the user clicks the card image (C2.x.1), title (C2.x.2), or "Chi tiết" link (C2.x.4), **Then** the browser navigates to `/awards-information#{award-slug}` and scrolls to the matching section.
5. **Given** an award card with a missing slug, **When** the user clicks it, **Then** the browser navigates to `/awards-information` without a hash anchor (no crash, no broken link).
6. **Given** a user hovers over an award card, **When** the pointer enters the card, **Then** the card elevates slightly with an enhanced border/glow transition.
7. **Given** each award card, **When** rendered, **Then** it shows: thumbnail image, award title, description (max 2 lines, ellipsis on overflow), and a "Chi tiết" link with an icon.

---

### User Story 4 - Access authenticated features: notifications and account menu (Priority: P2)

Logged-in users see a notification bell (with unread badge) and an account dropdown with
role-specific options (Profile, Sign out; admin additionally sees Admin Dashboard).

**Why this priority**: Auth-gated; important but the homepage is fully functional without it
(public content is available to all).

**Independent Test**: Inject a Supabase session cookie. Assert notification bell appears. Mock
two role payloads (admin vs. regular) and assert account menu item visibility.

**Acceptance Scenarios**:

1. **Given** an unauthenticated user, **When** the header renders, **Then** the notification bell and account icon are NOT displayed.
2. **Given** an authenticated user with unread notifications, **When** the header renders, **Then** the notification bell shows a red badge.
3. **Given** an authenticated user with no unread notifications, **When** the header renders, **Then** the notification bell shows no badge.
4. **Given** an authenticated user, **When** the notification bell (A1.6) is clicked, **Then** a notification panel opens.
5. **Given** an authenticated user, **When** the account icon (A1.8) is clicked, **Then** a dropdown opens with at least "Profile" and "Sign out" options.
6. **Given** a logged-in admin, **When** the account dropdown opens, **Then** an "Admin Dashboard" option is also present.
7. **Given** a logged-in regular user, **When** the account dropdown opens, **Then** "Admin Dashboard" is NOT present.
8. **Given** an open account dropdown, **When** the user clicks outside the menu or presses Escape, **Then** the dropdown closes.
9. **Given** an account dropdown trigger is focused, **When** the user presses Enter or Space, **Then** the dropdown toggles open/closed.
10. **Given** an authenticated user, **When** "Sign out" is clicked in the account dropdown, **Then** `supabase.auth.signOut()` is called and the user is redirected to `/login`.
11. **Given** an authenticated user, **When** "Profile" is clicked in the account dropdown, **Then** the user is navigated to their profile page (route TBD — see open question Q3).
12. **Given** the unread count is loading, **When** the header renders, **Then** the notification bell is visible but no badge is displayed.

---

### User Story 5 - Switch language (Priority: P2)

Users click the language button (A1.7) to switch the entire interface between Vietnamese (VN) and
English (EN).

**Why this priority**: Language switching is a shared feature already partially implemented
(Login screen); homepage reuses the same component.

**Independent Test**: Click language button → assert dropdown opens with VN/EN options → select EN
→ assert `lang` cookie is set and interface re-renders in English.

**Acceptance Scenarios**:

1. **Given** a user on the homepage, **When** the language button (A1.7) is clicked, **Then** a menu opens with exactly two options: VN and EN.
2. **Given** the language menu is open, **When** "EN" is selected, **Then** the interface re-renders in English and the `lang` cookie is set to `en`.
3. **Given** the language menu is open, **When** "VN" is selected, **Then** the interface re-renders in Vietnamese and the `lang` cookie is set to `vi`.
4. **Given** the lang cookie is set to `en`, **When** the user reloads the page, **Then** the page renders in English from the first byte (no flash of Vietnamese).

---

### User Story 6 - Quick widget action (Priority: P3)

A fixed pill-shaped button (item `6`) is permanently visible in the bottom-right corner and opens
a quick-action menu when clicked.

**Why this priority**: Supplementary UX convenience; the homepage and core navigation function
fully without it.

**Independent Test**: Assert widget is visible at page load and remains visible after scrolling.
Click it and assert the quick-action menu opens.

**Acceptance Scenarios**:

1. **Given** any user on the homepage, **When** the page loads, **Then** the widget button is visible and fixed in the bottom-right corner regardless of vertical scroll position.
2. **Given** a user clicks the widget button, **When** the click is registered, **Then** a quick-action menu opens with available option items.

---

### Edge Cases

- `NEXT_PUBLIC_EVENT_DATETIME` absent or invalid → countdown shows `00 00 00`, "Coming soon" hidden, no crash.
- Award card with missing/undefined slug → navigate to `/awards-information` without hash.
- Unauthenticated user → homepage renders fully without notification bell or account menu.
- Account dropdown open while user navigates away → dropdown closes (no zombie overlay).
- Award description longer than 2 lines → truncated with ellipsis.
- Notification count fetch fails (network error) → bell renders without badge; error silently swallowed (non-critical UI element).
- Sign out while on homepage → `supabase.auth.signOut()` + redirect to `/login`.
- "Profile" in account menu clicked → navigates to profile page (route TBD).
- "Tiêu chuẩn chung" footer link → navigates to Common Standards page (route TBD — see open question Q4).

---

## UI/UX Requirements *(from Figma)*

### Screen Components

| Component | Node ID | Type | Key Interactions |
|-----------|---------|------|-----------------|
| A1 — Header | — | Navigation bar | Fixed top; logo, nav links, controls |
| A1.1 — Logo | — | Icon button | Click → `/` scroll-to-top |
| A1.2 — "About SAA 2025" | — | Text link | Click → `/` scroll-to-top; selected state active |
| A1.3 — "Awards Information" | — | Text link | Click → Awards Information page; hover state |
| A1.5 — "Sun* Kudos" | — | Text link | Click → Sun* Kudos page; normal/hover/selected states |
| A1.6 — Notification bell | — | Icon button | Authenticated only; click → notification panel; red badge when unread; no badge when count = 0 or while loading count |
| A1.7 — Language switcher | — | Icon+text button | Click → VN/EN dropdown; selection updates `lang` cookie + re-render |
| A1.8 — Account icon | — | Icon button | Click → Dropdown-profile overlay (two Figma variants: regular `z4sCl3_Qtk`, admin `54rekaCHG1`); role-based items; "Profile" → profile page; "Sign out" → `supabase.auth.signOut()` + redirect `/login` |
| B1 — Hero / Keyvisual | `2167:9027` | Composite section | Auto-updating countdown; "Coming soon" toggles by event time |
| B1.2 — "Coming soon" label | — | Label | Visible before event start; hidden at/after event start |
| B1.3 — Countdown timer | — | Countdown | 3 units (DAYS/HOURS/MINUTES); per-minute update; 2-digit zero-pad |
| B2 — Event info | — | Info block | Static: time "18h30", venue, Facebook note; non-interactive |
| B3.1 — "ABOUT AWARDS" button | — | CTA button | Click → Awards Information page; hover state |
| B3.2 — "ABOUT KUDOS" button | — | CTA button | Click → Sun* Kudos page; hover/normal states |
| B4 — Root Further paragraph | `5001:14827` | Info block | Static descriptive text; non-interactive |
| C1 — Awards section header | — | Info block | Static section heading; non-interactive |
| C2 — Award grid | `5005:14974` | Card grid | 3-col desktop / 2-col mobile; hover elevation |
| C2.1 — Top Talent card | — | Award card | Image/title/"Chi tiết" → `/awards-information#top-talent` |
| C2.2 — Top Project card | — | Award card | → `/awards-information#top-project` |
| C2.3 — Top Project Leader card | — | Award card | → `/awards-information#top-project-leader` |
| C2.4 — Best Manager card | — | Award card | → `/awards-information#best-manager` |
| C2.5 — Signature 2025 Creator card | — | Award card | → `/awards-information#signature-2025-creator` |
| C2.6 — MVP card | — | Award card | → `/awards-information#mvp-most-valuable-person` |
| D1/D2 — Sun* Kudos section | — | Promo block | "Chi tiết" (D2.1) → Sun* Kudos page |
| Widget (6) | — | Fixed pill button | Fixed bottom-right; click → quick-action menu |
| Footer (7) | — | Navigation bar | Logo → home; links → corresponding pages; copyright static |
| 7.2 — "About SAA 2025" footer link | — | Text link | Click → `/` scroll-to-top; same behavior as A1.2 |
| 7.3 — "Awards Information" footer link | — | Text link | Click → Awards Information page; same behavior as A1.3 |
| 7.4 — "Sun* Kudos" footer link | — | Text link | Click → Sun* Kudos page; same behavior as A1.5 |
| 7.5 — "Tiêu chuẩn chung" footer link | — | Text link | Click → Common Standards page (route TBD); hover/active states same as other nav links |

### Navigation Flow

| Trigger | From | To |
|---------|------|----|
| Logo click (header or footer) | Any page | `/` + scroll-to-top |
| "About SAA 2025" click | Any page | `/` + scroll-to-top |
| "Awards Information" click | Any page | `/awards-information` |
| "Sun* Kudos" click | Any page | `/sun-kudos` |
| "ABOUT AWARDS" CTA (B3.1) | Homepage | `/awards-information` |
| "ABOUT KUDOS" CTA (B3.2) | Homepage | `/sun-kudos` |
| Award card click (any element) | Homepage | `/awards-information#{slug}` |
| Sun* Kudos "Chi tiết" (D2.1) | Homepage | `/sun-kudos` |
| "Tiêu chuẩn chung" footer (7.5) | Any page | Common Standards page (route TBD) |
| Account icon (A1.8) | Homepage | Dropdown-profile overlay (frames `z4sCl3_Qtk` regular / `54rekaCHG1` admin) |
| "Sign out" in dropdown | Homepage | `supabase.auth.signOut()` → `/login` |
| "Profile" in dropdown | Homepage | Profile page (route TBD) |
| "Admin Dashboard" in dropdown | Homepage | `/admin` |
| Notification bell (A1.6) | Homepage | Notification panel overlay |
| Widget button (6) | Homepage | Quick-action menu overlay |

### Visual Requirements

- Responsive breakpoints: mobile-first; award grid 2-col on tablet/mobile, 3-col on desktop
- Countdown auto-updates every 60 seconds (cleanup on component unmount)
- Award card hover: subtle elevation effect with enhanced border/glow
- Nav link hover: highlighted background state
- Nav link active/selected: distinct highlighted state with underline indicator
- Account dropdown: closes on outside click OR Escape key
- Widget button: fixed position — always visible above page content regardless of scroll
- Accessibility: WCAG 2.1 AA; all interactive elements keyboard-reachable; focus rings visible; `aria-label` on icon-only buttons; `aria-expanded` on dropdown triggers

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The homepage MUST be accessible to unauthenticated users without any auth redirect.
- **FR-002**: The countdown MUST read the event target datetime from `NEXT_PUBLIC_EVENT_DATETIME` env var (ISO-8601 format) and compute remaining DAYS/HOURS/MINUTES client-side.
- **FR-003**: The countdown MUST auto-update every 60 seconds via `setInterval`; interval MUST be cleared on component unmount.
- **FR-004**: The "Coming soon" label MUST hide when the countdown reaches `00 00 00`; it MUST NOT reappear.
- **FR-005**: The countdown MUST clamp at `00 00 00` (never show negative values) when the event time has passed.
- **FR-006**: Each countdown unit MUST always display exactly 2 digits with a leading zero when the value is 0–9.
- **FR-007**: An invalid or absent `NEXT_PUBLIC_EVENT_DATETIME` MUST result in a safe fallback (`00 00 00`) without a crash or unhandled exception.
- **FR-008**: Clicking a card's image, title, or "Chi tiết" MUST navigate to `/awards-information#{award-slug}`; if slug is undefined, navigate to `/awards-information` with no hash.
- **FR-009**: Award card descriptions MUST truncate to a maximum of 2 lines with an ellipsis on overflow.
- **FR-010**: The account dropdown MUST show the "Admin Dashboard" option only when the authenticated user's `role` is `admin`.
- **FR-011**: The notification bell badge MUST reflect the current unread notification count; the badge MUST be hidden when the count is 0.
- **FR-012**: The language switcher MUST support exactly VN and EN; selecting either MUST set the `lang` cookie and re-render the interface in that language.
- **FR-013**: The widget button MUST remain fixed in the bottom-right corner regardless of page scroll.
- **FR-014**: The account dropdown MUST close on outside click or Escape key.
- **FR-015**: All navigation links MUST produce zero 404 responses.

### Technical Requirements

- **TR-001**: Countdown is a `'use client'` component; all other page sections MUST be Server Components by default (constitution Principle I).
- **TR-002**: `NEXT_PUBLIC_EVENT_DATETIME` is read at runtime by the client component; invalid values MUST be caught with try/catch and handled gracefully.
- **TR-003**: Award list is defined as static config (TypeScript constant) — no API call required for rendering.
- **TR-004**: Unread notification count MUST be fetched via API only for authenticated users; the fetch MUST NOT be triggered for unauthenticated sessions.
- **TR-005**: User `role` MUST be resolved server-side from the Supabase `profiles` table and passed as a prop — not determined client-side from localStorage or cookies.
- **TR-006**: LCP target < 2.5 s; hero image/keyvisual lazy-loaded; header logo uses `<Image priority />`.
- **TR-007**: All interactive elements MUST meet WCAG 2.1 AA: contrast ≥ 4.5:1, keyboard navigable, focus rings visible.
- **TR-008**: No raw hex values or pixel sizes in component files — all styling via Tailwind utilities backed by CSS custom properties (constitution Principle II).

### Key Entities *(from data model)*

- **Award** (static config — no DB table): `{ slug: string; title: string; description: string; imageAsset: string }`
- **Profile** (Supabase `profiles` table): `{ id: uuid; email: string; full_name: string; avatar_url: string; role: 'admin' | 'user'; created_at: timestamp; updated_at: timestamp }`
- **Notification** (predicted — separate table): `{ id: uuid; user_id: uuid; content: string; read_at: timestamp | null; created_at: timestamp }`

---

## State Management

### Local Component State

| Component | State | Type | Notes |
|-----------|-------|------|-------|
| CountdownTimer | `remaining` | `{ days: number; hours: number; minutes: number }` | Recomputed every 60 s via `setInterval`; cleared on unmount |
| CountdownTimer | `eventStarted` | `boolean` | True when all units are `00`; drives "Coming soon" visibility |
| AccountDropdown | `open` | `boolean` | Toggle on trigger click; close on outside click / Escape |
| NotificationPanel | `open` | `boolean` | Toggle on bell click |
| WidgetMenu | `open` | `boolean` | Toggle on widget click |
| NotificationBell | `unreadCount` | `number \| null` | `null` while loading; badge hidden when `null` or `0` |
| LanguageSwitcher | `open` | `boolean` | Toggle on language button click (reuses Login component) |

### Server / Global State

| Data | Source | How passed to client |
|------|--------|---------------------|
| Authenticated user session | Supabase `auth.getUser()` — SSR per-request | Passed as prop to client components that need it |
| User role (`admin` / `user`) | Supabase `profiles` table — SSR via `profile-service` | Passed as prop to header; drives dropdown variant |
| Locale | `lang` cookie — read in `i18n/request.ts` | Resolved server-side by `next-intl`; no client state needed |

### Loading / Error States

| Component | Loading | Error |
|-----------|---------|-------|
| Notification unread count | Bell renders without badge (no spinner) | Same as loading — bell visible, badge absent; error silently swallowed (non-critical) |
| User role | Resolved SSR before page renders — no client loading state | If `profiles` query fails: treat as `user` role (safest default; Admin Dashboard hidden) |
| Countdown | No loading state — computed synchronously from env var | If `NEXT_PUBLIC_EVENT_DATETIME` invalid: `00 00 00`, "Coming soon" hidden |

### Cache / Invalidation

- Unread notification count: fetched once on mount; re-fetched when notification panel closes.
- No optimistic updates required for this screen.
- Locale changes trigger a `router.refresh()` (full server re-render) — no client cache invalidation needed.

---

## API Dependencies

| Endpoint | Method | Purpose | Triggered by | Status |
|----------|--------|---------|--------------|--------|
| `GET /api/notifications/unread-count` | GET | Returns unread notification count for the bell badge | Page mount (authenticated users only) | Predicted / New |
| Supabase `auth.getUser()` | — | Resolve current session and user ID (SSR) | Page mount | Exists (Supabase SDK) |
| Supabase `SELECT * FROM profiles WHERE id = $userId` | — | Resolve user role for account menu | SSR via `profile-service` | Exists (DB) |

> Award list, event info (time/venue/Facebook note), and the countdown target are **static
> content / env var** — no API endpoints required.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Countdown displays the correct remaining DAYS/HOURS/MINUTES (within ±1 minute accuracy) when `NEXT_PUBLIC_EVENT_DATETIME` is valid.
- **SC-002**: All 6 award card links navigate to the correct hashtag anchor on the Awards Information page; scroll position verified.
- **SC-003**: Admin role sees "Admin Dashboard" in the account menu; regular user does not — confirmed with two distinct session fixtures.
- **SC-004**: Unauthenticated users can fully browse the homepage without any auth prompt or JS error.
- **SC-005**: All navigation links return HTTP 200 (zero 404s) verified by automated link checker.
- **SC-006**: Award grid correctly switches between 3-column (desktop) and 2-column (mobile/tablet) at the defined breakpoint.
- **SC-007**: Page passes WCAG 2.1 AA automated audit (axe or equivalent) with zero violations.

---

## Out of Scope

- Notification panel content (list of notifications, mark-as-read) — only the unread badge count is in scope.
- Admin Dashboard page — linked from account menu but specced separately.
- Widget quick-action menu item details — the button behavior is in scope; menu item logic is a separate spec.
- Awards Information page content — separate spec.
- Sun* Kudos detail page — separate spec.
- Real-time Supabase subscriptions for countdown — `setInterval` + env var is sufficient.
- User profile editing — Profile option in account menu links out; editing is a separate spec.

---

## Dependencies

- [x] Constitution document exists (`.momorph/constitution.md`)
- [ ] API specifications (`api-docs.yaml`) — notification count endpoint is predicted; confirm during planning
- [ ] Database design (`database-schema.sql`) — `notifications` table needed for unread count
- [x] Screen flow documented (`.momorph/SCREENFLOW.md`) — created 2026-05-14
- [x] Login screen spec exists (`GzbNeVGJHz-Login/spec.md`) — auth session pattern already established

---

## Notes

- **Award slugs**: The hashtag slugs (e.g. `#top-talent`) must be defined as a shared constant (`awards.config.ts`) and used consistently between the homepage cards and the Awards Information page anchors.
- **Dropdown-profile frame**: Figma frame `721:5223` ("Dropdown-profile") is the account menu overlay. It should be specced inline here or as a separate micro-spec if it contains complex logic.
- **Countdown granularity**: Only DAYS/HOURS/MINUTES are shown (no SECONDS). `setInterval` ticks every 60 000 ms.
- **Homepage route**: Route is `/` (root), consistent with `NEXT_PUBLIC_POST_LOGIN_URL` resolved to `/` in the auth flow.
- **Unauthenticated access**: The homepage does not require a session. Middleware must NOT redirect unauthenticated users away from `/`. Only `/login` redirect logic applies to authenticated users per the existing middleware.
