# Plan Review v3: Login (GzbNeVGJHz)

**Date**: 2026-05-14
**Reviewer**: momorph.reviewplan (third pass — first with Figma design-style data)
**Spec**: `.momorph/contexts/specs/GzbNeVGJHz-Login/spec.md`
**Plan**: `.momorph/contexts/specs/GzbNeVGJHz-Login/plan.md`
**Design Style**: `.momorph/contexts/specs/GzbNeVGJHz-Login/design-style.md` ← **created this pass**
**Prior status**: Reviewed (v2) → **Reviewed (v3)**

---

## Verdict: REVISED ✅

5 issues found by cross-referencing plan against Figma data (`list_frame_styles` + `list_design_items`).
`design-style.md` created as new artifact. All issues fixed in plan.

---

## Root Cause of Issues

Previous two reviews had no `design-style.md` to cross-reference. Visual tokens and layout details
were inferred from spec notes rather than verified against actual Figma values. This pass fetched raw
design data and discovered 5 divergences.

---

## Issues Found & Fixed

### Critical

| # | Issue | Fix |
|---|-------|-----|
| C1 | **`--color-bg-base` wrong**: plan/spec said `#0B0F12` but Figma frame bg is `rgba(0,16,26,1)` = `#00101A`. `#0B0F12` is the header base color (used at 80% opacity) — different element. | Modified Files table + Phase 1 step 12: corrected to `#00101A`. |
| C2 | **Montserrat font not loaded**: all text (button 22px, tagline 20px, language label 16px) uses Montserrat 700. Footer uses Montserrat Alternates 700 — a different family. Neither was mentioned in the plan. Without `next/font/google` loading, fonts fall back to system sans-serif. | Added step 11 (Phase 1) and `app/layout.tsx` Modified Files row: load both via `next/font/google`, expose as `--font-montserrat` / `--font-montserrat-alt` CSS variables. |

### Major

| # | Issue | Fix |
|---|-------|-----|
| M1 | **Two decorative gradient overlays missing from Phase 6**: Figma has Rectangle 57 (horizontal L→R fade: `#00101A→transparent`) and Cover (vertical bottom fade: `#00101A→transparent`). Without these, the left side of the screen is not solid dark and the bottom has no fade — visual regression. | Phase 6c: added requirement for two `<div>` overlay elements (absolute, inset-0, pointer-events-none) with gradient CSS. |
| M2 | **Login button icon position undocumented**: Figma layout is text LEFT + Google icon RIGHT (non-standard). A developer defaulting to the common pattern (icon left, text right) produces a wrong layout. | Phase 6b login-button.tsx note: "text LEFT, icon RIGHT — do NOT put icon on the left." |

### Minor

| # | Issue | Fix |
|---|-------|-----|
| m1 | **Missing `--color-cta-text` token**: button text color `#00101A` had no CSS variable. Hardcoding it in the component violates Principle II. | Added `--color-cta-text: #00101A` as 5th token to globals.css. Modified Files table updated from 4 → 5 tokens. |

---

## New Artifact Created

**`.momorph/contexts/specs/GzbNeVGJHz-Login/design-style.md`** — extracted from Figma via
`list_frame_styles` + `list_design_items`. Contains:
- Color tokens (6), Typography specs (4 variants), Spacing table, Border/radius
- ASCII layout diagram with all nodes labeled
- Per-component style tables (A, A.1, A.2, C, B.1, B.2, B.3, D)
- Overlay gradient specs (Rectangle 57 + Cover)
- Implementation mapping table (Figma node → component/asset path)

---

## Review Checklist (Final State)

### Spec Coverage
- [x] US1 (Google Login) — all 7 scenarios covered across Phases 3–5
- [x] US2 (Language Switch) — covered in Phase 6 (language-switcher) + Phase 1 (i18n)
- [x] All API calls from spec addressed (signInWithOAuth, exchangeCodeForSession, upsert)
- [x] All 9 Figma components accounted for in New Files table
- [x] Edge cases (no-params callback, access_denied, client-side error) in Phase 4

### Technical Feasibility
- [x] Architecture decisions justified (next-intl cookie-based, no URL prefix)
- [x] State handled: loading (button disabled), error (B.err), success (redirect), empty (clean load)
- [x] File structure follows constitution feature-based conventions
- [x] No circular dependencies
- [x] Font loading strategy added (next/font/google — avoids FOUC, tree-shakeable)

### Actionability
- [x] Each phase has concrete deliverables
- [x] New Files table complete (29 files)
- [x] Modified Files table specifies exact changes per file
- [x] Testing strategy covers unit/integration/component/E2E with coverage targets
- [x] Risk assessment has realistic mitigations

### Constitution Compliance
- [x] Tailwind + CSS variables — no hardcoded hex in components (5 tokens now cover all colors)
- [x] TDD gating (Principle III) — failing tests before implementation in Phases 3–6
- [x] HTTP-only cookies for session (Principles IV, VI)
- [x] RLS migration included (Principle IV)
- [x] Service role key server-only (Principle VI)
- [x] WCAG 2.1 AA aria attributes (Principle VII)
- [x] Mobile-first in Phase 6 (Principle VII)

---

## Open Questions (carry-forward, no change)

1. Post-login redirect route (`/`, `/home`, `/dashboard`)
2. Google domain restriction (`hd: 'sun-asterisk.com'`)?
3. Languages beyond VN + EN?
4. `profiles` SAA-specific columns?
5. A.1 logo click destination?
6. Supabase JWT session expiry?
