# Spec Review v2: Login (GzbNeVGJHz)

**Date**: 2026-05-13
**Reviewer**: momorph.reviewspecify (second pass)
**Spec**: `.momorph/contexts/specs/GzbNeVGJHz-Login/spec.md`
**Prior status**: Reviewed → **Reviewed (v2)**
**Scope**: Behavior · Data · API completeness (visual/CSS excluded)

---

## Verdict: REVISED ✅

6 new issues found beyond v1 review. All critical/major fixed in spec. Open questions unchanged.

---

## Issues Found & Fixed

### Critical

| # | Issue | Fix |
|---|-------|-----|
| C1 | **FR-007 incorrect**: `visibilitychange` re-enable applies to popup OAuth, not full-page redirect. With redirect flow, the page reloads fresh on return — no stuck loading state possible. Only case needing handling: synchronous error from `signInWithOAuth` before redirect. | Rewrote FR-007: button disabled on click, re-enabled only if `signInWithOAuth` returns error. Removed `visibilitychange` logic entirely. |
| C2 | **`profiles.upsert` conflict columns unspecified**: risk of overwriting `role` on every login (user's role could be reset to `'user'` after elevation). | FR-002 + API table now specify `onConflict: 'id'`, update set = `{email, full_name, avatar_url, updated_at}` only. `role` and `created_at` explicitly preserved. |
| C3 | **RLS policies missing**: constitution Principle IV requires RLS on every table. `profiles` had no policy spec. | Added RLS policy table to Key Entities: SELECT/UPDATE for own row; upsert via service role key (bypasses RLS server-side). |

### Major

| # | Issue | Fix |
|---|-------|-----|
| M1 | **`signInWithOAuth` client-side error unhandled**: if Supabase is unreachable before redirect, the call returns `{ error }` — no path to show user feedback. | Added US1 Scenario 3 (client-side error) + FR-004 updated + TR-004 shows `if (error)` guard. |
| M2 | **`/auth/callback` with no params**: direct navigation to `/auth/callback` without `code` or `error` was unhandled — would throw or hang. | Added US1 Scenario 6 + TR-002 "No params → redirect to `/login`". |
| M3 | **B.err dismiss mechanism unspecified**: dismissing the alert left `?error=auth_failed` in URL; back-navigation would re-show the error. | FR-008 + B.err interaction now specifies `router.replace('/login')`. |

### Minor

| # | Issue | Fix |
|---|-------|-----|
| m1 | `updated_at` mechanism was "Updated on each login" without specifying how (DB trigger vs. app-level). | Clarified in table: "Updated (app-level in upsert call)" — avoids implicit DB trigger dependency. |
| m2 | US2 Scenario 1 default language detection: spec said "default: Vietnamese" without fallback for new users with no `lang` cookie. | Added "or browser `Accept-Language` header as fallback" to scenario. |

---

## Unchanged Open Questions

1. Post-login redirect route — define in SCREENFLOW.md
2. Google domain restriction to `sun-asterisk.com`?
3. Supported languages (VN + EN minimum confirmed)
4. `profiles` SAA-specific fields
5. A.1 logo click destination
6. Supabase JWT session duration
