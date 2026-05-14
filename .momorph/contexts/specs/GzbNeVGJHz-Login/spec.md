# Feature Specification: Login

**Frame ID**: `GzbNeVGJHz`
**Frame Name**: `Login`
**File Key**: `9ypp4enmFmdK3YAFJLIu6C`
**Created**: 2026-05-13
**Status**: Reviewed (v2)

---

## Overview

The Login screen is the entry point of the SAA 2025 (Sun Annual Awards 2025) web application.
It presents the event branding ("ROOT FURTHER") and provides a single authentication method:
**Google OAuth via Supabase Auth** (full-page redirect flow, not popup). No email/password form
exists. The screen also includes a language switcher (default: Vietnamese) in the header.

Layout: full-viewport dark theme, 1440 × 1024 px desktop baseline. Login card is left-aligned
in the lower-left quadrant.

---

## User Scenarios & Testing

### User Story 1 — Google Login (Priority: P1)

A visitor authenticates using their Google account to access the SAA 2025 platform.

**Why this priority**: Auth is the gate to the entire application.

**Independent Test**: Open `/login` → click button → complete Google OAuth → assert redirect to
home. Test error path via `/auth/callback?error=server_error`.

**Acceptance Scenarios**:

1. **Given** an unauthenticated user on `/login`, **When** they click "LOGIN With Google",
   **Then** the button is disabled (prevents double-click during initiation) and the browser
   performs a full-page redirect to the Google OAuth consent screen.

2. **Given** the user completes Google authorization, **When** `/auth/callback?code=<code>` is
   hit, **Then** the system: (a) exchanges the code for a session, (b) upserts the `profiles`
   record (updating `email`, `full_name`, `avatar_url`, `updated_at` only — `role` and
   `created_at` preserved on conflict), (c) redirects to `NEXT_PUBLIC_POST_LOGIN_URL`.

3. **Given** `signInWithOAuth` throws a client-side error (Supabase unreachable, provider
   misconfigured), **When** the error is caught, **Then** the button is re-enabled and an inline
   error alert appears above B.3 (same position as B.err) with: "Đăng nhập thất bại. Vui lòng
   thử lại." No redirect occurs.

4. **Given** the user denies consent (`?error=access_denied` on callback), **When** the callback
   is hit, **Then** redirect to `/login` with no query params (silent cancel — user chose not to
   authenticate). The login page loads fresh; no error shown.

5. **Given** any other OAuth/Supabase error on callback (`?error=` ≠ `access_denied`), **When**
   the callback is processed, **Then** redirect to `/login?error=auth_failed`. The error alert
   (B.err) renders with the retry message.

6. **Given** `/auth/callback` is hit with neither `code` nor `error` params (direct navigation),
   **When** the route handler processes the request, **Then** redirect to `/login`.

7. **Given** an already-authenticated user navigates to `/login`, **When** the middleware runs,
   **Then** server-side redirect to `NEXT_PUBLIC_POST_LOGIN_URL` before any page renders (no
   login UI flash).

---

### User Story 2 — Language Switch (Priority: P2)

A visitor changes the UI language via the header language selector.

**Why this priority**: Internationalization for non-Vietnamese speakers; non-blocking for auth.

**Independent Test**: Open `/login` → click selector → switch language → assert text updates →
reload → assert language preserved.

**Acceptance Scenarios**:

1. **Given** the page is loaded (default: Vietnamese, derived from `lang` cookie or browser
   `Accept-Language` header as fallback), **When** the user clicks A.2, **Then** a dropdown
   lists all supported languages with flags.

2. **Given** the dropdown is open, **When** the user selects a language, **Then**: the dropdown
   closes; the `lang` cookie is written client-side; all visible text on the page (B.2, B.3
   label, D footer) re-renders in the selected language without a full page reload (client-side
   i18n update).

