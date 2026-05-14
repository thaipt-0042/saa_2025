# Feature Specification: Countdown — Prelaunch Page

**Frame ID**: `8PJQswPZmU`
**Frame Name**: `Countdown - Prelaunch page`
**File Key**: `9ypp4enmFmdK3YAFJLIu6C`
**MoMorph URL**: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/8PJQswPZmU
**Created**: 2026-05-15
**Status**: Draft

---

## Overview

A full-page pre-launch countdown screen displayed before the SAA 2025 event goes live. Shows a real-time countdown timer with three units — DAYS, HOURS, MINUTES — each rendered as two LED-style digit displays with an uppercase label. The page is purely presentational: no user input, no navigation triggers. It lives at `/countdown`. The root route `/` acts as a smart router: authenticated + pre-launch → redirect `/countdown`; authenticated + event open → render Homepage SAA (`i87tDx10uM`); unauthenticated → redirect `/login`.

**Target users**: Authenticated users (any role). Unauthenticated users are redirected to `/login`.
**Business context**: Creates anticipation and communicates time-to-launch for the Sun* Annual Awards 2025 event.

---

## User Scenarios & Testing

### User Story 1 — View Real-Time Countdown Timer (Priority: P1)

A visitor opens the prelaunch page and sees a countdown timer displaying the remaining time until SAA 2025 launches. The timer updates automatically every minute without requiring a page refresh.

**Why this priority**: Core purpose of the entire screen. Without a functioning countdown, the page delivers no value.

**Independent Test**: Load the prelaunch page. Observe DAYS, HOURS, MINUTES values. Wait 60 seconds. Values must update automatically to reflect the elapsed time.

**Acceptance Scenarios**:

1. **Given** the event datetime is in the future, **When** the page loads, **Then** the timer displays the correct remaining DAYS, HOURS, and MINUTES, all zero-padded to 2 digits.
2. **Given** remaining time has only hours and minutes (DAYS = 0), **When** the page loads, **Then** DAYS unit displays `00`, HOURS and MINUTES display correct values.
3. **Given** the timer is running, **When** 60 seconds elapse, **Then** MINUTES decrements by 1 and the display updates automatically without page refresh.
4. **Given** MINUTES reaches `00` and HOURS is non-zero, **When** next minute elapses, **Then** MINUTES resets to `59` and HOURS decrements by 1.
5. **Given** a single-digit value (e.g., 5 days, 3 hours, 7 minutes), **When** displayed, **Then** the unit shows a leading zero (`05`, `03`, `07`).

---

### User Story 2 — Timer Reaches Zero (Priority: P2)

When the countdown target datetime arrives, all units display `00` and the timer stops.

**Why this priority**: Defines the end state of the prelaunch screen. Must be handled correctly to avoid negative values.

**Independent Test**: Set event datetime to a past date (or simulate). Verify all three units display `00`.

**Acceptance Scenarios**:

1. **Given** the event datetime is in the past (timer completed), **When** the page loads, **Then** DAYS, HOURS, and MINUTES all display `00`.
2. **Given** the timer is running and reaches exactly zero, **When** the last second elapses, **Then** all units transition to `00` and the timer stops updating.
3. **Given** any unit has an out-of-range or negative computed value (due to time sync edge case), **When** rendered, **Then** the unit clamps to `00` and does not display a negative or invalid value.

---

### User Story 3 — Routing & Access Control (Priority: P3)

The root route `/` acts as a smart router. Only authenticated users can see the countdown. Unauthenticated users are redirected to `/login`. When the event opens, `/` redirects to the Homepage SAA instead of the countdown. **There is no role-based restriction** — any authenticated user (`user` or `admin`) has full access to the countdown page.

**Why this priority**: Routing and access behavior must be defined. Controls what every user sees when first arriving at the app.

**Independent Test**: Access `/` without authentication → redirect to `/login`. Access `/countdown` without authentication → redirect to `/login`. Access `/` while authenticated + pre-launch → redirect to `/countdown`. Access `/` while authenticated + event open → Homepage SAA rendered.

**Acceptance Scenarios**:

1. **Given** a user is not authenticated, **When** they navigate to `/`, **Then** they are redirected to `/login`.
2. **Given** a user is not authenticated, **When** they navigate to `/countdown` directly, **Then** they are redirected to `/login`.
3. **Given** a user is authenticated with any role (`user` or `admin`) and `isPrelaunch = true`, **When** they navigate to `/`, **Then** they are redirected to `/countdown`.
4. **Given** a user is authenticated with any role and `isPrelaunch = false` (event open), **When** they navigate to `/`, **Then** the Homepage SAA is rendered (no redirect to `/countdown`).
5. **Given** a user is authenticated and navigates directly to `/countdown` when `isPrelaunch = false`, **When** the page loads, **Then** they are redirected to `/` (homepage).
6. **Given** an invalid or malformed URL, **When** a user navigates to it, **Then** the system returns a 404 error page.
7. **Given** a user has an expired session, **When** they navigate to `/` or `/countdown`, **Then** they are redirected to `/login` (expired session is treated as unauthenticated).

