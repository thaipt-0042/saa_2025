# Tasks: Login

**Frame**: `GzbNeVGJHz-Login`
**Prerequisites**: plan.md ✅ · spec.md ✅ · design-style.md ✅

---

## Task Format

```
- [ ] T### [P?] [Story?] Description | file/path.ts
```

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: User story this belongs to (US1, US2)
- **|**: Primary file affected
- TDD gating: test tasks MUST fail before the corresponding implementation task begins

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies, configure test runners, download Figma assets.

- [x] T001 Install runtime dependencies (`@supabase/supabase-js @supabase/ssr next-intl zod`) | package.json
- [x] T002 [P] Install dev dependencies (`vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom @playwright/test`) | package.json
- [x] T003 [P] Create Vitest config (`@vitejs/plugin-react`, `environment: 'jsdom'`, setupFiles jest-dom) | vitest.config.ts
- [x] T004 [P] Create Playwright config (`baseURL`, `testDir: ./tests/e2e`, chromium target) | playwright.config.ts
- [x] T005 [P] Create .env.example documenting all 5 env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_POST_LOGIN_URL`, `SUPABASE_SERVICE_ROLE_KEY`) | .env.example
- [x] T006 Download Figma assets via MCP `get_media_files` for nodes `I662:14391;178:1033;178:1030` (SAA logo), `2939:9548` (ROOT FURTHER logo), `662:14389` (bg image), `I662:14426;186:1766` (Google icon) → `public/assets/login/` | public/assets/login/

---

## Phase 2: Foundation (Blocking Prerequisites)

**Purpose**: Core infrastructure required by ALL user stories — Supabase clients, i18n, design tokens, database.

⚠️ **CRITICAL**: No user story work begins until this phase is complete.

- [x] T007 Update `next.config.ts` — wrap with `createNextIntlPlugin('./i18n/request.ts')` | next.config.ts
- [x] T008 [P] Create browser Supabase client factory (`createBrowserClient` from `@supabase/ssr`) | lib/supabase/client.ts
- [x] T009 [P] Create server Supabase client factory (`createServerClient(cookieStore)` per-request, from `@supabase/ssr`) | lib/supabase/server.ts
- [x] T010 Create `i18n/request.ts` — `getRequestConfig` reads `lang` cookie, falls back to `vi`, imports message files | i18n/request.ts
- [x] T011 [P] Create Vietnamese translation file — keys: `login.tagline`, `login.button`, `login.errorMessage`, `footer.copyright`, `language.selectLabel` | messages/vi.json
- [x] T012 [P] Create English translation file — same keys as vi.json | messages/en.json
- [x] T013 [P] Create TypeScript `Profile` interface matching all 7 `profiles` columns (`id`, `email`, `full_name`, `avatar_url`, `role`, `created_at`, `updated_at`) | types/database.ts
- [x] T014 Add 5 design tokens to `:root` in globals.css: `--color-cta-primary: #FFEA9E`, `--color-cta-text: #00101A`, `--color-header-bg: rgba(11,15,18,0.8)`, `--color-divider: #2E3940`, `--color-bg-base: #00101A` | app/globals.css
- [x] T015 Update `app/layout.tsx` — load `Montserrat` (weight 700) and `Montserrat_Alternates` (weight 700) via `next/font/google`; expose as `--font-montserrat` / `--font-montserrat-alt` CSS vars on `<html>`; wrap with `NextIntlClientProvider` | app/layout.tsx
- [x] T016 Create profiles table migration SQL (`CREATE TABLE IF NOT EXISTS profiles ... ALTER TABLE profiles ENABLE ROW LEVEL SECURITY ...` with 2 RLS policies) | supabase/migrations/001_create_profiles.sql
- [x] T017 Apply migration to Supabase project (`supabase db push` or Dashboard SQL editor); verify: anon client SELECT → blocked by RLS; service-role client SELECT → returns rows | (database verification step)

**Checkpoint**: All infrastructure ready — user story implementation can now begin.

---

## Phase 3: User Story 1 — Google Login (Priority: P1) 🎯 MVP