3. **Given** a language has been selected, **When** the user reloads the page, **Then** the
   server reads the `lang` cookie and renders the page in that language from the first byte
   (no hydration flash). Cookie spec: name `lang`, `SameSite=Lax`, `Max-Age=31536000` (1 yr),
   **not** `HttpOnly` (must be JS-readable for client-side i18n).

---

### Edge Cases

- **Google OAuth unavailable**: `/auth/callback` receives no valid `code` and no `error` → treat
  as scenario 6 above (redirect to `/login`).
- **Domain restriction** (if enabled): `hd` param in `signInWithOAuth`; out-of-domain accounts
  receive `access_denied` → silent redirect to `/login`. A specific UX message may be needed —
  see Open Question #2.
- **Mobile viewports (≥ 375 px)**: Login card reflows full-width; button remains tappable.
- **`?error=auth_failed` persists on back-navigation**: B.err dismiss calls `router.replace('/login')`
  (strips query params without adding history entry) so back-navigation doesn't re-show the error.

---

## UI/UX Requirements *(from Figma)*

### Screen Layout

Canvas: **1440 × 1024 px** desktop baseline. Full-viewport dark bg with abstract gradient image
(C) covering right ~60 % of the screen.

### Screen Components

| ID | Component | Description | Interactions |
|----|-----------|-------------|--------------|
| A | Header (`mms_A_Header`) | 1440 × 80 px, `rgba(11,15,18,0.8)`, padding `12px 144px`, flex space-between | Static |
| A.1 | Logo (`mms_A.1_Logo`) | Sun Annual Awards logo, 52 × 48 px | Click → `/` *[assumption — confirm SCREENFLOW.md]* |
| A.2 | Language Switcher (`mms_A.2_Language`) | 108 × 56 px, VN flag + label + chevron | Click → open language dropdown |
| B | Content Panel (`mms_B_Bìa`) | Left-aligned, contains B.1, B.err slot, B.2, B.3 | Static container |
| B.1 | Key Visual (`mms_B.1_Key Visual`) | "ROOT FURTHER" logo image, 451 × 200 px | Decorative |
| B.err | Error Alert *(behavior-only)* | Inline alert above B.3, below B.2; visible only when `?error=auth_failed`. Text: "Đăng nhập thất bại. Vui lòng thử lại." + dismiss button. | Dismiss → `router.replace('/login')` |
| B.2 | Tagline (`mms_B.2_content`) | "Bắt đầu hành trình của bạn cùng SAA 2025. Đăng nhập để khám phá!" (i18n) | Static |
| B.3 | Login Button (`mms_B.3_Login`) | 305 × 60 px, `#FFEA9E`, radius 8 px, "LOGIN With Google" + Google icon 24 × 24 px | Click → Google OAuth (full-page redirect); disabled during initiation |
| C | Background (`mms_C_Keyvisual`) | Abstract gradient image, right portion | Decorative, lazy-loaded |
| D | Footer (`mms_D_Footer`) | 1440 × 91 px, border-top `1px solid #2E3940`, copyright text (i18n) | Static |

### Navigation Flow

