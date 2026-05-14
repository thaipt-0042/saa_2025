# Implementation Plan: Login

**Frame**: `GzbNeVGJHz-Login`
**Date**: 2026-05-14
**Spec**: `.momorph/contexts/specs/GzbNeVGJHz-Login/spec.md`

---

## Summary

Implement the SAA 2025 Login screen: full-page Google OAuth via Supabase Auth, `profiles` table
upsert on first login, cookie-based language switcher (VN/EN, no URL-prefix routing), and inline
error handling. Codebase is a bare Next.js 16 App Router scaffold — all auth, i18n, and testing
infrastructure must be created from scratch.

---

## Technical Context

**Language/Framework**: TypeScript 5 / Next.js 16 (App Router)
**Primary Dependencies**: React 19, Tailwind CSS 4, `@supabase/ssr`, `next-intl` v3
**Database**: PostgreSQL via Supabase (hosted)
**Testing**: Vitest + Testing Library (unit/integration), Playwright (E2E)
**State Management**: React `useState` only (no global store needed for login)
**API Style**: Supabase SDK + Next.js route handlers (thin handler → service)

---

## Constitution Compliance Check

*GATE: Must pass before implementation can begin*

- [x] Feature-based folder structure (`app/login/`, `app/auth/`)
- [x] Tailwind + CSS variables only — no hardcoded hex in components
- [x] TDD: failing tests committed before implementation (Principle III)
- [x] Supabase SSR `createServerClient` per-request for route handler; `createBrowserClient` for
      client components (Principle IV)
- [x] Session tokens in HTTP-only cookies — no `localStorage` (Principles IV, VI)
- [x] RLS migration included in this plan (Principle IV)
- [x] `npm audit` gate before PR merge (Principle VI)
- [x] WCAG 2.1 AA: `aria-label` on button and language selector (Principle VII)
- [x] Mobile-first responsive layout (Principle VII)
- [x] TypeScript strict mode; no `any`; Zod validation at boundaries (Principle V)
- [x] ESLint zero-errors on commit (Principle V)

**Violations requiring justification**:

| Violation | Justification | Alternative Rejected |
|-----------|---------------|---------------------|
| `@supabase/ssr` (new dep) | Required for App Router cookie-based session management | `@supabase/auth-helpers-nextjs` deprecated; raw cookie handling error-prone |
| `next-intl` (new dep) | Only App Router i18n lib with SSR cookie locale detection + `router.refresh()` no-reload switch | `react-i18next`: context-based, breaks RSC; `i18next`: same issue |
| `vitest` (new dep) | Faster than Jest, native ESM, compatible with Next.js App Router | Jest: slower, needs complex transform config for RSC |

---

## Architecture Decisions

### Frontend Approach

- **Component Structure**: Feature-based — `app/login/` owns the page and its sub-components
  (in `_components/` prefix, non-routable). Shared layout elements in `app/components/`.
- **Styling Strategy**: Tailwind CSS 4 utilities + CSS variables in `app/globals.css`. Four new
  tokens: `--color-cta-primary`, `--color-header-bg`, `--color-divider`, `--color-bg-base`.
- **Data Fetching**: No data fetching on login page. Server Component reads `lang` cookie and
  `?error` search param; passes both as props to the Client Component.
- **Client vs Server split**:
  - `app/login/page.tsx` → Server Component (reads `lang` cookie via `cookies()`, reads
    `searchParams.error`)
  - `app/login/_components/login-page-client.tsx` → Client Component (`'use client'`, handles
    OAuth button state and error alert)
  - `app/components/language-switcher.tsx` → Client Component (dropdown + cookie write +
    `router.refresh()`)

### i18n Architecture (cookie-based, no URL prefix)

**Approach**: next-intl v3 without URL-prefix routing. Locale is stored in the `lang` cookie
and read server-side via `i18n/request.ts`. Language switch writes the cookie client-side then
calls `router.refresh()` which re-runs Server Components without a full page navigation.

- `i18n/request.ts` — `getRequestConfig` reads `lang` cookie; falls back to `vi`.
- `next.config.ts` — wrapped with `createNextIntlPlugin('./i18n/request.ts')`.
- `app/layout.tsx` — fetches translations server-side; passes to `NextIntlClientProvider`.
- `app/components/language-switcher.tsx` — writes cookie, calls `router.refresh()`.

This satisfies spec requirement: "re-renders in the selected language without a full page reload".

### Backend Approach

- **API Design**: One route handler `app/auth/callback/route.ts` (GET). Thin handler delegates
  to `lib/auth/auth-service.ts`.