---

### Edge Cases

- **Negative values**: If computed `days / hours / minutes` is negative (event in past), all units clamp to `00`. No negative numbers displayed.
- **Invalid HOURS range** (< 0 or > 23): display `00`.
- **Invalid MINUTES range** (< 0 or > 59): display `00`.
- **Two-digit formatting**: values 0–9 must render as `00`–`09` (leading zero always applied).
- **DAYS ≥ 100**: The Figma design renders DAYS in 2 LED digit boxes (max display: 99). If DAYS computed value ≥ 100, display is capped at `99`. In practice, the event is within 60 days of spec creation so this case should not occur for SAA 2025.
- **`NEXT_PUBLIC_EVENT_DATETIME` undefined or malformed**: If the env var is missing or cannot be parsed as a valid ISO 8601 date, treat `isPrelaunch` as `false` (fail-safe: redirect to Homepage SAA) and all countdown units display `00`. Log a console warning in development.
- **Time sync drift**: if server-provided event datetime diverges from client clock, the countdown is calculated from the client clock against the static event timestamp. No automatic correction mechanism required for MVP.

---

## UI/UX Requirements *(from Figma)*

### Screen Components

| Component | Node ID | Description | Interactions |
|-----------|---------|-------------|--------------|
| Countdown unit — DAYS | `2268:35139` | Two LED-style digit boxes + uppercase label "DAYS". Shows remaining days (≥ 0). Displays `00` if < 1 day. | None (display only) |
| Countdown unit — HOURS | `2268:35144` | Two LED-style digit boxes + uppercase label "HOURS". Range: 00–23. | None (display only) |
| Countdown unit — MINUTES | `2268:35149` | Two LED-style digit boxes + uppercase label "MINUTES". Range: 00–59. | None (display only) |

**Note**: No SECONDS unit in design. No interactive buttons on this screen.

### Navigation Flow

- **Route**: `/countdown` — the countdown screen lives here.
- **Root router** (`/`): Server Component that evaluates `isPrelaunch` and `auth`:
  - Not authenticated → `redirect('/login')`
  - Authenticated + `isPrelaunch = true` → `redirect('/countdown')`
  - Authenticated + `isPrelaunch = false` → render Homepage SAA inline
- **Entry to `/countdown`**: Redirect from `/` when pre-launch. Direct URL access also supported (auth guard applies).
- **Guard on `/countdown`**: If `isPrelaunch = false` (event open), redirect to `/`.
- **Exit**: No user-triggered navigation on the countdown screen itself. Transition to homepage is server-driven when `isPrelaunch` becomes false.

### Visual Requirements

- Responsive: mobile-first layout (Tailwind responsive prefixes)
- Accessibility:
  - Each countdown unit MUST have an `aria-label` describing the current value and unit name (e.g., `aria-label="5 days"`, `aria-label="3 hours"`, `aria-label="7 minutes"`). Update `aria-label` when value changes.
  - The countdown container MUST have `role="timer"` and `aria-live="polite"` so screen readers announce updates without interrupting the user.
  - Label text ("DAYS", "HOURS", "MINUTES") is visible text — no additional `aria-label` needed for labels.
- No animations on digit changes required for MVP (static update acceptable)

---

## Requirements

### Functional Requirements

- **FR-001**: System MUST display a countdown to a configurable target event datetime.
- **FR-002**: The countdown MUST show three units: DAYS (≥ 0), HOURS (00–23), MINUTES (00–59).
- **FR-003**: Each unit MUST always render exactly 2 digits with a leading zero for single-digit values.
- **FR-004**: The countdown MUST update automatically in real time (client-side interval, minimum every 60 seconds).
- **FR-005**: When the countdown reaches zero or the target datetime is in the past, all units MUST display `00`.
- **FR-006**: Out-of-range values (negative or above maximum) MUST be clamped to `00`.
- **FR-007**: The `/countdown` page MUST be accessible to authenticated users only. Unauthenticated access MUST redirect to `/login`.
- **FR-008**: The root route `/` MUST evaluate `isPrelaunch` server-side and redirect: authenticated + pre-launch → `/countdown`; authenticated + event open → render Homepage SAA; not authenticated → `/login`.
- **FR-009**: Direct access to `/countdown` when `isPrelaunch = false` MUST redirect to `/`.