- **From**: Unauthenticated access (direct URL or middleware redirect from protected route)
- **To (success)**: `NEXT_PUBLIC_POST_LOGIN_URL` (default `/`, TBD — Open Question #1)
- **To (client error)**: Stay on `/login`, show B.err inline
- **To (callback error)**: `/login?error=auth_failed`, show B.err
- **To (cancel)**: `/login` (clean, no query params)
- **To (already auth)**: Server middleware → `NEXT_PUBLIC_POST_LOGIN_URL`

### Visual & Responsive Requirements

- Base bg `#0B0F12`. Background (C) MUST NOT obscure login card (B).
- Mobile ≥ 375 px: login card reflows full-width.
- B.3 hover: darken `#FFEA9E` ~10 %.
- B.3 disabled state (during OAuth initiation): reduced opacity, `cursor: not-allowed`.
- Accessibility: B.3 `aria-label="Sign in with Google"`; A.2 `aria-label="Select language"` +
  `aria-expanded`; B.err `role="alert"` (screen reader announces immediately on mount).

---

## Requirements

### Functional Requirements

- **FR-001**: System MUST provide exactly one auth method: Google OAuth via Supabase Auth.
- **FR-002**: On successful OAuth callback, system MUST upsert `profiles` (conflict columns:
  `email`, `full_name`, `avatar_url`, `updated_at` only) then redirect to
  `NEXT_PUBLIC_POST_LOGIN_URL`.
- **FR-003**: On `access_denied` callback, system MUST redirect to `/login` with no query params
  (silent cancel, no error shown).
- **FR-004**: On any other OAuth/Supabase error (callback or client-side), system MUST display
  B.err inline alert. Callback errors redirect to `/login?error=auth_failed`; client-side errors
  stay on the page.
- **FR-005**: An already-authenticated user accessing `/login` MUST be server-redirected to
  `NEXT_PUBLIC_POST_LOGIN_URL` before any login UI renders.
- **FR-006**: Language selector MUST support ≥ VN and EN. Selection persists via `lang` HTTP
  cookie. Server MUST read `lang` cookie on initial render to avoid hydration flash.
- **FR-007**: Login button MUST be disabled from click until either: (a) the OAuth redirect
  succeeds (page navigates away), or (b) a client-side error is caught (re-enable + show error).
  No `visibilitychange` listener needed (redirect-based flow, not popup).
- **FR-008**: B.err dismiss MUST call `router.replace('/login')` to strip `?error` param without
  adding a history entry.

### Technical Requirements

- **TR-001**: Client-side OAuth trigger MUST use `@supabase/ssr` `createBrowserClient`. The
  `/auth/callback` route handler MUST use `createServerClient`. Session tokens managed via
  HTTP-only cookies exclusively.
- **TR-002**: The `/auth/callback` route handler MUST handle all param combinations:
  - `?code=<code>` → `exchangeCodeForSession(code)` → upsert `profiles` → redirect to
    `NEXT_PUBLIC_POST_LOGIN_URL`.
  - `?error=access_denied` → redirect to `/login`.
  - `?error=<other>` → redirect to `/login?error=auth_failed`.
  - No params → redirect to `/login`.
- **TR-003**: Environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL` — public, browser client.
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — public (anon key is intentionally public).
  - `NEXT_PUBLIC_SITE_URL` — public, builds `redirectTo`.
  - `NEXT_PUBLIC_POST_LOGIN_URL` — public, post-auth destination.
  - `SUPABASE_SERVICE_ROLE_KEY` — **server-only, NEVER `NEXT_PUBLIC_`**.
- **TR-004**: `signInWithOAuth` call:
  ```ts
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` },
  })
  if (error) { /* show B.err inline, re-enable button */ }
  ```
- **TR-005**: OAuth redirect URL in Supabase Dashboard MUST exactly match
  `NEXT_PUBLIC_SITE_URL + '/auth/callback'` per environment.
- **TR-006**: Next.js `middleware.ts` MUST match `/login` and check session via `getUser()`.
  If session valid → redirect to `NEXT_PUBLIC_POST_LOGIN_URL`.
- **TR-007**: LCP < 2.5 s, CLS < 0.1. Background (C) lazy-loaded. B.1 logo uses
  `<Image priority />`.

### Key Entities

**User** (`auth.users`, Supabase-managed, read-only):
- `id` (uuid), `email`, `raw_user_meta_data.full_name`, `raw_user_meta_data.avatar_url`

**Profile** (`profiles` table, upserted in `/auth/callback`):

| Column | Type | Constraints | Upsert behavior |
|--------|------|-------------|-----------------|
| `id` | uuid | PK, FK → `auth.users.id` ON DELETE CASCADE | Conflict key |
| `email` | text | NOT NULL | Updated |
| `full_name` | text | | Updated |
| `avatar_url` | text | | Updated |
| `role` | text | NOT NULL, default `'user'` | **Preserved** (never overwritten on login) |
| `created_at` | timestamptz | NOT NULL, default `now()` | **Preserved** |
| `updated_at` | timestamptz | NOT NULL, default `now()` | Updated (app-level in upsert call) |

> Additional SAA-specific columns pending — see Open Question #4.

**RLS Policies (required by constitution Principle IV):**

| Policy | Command | Expression |
|--------|---------|------------|
| Users read own profile | SELECT | `auth.uid() = id` |
| Users update own profile | UPDATE | `auth.uid() = id` |
| Service role upsert (callback) | INSERT, UPDATE | Via server client with service role key — bypasses RLS |

---

## API Dependencies

| Endpoint / SDK Call | Method | Purpose | Status |
|---------------------|--------|---------|--------|
| `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })` | Client SDK | Initiate OAuth; handle returned `error` client-side | Supabase built-in |
| `/auth/callback` | GET (route handler) | Handles `code`, `error`, or empty params | **New** |
| `supabase.auth.exchangeCodeForSession(code)` | Server SDK | PKCE code exchange | Supabase built-in |
| `supabase.auth.getUser()` | Server SDK | Session guard in `middleware.ts` | Supabase built-in |
| `supabase.from('profiles').upsert({ id, email, full_name, avatar_url, updated_at }, { onConflict: 'id', ignoreDuplicates: false })` | Server SDK | Create/refresh profile; `role` + `created_at` excluded from update set | **New** |

---

## Success Criteria

- **SC-001**: Valid Google user logs in in ≤ 3 clicks, lands on home page.
- **SC-002**: Client-side or callback error shows B.err alert within 2 s.
- **SC-003**: Authenticated user on `/login` redirected server-side < 500 ms, no UI flash.
- **SC-004**: Core Web Vitals: LCP < 2.5 s, CLS < 0.1, INP < 200 ms.
- **SC-005**: No double-submission possible (button disabled on click, synchronous error re-enables it).

---

## Out of Scope

- Email/password or other social providers.
- Explicit user registration UI (`auth.users` created by Supabase; `profiles` upserted on first login).
- "Forgot password" / account recovery.
- Role elevation (default `role = 'user'`; handled post-auth elsewhere).

---

## Dependencies

- [x] Constitution (`.momorph/constitution.md`)
- [ ] `SCREENFLOW.md` — post-login route (Open Question #1)
- [ ] `profiles` table full schema finalized (Open Question #4)
- [ ] Supabase project created; Google OAuth provider + allowed redirect URLs configured
- [ ] Env vars set: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
      `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_POST_LOGIN_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] i18n library chosen; VN + EN translation files scaffolded
- [ ] RLS migration for `profiles` table written and reviewed

---

## Open Questions

1. **Post-login redirect route** — `/`, `/home`, or `/dashboard`? Finalize in SCREENFLOW.md.
2. **Google domain restriction** — restrict to `sun-asterisk.com` only? If yes, add
   `hd: 'sun-asterisk.com'` to `signInWithOAuth` options AND update `access_denied` handling to
   show a specific error ("Tài khoản không được phép") instead of silent redirect.
3. **Supported languages** — VN + EN only, or more locales planned?
4. **`profiles` full schema** — SAA-specific fields beyond 7 defined (`department`,
   `employee_id`, `award_category`, etc.)?
5. **A.1 logo click** — `/` (same page) or external marketing site?
6. **Supabase JWT session duration** — configured expiry? Affects session-refresh behavior.

---

## Notes

- "SAA 2025" = Sun Annual Awards 2025. "ROOT FURTHER" is the event theme.
- Figma shows VN only; i18n keys needed for all user-facing strings.
- Design tokens for `globals.css`: `--color-cta-primary: #FFEA9E`,
  `--color-header-bg: rgba(11,15,18,0.8)`, `--color-divider: #2E3940`.
- `profiles` upsert uses service role key server-side to bypass RLS cleanly.
  RLS still required for client-facing reads/updates.