**Goal**: Unauthenticated user clicks button → Google OAuth redirect → callback exchanges code → upserts `profiles` → redirects to home. Errors and already-authenticated guard both handled.

**Independent Test**: Navigate `/login` → click button → complete OAuth → assert redirect to `NEXT_PUBLIC_POST_LOGIN_URL`. Test error path via `/login?error=auth_failed`. Test authenticated-user guard by injecting session cookie before navigating to `/login`.

### Backend Auth Services (TDD — tests fail first)

- [x] T018 [P] Write **failing** Vitest tests for `signInWithGoogle()` (correct provider + redirectTo) and `handleOAuthCallback()` (all 4 return types: success/cancelled/auth_failed/no_params) | lib/auth/auth-service.test.ts
- [x] T019 [P] Write **failing** Vitest tests for `upsertProfile()` — assert upsert payload contains `{id, email, full_name, avatar_url, updated_at}` and does NOT contain `role` or `created_at`; assert `onConflict: 'id'` | lib/auth/profile-service.test.ts
- [x] T020 Implement `auth-service.ts` — `signInWithGoogle()` + `handleOAuthCallback({ code?, error? }): Promise<CallbackResult>` using `createBrowserClient` / `createServerClient` respectively; run T018 tests → all green | lib/auth/auth-service.ts
- [x] T021 Implement `profile-service.ts` — `upsertProfile(user)` with Zod-validated payload, `onConflict: 'id'`, excludes `role`/`created_at`; run T019 tests → all green | lib/auth/profile-service.ts

### Callback Route Handler (TDD — tests fail first)

- [x] T022 Write **failing** Vitest integration tests for all 4 `GET /auth/callback` param combinations: `?code=valid_code` → 302 to `NEXT_PUBLIC_POST_LOGIN_URL`; `?error=access_denied` → 302 to `/login`; `?error=server_error` → 302 to `/login?error=auth_failed`; no params → 302 to `/login` | app/auth/callback/route.test.ts
- [x] T023 Implement `/auth/callback` route handler — thin handler reads `url.searchParams`, delegates to `authService.handleOAuthCallback()`, calls `profileService.upsertProfile()` on success, returns `NextResponse.redirect()`; run T022 tests → all green | app/auth/callback/route.ts

### Middleware Auth Guard (TDD — tests fail first)

- [x] T024 Write **failing** Vitest tests for middleware: request with valid session cookie to `GET /login` → 302 to `NEXT_PUBLIC_POST_LOGIN_URL`; request without session → passes through (no redirect) | middleware.test.ts
- [x] T025 Implement `middleware.ts` — matches `/login`, calls `supabase.auth.getUser()` via `createServerClient`, redirects authenticated users; run T024 tests → all green | middleware.ts

### Login UI Components (TDD — tests fail first, all 3 test files can run in parallel)

- [x] T026 [P] Write **failing** component tests for `login-button`: renders "LOGIN With Google" label; calls `onLogin` prop on click; has `aria-label="Sign in with Google"`; applies `disabled` + `cursor-not-allowed` when `isPending=true` | app/login/_components/login-button.test.tsx
- [x] T027 [P] Write **failing** component tests for `error-alert`: renders message when visible; has `role="alert"`; calls `onDismiss` on dismiss click; `onDismiss` triggers `router.replace('/login')` | app/login/_components/error-alert.test.tsx
- [x] T028 [P] Write **failing** component tests for `login-page-client`: button enabled initially; button disables after click; error alert renders when `hasError=true`; alert hidden when `hasError=false` | app/login/_components/login-page-client.test.tsx
- [x] T029 Implement `login-button.tsx` — layout: text "LOGIN With Google" LEFT (225px, Montserrat 700 22px, `--color-cta-text`), Google icon RIGHT (24×24px); `--color-cta-primary` bg; `border-radius: 8px`; disabled state with reduced opacity + `cursor-not-allowed`; `aria-label="Sign in with Google"`; run T026 tests → all green | app/login/_components/login-button.tsx
- [x] T030 [P] Implement `error-alert.tsx` — inline alert above B.3; `role="alert"`; dismiss button calls `router.replace('/login')`; run T027 tests → all green | app/login/_components/error-alert.tsx
- [x] T031 Implement `login-page-client.tsx` (`'use client'`) — manages `isPending` state (disabled during OAuth initiation); calls `signInWithGoogle()` on button click; re-enables + shows error alert if `signInWithOAuth` returns error; accepts `hasError` prop for callback errors; run T028 tests → all green | app/login/_components/login-page-client.tsx