### Technical Requirements

- **TR-001**: The event target datetime MUST be configurable (environment variable or static config) — not hardcoded inline.
- **TR-002**: Client-side countdown logic MUST use `setInterval` or `requestAnimationFrame` and be cleaned up on component unmount to prevent memory leaks.
- **TR-003**: The component rendering the countdown MUST be a Client Component (`'use client'`) since it requires browser timer APIs.
- **TR-004**: `app/page.tsx` is the root router (Server Component): evaluates auth + `isPrelaunch`, issues redirects or renders Homepage SAA. `app/countdown/page.tsx` is the countdown page (Server Component): evaluates auth + `isPrelaunch` (guard), passes `targetDate` prop to the countdown Client Component.
- **TR-005**: TypeScript strict mode — no `any` type. Countdown values typed as `number`.

---

## API Dependencies

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| _(none)_ | — | Countdown is computed client-side from a static event datetime config | — |

> **Predicted**: A `GET /api/countdown` endpoint may be added in the future to serve the target datetime dynamically (e.g., admin-configurable). For MVP, a static environment variable or constant is sufficient.

---

## State Management

| State | Type | Location | Notes |
|-------|------|----------|-------|
| `targetDate` | `Date` | Prop (passed from Server Component) or static constant | ISO 8601 datetime of SAA 2025 event |
| `days` | `number` | Client Component local state | Computed from `targetDate - now` |
| `hours` | `number` | Client Component local state | Computed from `targetDate - now` |
| `minutes` | `number` | Client Component local state | Computed from `targetDate - now` |
| Timer interval | `number` (interval ID) | Client Component ref | Cleaned up on unmount |

**Update cadence**: Recalculate every 60,000ms (1 minute). Optionally every 1,000ms if sub-minute precision needed later.

---

## Success Criteria

- **SC-001**: Countdown displays correct remaining time on initial page load (verified against event datetime).
- **SC-002**: Values update automatically — no manual refresh needed.
- **SC-003**: Single-digit values display with leading zero (e.g., `07`, not `7`).
- **SC-004**: Timer completed state shows `00` for all units (no negative values shown).
- **SC-005**: Unauthenticated access to `/` or `/countdown` redirects to `/login`. Authenticated + pre-launch: `/` redirects to `/countdown`. Authenticated + event open: `/` renders Homepage SAA.

---

## Out of Scope

- Seconds unit (not in design).
- Animated digit transitions / flip-clock effect (MVP: static update).
- Server-side event datetime API (`GET /api/countdown`) — static config for MVP.
- Automatic client-side redirect from prelaunch to homepage when timer reaches zero (the switch is handled server-side via `isPrelaunch` logic).
- Localization of labels (DAYS / HOURS / MINUTES are fixed English uppercase labels per design).

---

## Dependencies

- [x] Constitution document exists (`.momorph/constitution.md`)
- [x] Screen flow documented (`.momorph/SCREENFLOW.md`)
- [x] Prelaunch toggle mechanism confirmed (date-based + env var override — resolved 2026-05-15)

---

## Decisions

1. ✅ **Prelaunch toggle** (resolved 2026-05-15): Date-based with env var override.
2. ✅ **Event datetime source** (resolved 2026-05-15): Static env var `NEXT_PUBLIC_EVENT_DATETIME` (e.g., `2026-07-15T18:30:00+07:00`). No database needed for MVP.
3. ✅ **Access control + routing** (resolved 2026-05-15): Authentication required. Unauthenticated users are redirected to `/login`. Any authenticated role (`user`, `admin`) can access.
   - **Root router** (`app/page.tsx`): not authenticated → `/login`; `isPrelaunch = true` → `redirect('/countdown')`; `isPrelaunch = false` → render Homepage SAA.
   - **Countdown guard** (`app/countdown/page.tsx`): not authenticated → `/login`; `isPrelaunch = false` → `redirect('/')`.
   - **isPrelaunch logic**: `NEXT_PUBLIC_PRELAUNCH_MODE !== undefined ? NEXT_PUBLIC_PRELAUNCH_MODE === 'true' : new Date() < EVENT_DATE`
   - Primary: `new Date() < EVENT_DATE` — auto-switches at event time, no redeploy needed.
   - Override: `NEXT_PUBLIC_PRELAUNCH_MODE=true/false` — forces prelaunch state for dev/testing or emergency bypass.

## Open Questions

_All questions resolved._