- **Data Access**: `lib/supabase/server.ts` exports `createClient(cookieStore)` per-request
  factory. Services call the SDK — no raw SQL.
- **Validation**: Zod schema validates the upsert payload shape before DB call.
- **Middleware**: `middleware.ts` at project root — matches `/login`, calls `supabase.auth.getUser()`,
  redirects authenticated users to `NEXT_PUBLIC_POST_LOGIN_URL`.

### Integration Points

- **Supabase Auth**: Google OAuth provider configured in Supabase Dashboard.
- **`profiles` table**: SQL migration with RLS policies.
- **`next-intl`**: `i18n/request.ts` + `withNextIntl` plugin; no middleware locale routing.

---

## Project Structure

### New Files

| File | Purpose |
|------|---------|
| `middleware.ts` | Session guard — redirect authenticated users away from `/login` |
| `next.config.ts` (replace existing) | Add `createNextIntlPlugin` wrapper |
| `vitest.config.ts` | Vitest config: `@vitejs/plugin-react`, `jsdom` environment |
| `playwright.config.ts` | Playwright config: base URL, test dir, browser targets |
| `i18n/request.ts` | next-intl `getRequestConfig` — reads `lang` cookie, loads messages |
| `messages/vi.json` | Vietnamese translation strings |
| `messages/en.json` | English translation strings |
| `app/login/page.tsx` | Server Component — reads `lang` cookie + `searchParams.error` |
| `app/login/_components/login-page-client.tsx` | Client Component — button state, error alert |
| `app/login/_components/login-button.tsx` | Google OAuth button (loading/disabled state) |
| `app/login/_components/error-alert.tsx` | Dismissible inline error alert (`role="alert"`) |
| `app/login/_components/login-page-client.test.tsx` | Component tests: button states, error alert |
| `app/login/_components/login-button.test.tsx` | Unit test: disabled on click, re-enables on error |
| `app/login/_components/error-alert.test.tsx` | Unit test: renders on `hasError`, dismiss calls `router.replace` |
| `app/auth/callback/route.ts` | OAuth callback — code exchange, profile upsert, redirects |
| `app/auth/callback/route.test.ts` | Integration tests for all 4 callback param combinations |
| `app/components/header.tsx` | Shared header (logo + language switcher slot) |
| `app/components/language-switcher.tsx` | Language dropdown (writes `lang` cookie + `router.refresh()`) |
| `app/components/language-switcher.test.tsx` | Unit test: cookie write, dropdown open/close, refresh call |
| `app/components/footer.tsx` | Shared footer (copyright text, i18n) |
| `lib/supabase/client.ts` | `createBrowserClient` factory for Client Components |
| `lib/supabase/server.ts` | `createServerClient(cookieStore)` factory for Server Components + route handlers |
| `lib/auth/auth-service.ts` | `signInWithGoogle()`, `handleOAuthCallback({ code, error })` |
| `lib/auth/profile-service.ts` | `upsertProfile(user)` — profiles upsert, `role`/`created_at` excluded |
| `lib/auth/auth-service.test.ts` | Unit tests for auth-service (mocked Supabase) |
| `lib/auth/profile-service.test.ts` | Unit tests: upsert payload, column exclusions |
| `types/database.ts` | TypeScript types for `profiles` table row |
| `tests/e2e/login.spec.ts` | Playwright E2E — 5 acceptance scenarios |
| `supabase/migrations/001_create_profiles.sql` | `profiles` table DDL + RLS policies |
| `.env.example` | Documented env var template (committed) |
| `public/assets/login/logos/saa-logo.png` | Sun Annual Awards logo (Figma node `I662:14391;178:1033;178:1030`) |
| `public/assets/login/logos/root-further-logo.png` | "ROOT FURTHER" logo (node `2939:9548`) |
| `public/assets/login/images/key-visual-bg.jpg` | Background gradient image (node `662:14389`) |
| `public/assets/login/icons/google-icon.svg` | Google "G" icon (node `I662:14426;186:1766`) |

### Modified Files

| File | Changes |
|------|---------|
| `next.config.ts` | Replace default export with `createNextIntlPlugin('./i18n/request.ts')(nextConfig)` |
| `app/globals.css` | Add 5 design tokens: `--color-cta-primary: #FFEA9E`, `--color-cta-text: #00101A`, `--color-header-bg: rgba(11,15,18,0.8)`, `--color-divider: #2E3940`, `--color-bg-base: #00101A` |
| `app/layout.tsx` | Load `Montserrat` (weight 700) and `Montserrat_Alternates` (weight 700) via `next/font/google`; expose as CSS variables `--font-montserrat` and `--font-montserrat-alt`; wrap with `NextIntlClientProvider`; read locale + messages server-side; update metadata |
| `package.json` | Add runtime + dev dependencies (see Dependencies table) |

### Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@supabase/supabase-js` | ^2.x | Supabase base client |
| `@supabase/ssr` | ^0.x | Cookie-based session for App Router |
| `next-intl` | ^3.x | App Router i18n with SSR cookie locale (no URL prefix) |
| `zod` | ^3.x | Boundary validation for upsert payload and env vars |
| `vitest` | ^2.x | Unit/integration test runner |
| `@vitejs/plugin-react` | ^4.x | Vitest React support |
| `jsdom` | ^24.x | Vitest DOM environment for component tests |
| `@testing-library/react` | ^16.x | Component testing utilities |
| `@testing-library/user-event` | ^14.x | Simulated user interactions |
| `@testing-library/jest-dom` | ^6.x | Custom matchers (`toBeInTheDocument`, etc.) |
| `@playwright/test` | ^1.x | E2E test framework |

---

## Implementation Approach

### Phase 0: Asset Preparation

Download all required visual assets from Figma before writing any UI code.

- Use MCP tools `get_media_files` / `list_media_nodes` to download:
  - SAA logo (node `I662:14391;178:1033;178:1030`) → `public/assets/login/logos/saa-logo.png`
  - ROOT FURTHER logo (node `2939:9548`) → `public/assets/login/logos/root-further-logo.png`
  - Key visual background (node `662:14389`) → `public/assets/login/images/key-visual-bg.jpg`
  - Google icon (node `I662:14426;186:1766`) → `public/assets/login/icons/google-icon.svg`
- Verify all filenames are kebab-case (Principle II).
- Assets MUST exist before Phase 6 UI work references them.

### Phase 1: Foundation & Infrastructure

*No user-facing output. Establishes the base all phases build on.*

1. Install runtime deps: `npm install @supabase/supabase-js @supabase/ssr next-intl zod`
2. Install dev deps: `npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom @playwright/test`
3. Create `vitest.config.ts` with `@vitejs/plugin-react`, `environment: 'jsdom'`, and
   `setupFiles: ['@testing-library/jest-dom/vitest']`.
4. Create `playwright.config.ts` with `baseURL: process.env.BASE_URL ?? 'http://localhost:3000'`,
   `testDir: './tests/e2e'`, and at minimum `chromium` browser.
5. Create `.env.example` documenting all 5 required env vars.
6. Create `lib/supabase/client.ts` exporting `createBrowserClient` factory.
7. Create `lib/supabase/server.ts` exporting `createClient(cookieStore)` per-request factory
   using `createServerClient` from `@supabase/ssr`.
8. Create `i18n/request.ts` with `getRequestConfig` that reads the `lang` cookie and returns
   locale + imported messages. Fallback locale: `vi`.
9. Create `messages/vi.json` and `messages/en.json` with all user-facing strings from the spec:
   - `login.tagline`, `login.button`, `login.errorMessage`, `footer.copyright`,
     `language.selectLabel`.
10. Update `next.config.ts` with `createNextIntlPlugin('./i18n/request.ts')` wrapper.
11. Load `Montserrat` (weight: `['700']`) and `Montserrat_Alternates` (weight: `['700']`) in `app/layout.tsx`
    via `next/font/google`. Assign CSS variables `--font-montserrat` and `--font-montserrat-alt` on `<html>`.
12. Add 5 design tokens to `app/globals.css`: `--color-cta-primary`, `--color-cta-text`, `--color-header-bg`,
    `--color-divider`, `--color-bg-base`. **`--color-bg-base` = `#00101A`** (not `#0B0F12`).

### Phase 2: Database Layer

*Must be completed before auth service integration tests run.*

1. Create `supabase/migrations/001_create_profiles.sql`:
   ```sql
   CREATE TABLE IF NOT EXISTS profiles (
     id           uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
     email        text        NOT NULL,
     full_name    text,
     avatar_url   text,
     role         text        NOT NULL DEFAULT 'user',
     created_at   timestamptz NOT NULL DEFAULT now(),
     updated_at   timestamptz NOT NULL DEFAULT now()
   );
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "Users read own profile"   ON profiles FOR SELECT USING (auth.uid() = id);
   CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
   ```
2. Create `types/database.ts` with `Profile` TypeScript interface matching all 7 columns.
3. Apply migration via Supabase CLI (`supabase db push`) or Supabase Dashboard SQL editor.
4. Verify: anon client `SELECT` against `profiles` without auth → empty result (RLS blocks).
   Service role client `SELECT` → returns rows (bypasses RLS).