### Shared Layout Components

- [x] T032 [P] Implement `header.tsx` — 1440×80px, `--color-header-bg` bg, padding `12px 144px`, flex space-between; SAA logo (`<Image priority>`, 52×48px); language switcher slot (renders placeholder until US2) | app/components/header.tsx
- [x] T033 [P] Implement `footer.tsx` — padding `40px 90px`, `border-top: 1px solid var(--color-divider)`; copyright `<p>` using `useTranslations('footer')`; `var(--font-montserrat-alt)` font-family | app/components/footer.tsx

### Login Page Assembly

- [x] T034 Implement `app/login/page.tsx` (Server Component) — reads `lang` cookie via `cookies()`, reads `searchParams.error`; renders: background `<Image loading="lazy">` full-screen, two gradient overlay `<div>`s (horizontal: `linear-gradient(90deg, #00101A 0%, #00101A 25.41%, transparent)`, vertical: `linear-gradient(0deg, #00101A 22.48%, transparent 51.74%)`), `<Header>`, ROOT FURTHER `<Image priority>`, `<LoginPageClient hasError={!!searchParams.error}>`, `<Footer>`; all within `bg-[#00101A]` container | app/login/page.tsx

### E2E Tests (US1)

- [x] T035 [P] Write Playwright E2E tests for US1: scenario 3 (error alert: navigate `/login?error=auth_failed`, assert B.err visible), scenario 4 (cancel: navigate `/login`, assert no alert, button enabled), scenario 6 (no-params callback: navigate `/auth/callback`, assert redirect to `/login`), scenario 7 (auth guard: inject session cookie, navigate `/login`, assert redirect to `NEXT_PUBLIC_POST_LOGIN_URL`). Note: scenario 1 (full OAuth flow) requires real Google credentials — mark as skipped in CI until credentials configured | tests/e2e/login.spec.ts

**Checkpoint**: US1 complete — Google login works end-to-end, all backend tests green, component tests green, middleware guard active.

---

## Phase 4: User Story 2 — Language Switch (Priority: P2)

**Goal**: Visitor clicks language selector → dropdown shows supported languages → selects one → page re-renders in chosen language without full reload → reload preserves selection via `lang` cookie.

**Independent Test**: Open `/login` → click language selector → switch to EN → assert button text changes → reload page → assert EN still active (cookie preserved).

### Language Switcher (TDD — tests fail first)

- [x] T036 [US2] Write **failing** component tests for `language-switcher`: renders current locale label and flag; clicking opens dropdown listing available locales; selecting a locale writes `lang` cookie + calls `router.refresh()`; has `aria-label="Select language"` + `aria-expanded` toggled correctly | app/components/language-switcher.test.tsx
- [x] T037 [US2] Implement `language-switcher.tsx` (`'use client'`) — shows VN flag + "VN" label + chevron; dropdown on click; on select: writes `lang` cookie (`SameSite=Lax`, `Max-Age=31536000`, **not** `HttpOnly`); calls `router.refresh()`; `border-radius: 4px` on trigger; `aria-label="Select language"` + `aria-expanded`; integrate into `header.tsx` replacing the placeholder slot | app/components/language-switcher.tsx
- [x] T038 [US2] Write Playwright E2E test for US2: click selector → assert text updates → reload → assert `lang` cookie persists → page renders in selected language from first byte | tests/e2e/login.spec.ts

**Checkpoint**: US1 + US2 complete — language switch works with server-side cookie persistence.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, performance, security hardening.

