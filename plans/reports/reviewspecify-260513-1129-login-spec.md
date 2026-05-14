# Spec Review: Login (GzbNeVGJHz)

**Date**: 2026-05-13
**Reviewer**: momorph.reviewspecify
**Spec**: `.momorph/contexts/specs/GzbNeVGJHz-Login/spec.md`
**Scope**: Behavior · Data · API completeness (visual/CSS/asset concerns excluded)

---

## Verdict: REVISED ✅

Spec has been updated with all critical and major fixes. Open questions are listed at the end
and require stakeholder input before final approval.

---

## Issues Found & Resolution

### CRITICAL — Blocked implementation

| # | Location | Issue | Resolution |
|---|----------|-------|------------|
| C1 | US1.2, Navigation Flow | Post-login redirect route marked "TBD" — `signInWithOAuth` needs a concrete `redirectTo` and the callback handler needs a concrete destination. | Added `/` as placeholder; added `NEXT_PUBLIC_SITE_URL` env var requirement. Must be finalised in SCREENFLOW.md. |
| C2 | API Dependencies | `/auth/callback` spec covers only `?code=` success path. Google/Supabase also sends `?error=access_denied&error_description=...` on failure — these were unhandled. | Added error-param handling to TR-002 and API table. |
| C3 | Technical Requirements (TR-003) | TR-003 says "no `NEXT_PUBLIC_` prefix for secret keys" but the Dependencies section listed `NEXT_PUBLIC_SUPABASE_URL` — creating a contradiction. The Supabase browser client requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (they are intentionally public). Only `SUPABASE_SERVICE_ROLE_KEY` must stay server-only. | TR-003 rewritten to distinguish public vs. secret env vars. |
| C4 | Key Entities | `profiles` table creation mechanism was "trigger or callback" — ambiguous; leaves data consistency risk. | Committed to upsert in `/auth/callback` route handler. Trigger approach rejected (harder to debug, no error surfacing to client). |

### MAJOR — Implementation decision required

| # | Location | Issue | Resolution |
|---|----------|-------|------------|
| M1 | US1.3, FR-003 | Button "re-enable" mechanism after user cancels OAuth not specified. The app has no direct signal that the popup was closed. | Resolved via `visibilitychange` / `focus` event on window return + timeout: re-enable button when document regains focus after OAuth redirect. Added to FR-006. |
| M2 | Visual & Responsive | Error message location was unspecified — mentioned in acceptance scenarios but no placement. | Specified as inline alert rendered above B.3 (inside the B content panel), below B.2 tagline. Added as FR-007. |
| M3 | US2.3, FR-005 | Language preference persistence was "cookie or localStorage" — ambiguous. `localStorage` incompatible with SSR (constitution TR-001 spirit). | Committed to HTTP cookie (`lang`, `SameSite=Lax`, `Max-Age=1 year`, no `HttpOnly` so JS can read for i18n hydration). |
| M4 | API Dependencies | `redirectTo` URL in `signInWithOAuth` was unspecified; callback route destination post-auth was unspecified. | Specified `redirectTo: process.env.NEXT_PUBLIC_SITE_URL + '/auth/callback'`; post-auth destination: `NEXT_PUBLIC_POST_LOGIN_URL` (defaults to `/`). |

### MINOR — Clarifications added

| # | Location | Issue | Resolution |
|---|----------|-------|------------|
| m1 | A.1 Logo interaction | "Click → navigate to `/`" was inferred from convention, not confirmed by design. | Marked explicitly as assumption; flagged in Open Questions. |
| m2 | US2, FR-005 | Supported languages listed as "at least VN and EN" but Figma only shows VN; no EN confirmed. | Kept as ≥ VN + EN, flagged in Open Questions. |
| m3 | Key Entities | `profiles` fields listed but `role` / `department` / event-specific fields not specified. | Added `role` (default: `user`) as minimum needed for authorization guards. Full schema flagged in Open Questions. |

---

## Open Questions (require stakeholder input)

1. **Post-login redirect route**: What is the exact route after successful login? `/` (home), `/dashboard`, or `/home`? Define in SCREENFLOW.md.
2. **Google domain restriction**: Should login be restricted to `sun-asterisk.com` Google accounts only? If yes, add `hd` param to `signInWithOAuth` and handle `access_denied` with specific message.
3. **All supported languages**: Is it VN + EN only, or are additional locales planned? Affects i18n library choice and translation file structure.
4. **`profiles` table full schema**: Beyond `id`, `email`, `full_name`, `avatar_url`, `created_at`, `role` — are there SAA-specific fields (e.g., `department`, `employee_id`, `award_category`)?
5. **A.1 logo destination**: Does clicking the Sun Annual Awards logo go to `/` (same as login) or an external marketing page?
6. **Session duration**: What is the Supabase JWT expiry configured for this project? Affects UX for long sessions.