### Phase 3: Auth Service — TDD (US1 core)

*TDD: write failing tests → confirm red → implement → green → refactor.*

**3a. `lib/auth/auth-service.ts`**

Failing tests to write first (Vitest, Supabase client mocked with `vi.mock`):
- `signInWithGoogle()` — calls `signInWithOAuth` with `provider: 'google'` and correct `redirectTo`.
- `signInWithGoogle()` — when SDK returns `{ error: AuthError }`, propagates the error.
- `handleOAuthCallback({ code: 'valid' })` — calls `exchangeCodeForSession('valid')`.
- `handleOAuthCallback({ error: 'access_denied' })` — returns `{ type: 'cancelled' }`.
- `handleOAuthCallback({ error: 'server_error' })` — returns `{ type: 'auth_failed' }`.
- `handleOAuthCallback({})` (no code, no error) — returns `{ type: 'no_params' }`.

`handleOAuthCallback` signature:
```ts
type CallbackResult =
  | { type: 'success'; session: Session }
  | { type: 'cancelled' }
  | { type: 'auth_failed' }
  | { type: 'no_params' }

function handleOAuthCallback(
  params: { code?: string; error?: string }
): Promise<CallbackResult>
```

**3b. `lib/auth/profile-service.ts`**

Failing tests:
- `upsertProfile(user)` — calls `supabase.from('profiles').upsert(...)` with payload containing
  `{ id, email, full_name, avatar_url, updated_at }` and `onConflict: 'id'`.
- `upsertProfile(user)` — payload does NOT contain `role` or `created_at`.

### Phase 4: Callback Route Handler (US1)

Failing integration tests (Vitest, real Supabase test-env or mocked service layer):

| Test | Input | Expected response |
|------|-------|-------------------|
| Success | `GET /auth/callback?code=valid_code` | 302 → `NEXT_PUBLIC_POST_LOGIN_URL` |
| Cancel | `GET /auth/callback?error=access_denied` | 302 → `/login` |
| Error | `GET /auth/callback?error=server_error` | 302 → `/login?error=auth_failed` |
| No params | `GET /auth/callback` | 302 → `/login` |

Implementation: thin handler reads `url.searchParams`, calls `authService.handleOAuthCallback()`,
calls `profileService.upsertProfile()` on success, returns `NextResponse.redirect(...)`.

### Phase 5: Middleware (US1 Scenario 7)

Failing test:
- Request with valid session cookie to `GET /login` → `302` to `NEXT_PUBLIC_POST_LOGIN_URL`.
- Request with no session cookie to `GET /login` → passes through (no redirect).

Implementation `middleware.ts`:
```ts
export const config = { matcher: ['/login'] }
export async function middleware(request: NextRequest) {
  // create supabase server client with request/response cookies
  // await supabase.auth.getUser()
  // if user → NextResponse.redirect(NEXT_PUBLIC_POST_LOGIN_URL)
  // else → NextResponse.next()
}
```

### Phase 6: Login Page UI (US1 + US2)