- [x] T039 [P] Verify `<Image priority />` on ROOT FURTHER logo (B.1) and `loading="lazy"` on background (C); confirm LCP candidate is the logo, not the lazy background | app/login/page.tsx
- [x] T040 [P] Keyboard navigation audit: Tab through header (logo → language switcher), login button, dismiss button; assert logical focus order and visible focus ring on all interactive elements
- [x] T041 [P] Color contrast check: `#FFEA9E` text on `#00101A` background (CTA button) — verify ≥ 4.5:1 ratio (WCAG AA). Use browser DevTools or automated axe check
- [x] T042 Run `npm audit` — fix all high/critical severity vulnerabilities before merge | package.json / package-lock.json
- [x] T043 Run `npm run lint` — fix all ESLint errors to zero; no warnings promoted to errors
- [x] T044 [P] Mobile responsive verification at 375px viewport: login card reflows full-width, button remains tappable, header collapses gracefully, no horizontal scroll

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    └─→ Phase 2 (Foundation) [BLOCKS all user stories]
            └─→ Phase 3 (US1 — Google Login) [MVP]
                    └─→ Phase 4 (US2 — Language Switch)
                                └─→ Phase 5 (Polish)
```

### Within Phase 3 (US1) — Parallel Tracks

```
Track A (Backend, can start immediately after Phase 2):
  T018 [fail tests] → T020 [implement auth-service]
  T019 [fail tests] → T021 [implement profile-service]
  T022 [fail tests] → T023 [implement callback route]   ← needs T020+T021 done
  T024 [fail tests] → T025 [implement middleware]

Track B (UI, can start immediately after Phase 2):
  T026 [fail tests] → T029 [implement login-button]
  T027 [fail tests] → T030 [implement error-alert]
  T028 [fail tests] → T031 [implement login-page-client]  ← needs T029+T030 done
  T032 [header] and T033 [footer] run in parallel

Page assembly (T034): needs T031 + T032 + T033 done
E2E (T035): needs T034 done
```

### Parallel Opportunities per Phase

| Phase | Parallel Tasks |
|-------|----------------|
| 1 | T002–T006 all parallel after T001 |
| 2 | T008+T009+T010+T011+T012+T013 in parallel; T014+T015 can overlap |
| 3 | T018+T019+T026+T027+T028 all in parallel; T032+T033 parallel |
| 4 | T036→T037→T038 sequential (lang switcher has a clear dependency chain) |
| 5 | T039+T040+T041+T044 all parallel |

---

## Implementation Strategy

### MVP (Recommended First Delivery)

1. Complete Phase 1 + Phase 2
2. Complete Phase 3 (US1 only — Google Login)
3. **STOP and VALIDATE**: All backend tests green, component tests green, manual E2E smoke test
4. Ship: users can log in, profiles upsert, auth guard works

### Incremental After MVP

5. Add Phase 4 (US2 — Language Switch) → test cookie persistence → merge
6. Run Phase 5 (Polish) → accessibility + security audit → merge

---

## Task Count Summary

| Phase | Tasks | Parallel |
|-------|-------|----------|
| Phase 1: Setup | 6 | T002–T006 |
| Phase 2: Foundation | 11 | T008, T009, T010, T011, T012, T013 |
| Phase 3: US1 | 18 | T018, T019, T026, T027, T028, T032, T033, T035 |
| Phase 4: US2 | 3 | — |
| Phase 5: Polish | 6 | T039, T040, T041, T044 |
| **Total** | **44** | **17 parallelizable** |

---

## Notes

- **TDD is non-negotiable** (constitution Principle III): every `*.test.ts(x)` task MUST produce failing tests before the corresponding implementation task begins. Do not skip the red phase.
- **Service role key** (`SUPABASE_SERVICE_ROLE_KEY`) is server-only — never expose via `NEXT_PUBLIC_` prefix (constitution Principle VI).
- **Session tokens** in HTTP-only cookies only — never `localStorage` or `sessionStorage`.
- **`--color-bg-base`** = `#00101A` (verified from Figma, not `#0B0F12`).
- **Login button icon layout**: text LEFT, icon RIGHT — non-standard, matches Figma node `662:14426`.
- **Footer font**: `Montserrat Alternates` (different from body `Montserrat`) — load separately via `next/font/google`.
- Commit after each task or logical group. Run `npm run lint` before every commit.
- Mark tasks complete as you go: `[x]`