**Responsive-first**: All components MUST use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`).
Mobile baseline ≥ 375 px must be implemented and verified here, not deferred to Polish.

**6a — Component tests (write BEFORE implementation):**

`login-button.test.tsx`:
- Renders with label "LOGIN With Google" and Google icon.
- Calls `onLogin` prop on click.
- Shows `aria-label="Sign in with Google"`.
- Applies `disabled` + `cursor-not-allowed` when `isPending=true`.

`error-alert.test.tsx`:
- Renders message when visible.
- Has `role="alert"`.
- Calls `onDismiss` on dismiss button click.
- `onDismiss` triggers `router.replace('/login')`.

`login-page-client.test.tsx`:
- Button renders enabled initially.
- Button disables after click (before OAuth redirect).
- Error alert renders when `hasError=true`.
- Error alert hidden when `hasError=false`.

`language-switcher.test.tsx`:
- Renders current locale label and flag.
- Clicking opens dropdown listing available locales.
- Selecting a locale writes `lang` cookie + calls `router.refresh()`.
- Has `aria-label="Select language"` + `aria-expanded` toggled.

**6b — Implement components after tests fail:**

- `app/login/_components/login-button.tsx`
  - Button layout: text **LEFT** (`"LOGIN With Google"`, 225px, Montserrat 700 22px, color `--color-cta-text`),
    Google icon **RIGHT** (24×24px). **Do NOT put icon on the left** — Figma is non-standard here.
  - Use `var(--font-montserrat)` for font-family on the button text.
- `app/login/_components/error-alert.tsx`
- `app/login/_components/login-page-client.tsx`
- `app/components/header.tsx`
- `app/components/language-switcher.tsx`
  - Inner dropdown trigger has `border-radius: 4px` (not 8px).
- `app/components/footer.tsx`
  - Uses `var(--font-montserrat-alt)` (Montserrat Alternates) — different from rest of page.

**6c — Page assembly:**

`app/login/page.tsx` must include **two decorative gradient overlay `<div>`s** (absolute, `inset-0`,
`pointer-events-none`, sandwiched between the background `<Image>` and the content):
- Horizontal fade: `linear-gradient(90deg, #00101A 0%, #00101A 25.41%, transparent 100%)`
- Vertical/bottom fade: `linear-gradient(0deg, #00101A 22.48%, transparent 51.74%)`

These correspond to Figma nodes `662:14392` (Rectangle 57) and `662:14390` (Cover).

`app/login/page.tsx` (Server Component):
```ts
import { cookies } from 'next/headers'
// read lang cookie → locale
// read searchParams.error
// fetch messages via getMessages(locale)
// render <NextIntlClientProvider> wrapping <LoginPageClient hasError={...} />
```

**6d — Layout update:**

`app/layout.tsx`: wrap root children with `NextIntlClientProvider locale={locale} messages={messages}`.
Read locale from cookie in the layout using `getLocale()` from `i18n/request.ts`.

### Phase 7: E2E Tests (US1 + US2)

All 5 spec acceptance scenarios covered with Playwright:

| Scenario | Approach |
|----------|----------|
| US1 happy path | Use Supabase test credentials + Google test account (or intercept OAuth callback via `page.route('/auth/callback*', ...)`) |
| US1 error path | Navigate to `/login?error=auth_failed` directly; assert B.err alert visible |
| US1 cancel path | Navigate to `/login`; assert no alert; assert button enabled |
| US1 already-auth guard | Inject valid session cookie before `page.goto('/login')`; assert redirect |
| US2 language switch | Click selector → assert text updates → reload → assert lang cookie preserved |

### Phase 8: Polish

- Verify `<Image priority />` on ROOT FURTHER logo (B.1); `loading="lazy"` on background (C).
- Run `npm audit` — fix any high/critical vulnerabilities.
- ESLint: `npm run lint` must return zero errors.
- Keyboard navigation: Tab through header, login button, dismiss button; assert focus order.
- Color contrast: verify golden button `#FFEA9E` on button text meets WCAG AA.

---

## Testing Strategy

| Type | Focus | Tools | Coverage Goal |
|------|-------|-------|---------------|
| Unit | `auth-service`, `profile-service` | Vitest + mocked Supabase | 90 %+ |
| Integration | `/auth/callback` route, `middleware` | Vitest + Supabase test env | 80 %+ |
| Component | Button states, error alert, language switcher | Vitest + Testing Library | 80 %+ |
| E2E | Full login flow, language switch | Playwright | All 5 acceptance scenarios |

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Supabase Google OAuth not configured | High — blocks all auth | Configure Dashboard before Phase 3; use dedicated test Google account |
| `profiles` RLS blocks server-side upsert | High — first login fails silently | Use `SUPABASE_SERVICE_ROLE_KEY` in callback route; integration test both anon + service role |
| next-intl `router.refresh()` causes hydration mismatch | Medium — lang flicker on switch | Use `setRequestLocale()` in `i18n/request.ts`; validate with E2E reload test |
| Open Question #1 (post-login route TBD) | Medium | Placeholder `/` is safe for MVP; controlled by `NEXT_PUBLIC_POST_LOGIN_URL` env var |
| Google OAuth popup blocked on mobile | Low — full-page redirect used, no popup | Redirect flow (not popup) — not affected by browser popup blockers |
| next-intl v3 breaking change in `next.config.ts` | Low | Use `createNextIntlPlugin` (v3.x stable API), not deprecated `withNextIntl` |

---

## Open Questions (Carry-forward from spec)

- [ ] **#1** Final post-login redirect route (`/`, `/home`, `/dashboard`)?
- [ ] **#2** Restrict to `sun-asterisk.com` Google accounts (`hd` param)?
- [ ] **#3** Languages beyond VN + EN?
- [ ] **#4** `profiles` SAA-specific columns?
- [ ] **#5** A.1 logo click destination (`/` vs external)?
- [ ] **#6** Supabase JWT session expiry?
