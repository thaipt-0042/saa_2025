<!--
SYNC IMPACT REPORT
==================
Version change: (none) → 1.0.0  [initial ratification, all principles incorporated]

Modified principles: N/A (initial creation)

Added sections:
  - Core Principles (7 principles)
  - Technology Stack (including Supabase)
  - Development Workflow
  - Governance

Removed sections: N/A

Templates reviewed:
  ✅ .momorph/templates/plan-template.md   — Constitution Compliance Check aligns with all 7 principles
  ✅ .momorph/templates/spec-template.md   — Dependencies section references constitution.md;
                                             Security Requirements (OWASP) added to Technical Requirements
  ✅ .momorph/templates/tasks-template.md  — TDD-first ordering and security-hardening polish task align

Runtime guidance files reviewed:
  ✅ .momorph/guidelines/frontend.md       — Design token and URL navigation rules align with Principles I, II, VII
  ✅ .momorph/guidelines/backend.md        — Layered architecture and clean code rules align with Principles IV, V

Follow-up TODOs:
  - TODO(RATIFICATION_DATE): Confirm exact project kick-off date if different from 2026-05-13
  - TODO(SUPABASE_GUIDELINES): Create .momorph/guidelines/supabase.md with Row-Level Security
    patterns, Realtime subscription conventions, and storage policies
-->

# SAA 2025 Constitution

## Core Principles

### I. Component-First Architecture

Every UI feature MUST be built as a self-contained React component using the Next.js App Router
(App Directory). Components MUST follow a feature-based folder structure (`app/<feature>/`) rather
than grouping by file type. Server Components MUST be the default; Client Components (`'use client'`)
are only permitted when interactivity or browser APIs are required. Each component MUST be
independently renderable and testable in isolation.

Navigation and routing MUST be derived exclusively from `SCREENFLOW.md` and group spec files. No
URL MUST be hardcoded or guessed — consult `.momorph/guidelines/frontend.md` §2 for the mandatory
workflow.

### II. Styling via Design Tokens

All visual styling MUST use Tailwind CSS utility classes backed by CSS custom properties (variables)
defined in the global CSS file (`app/globals.css`). Raw color hex values, pixel spacing, or
typography values MUST NOT appear in component files. When a required Tailwind utility is unavailable,
reference the CSS variable directly (`var(--color-*)`) as the only permitted fallback. Adding new
design tokens requires a corresponding entry in `globals.css` and documentation in the relevant group
spec file.

Asset filenames MUST use kebab-case (`hero-image.png`) and be placed under
`public/assets/{group}/{icons|images|logos}/`.

### III. Test-Driven Development (NON-NEGOTIABLE)

TDD is mandatory for all feature work. The cycle is strictly enforced:

1. Write a failing test and confirm it fails.
2. Get stakeholder/tech-lead approval on the test.
3. Implement the minimum code to make the test pass.
4. Refactor while keeping tests green.

No implementation task MAY begin before its corresponding test exists and is confirmed failing.
Integration tests MUST cover component-to-service interactions, API contract validation, and
Supabase RLS boundary conditions. Unit tests MUST cover pure business logic in service classes.

Test tooling: Playwright for E2E; Vitest (or Jest) for unit/integration tests.

### IV. Layered Backend Architecture

Next.js route handlers MUST be thin: they handle HTTP mapping, input/output parsing, and delegate
immediately to service classes. Business logic MUST reside exclusively in service-layer classes.
Services MUST be independently testable without framework-specific types. DTOs MUST describe data
shapes and mapping only — no business logic inside DTOs. Sensitive fields (passwords, tokens,
secrets) MUST be excluded from serialized API responses.

Dependency direction is: route handler → service → repository/Supabase client. Circular imports are
forbidden. Barrel files are restricted to types and constants only.

Supabase-specific rules:
- Database queries MUST go through a dedicated service or repository module — never inline in route
  handlers or components.
- Row-Level Security (RLS) MUST be enabled on every table; application-layer checks MUST NOT replace
  RLS policies.
- Supabase client instances MUST be scoped per-request on the server side (use `createServerClient`)
  to avoid session leakage between requests.

### V. Clean Code & Code Quality

Code MUST be readable, concise, and self-explanatory without inline comments unless the WHY is
non-obvious (a hidden constraint, a subtle invariant, or a specific bug workaround).

Mandatory standards:
- TypeScript strict mode MUST remain enabled; the `any` type is forbidden — use `unknown` with
  explicit narrowing.
- All external data (user input, API responses, Supabase results) MUST be validated at system
  boundaries using Zod or equivalent schema validation.
- File and function sizes MUST follow the single-responsibility principle: one file = one concept;
  functions MUST fit on a screen (~40 lines max).
- Naming MUST be explicit and intention-revealing: no abbreviations (`usr`, `tmp`, `cb`) unless
  they are universally understood domain terms.
- ESLint (`eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`) MUST pass with
  zero errors on every commit.
- Code formatting: 2-space indentation, single quotes, ~100 character line width.

### VI. Security (OWASP Secure Coding)

All code MUST comply with the OWASP Top 10 and OWASP Secure Coding Practices Quick Reference. The
following controls are non-negotiable:

- **Input validation**: All user-supplied data MUST be validated server-side before processing.
  Client-side validation is supplementary only.
- **SQL / NoSQL injection**: NEVER construct queries via string concatenation. MUST use Supabase
  parameterized query APIs or ORM query builders exclusively.
- **Authentication & session management**: Auth MUST be delegated to Supabase Auth. Session tokens
  MUST be stored in HTTP-only cookies managed by the Supabase server client — never in
  `localStorage` or `sessionStorage`.
- **XSS prevention**: MUST rely on React's built-in escaping. `dangerouslySetInnerHTML` is
  forbidden without explicit security review and sanitization via DOMPurify or equivalent.
- **Sensitive data exposure**: API responses MUST never return passwords, full card numbers, tokens,
  or internal identifiers unless explicitly required and authorized. Use DTOs with field exclusions.
- **Security misconfigurations**: Environment variables containing secrets MUST use the `SUPABASE_*`
  / server-only prefix convention and MUST NOT be prefixed with `NEXT_PUBLIC_`.
- **Dependencies**: `npm audit` MUST be run and pass (no high/critical vulnerabilities) before
  merging any PR that changes `package.json` or `package-lock.json`.

### VII. Platform UI Compliance (Responsive Web)

This project targets **web browsers** as the primary platform. All UI MUST be responsive and
accessible:

- **Responsive design**: Layouts MUST use Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`,
  `xl:`) with a mobile-first approach. No fixed-width pixel layouts.
- **Accessibility (WCAG 2.1 AA)**: Interactive elements MUST have accessible labels (`aria-label`,
  `aria-describedby`). Color contrast ratios MUST meet AA thresholds. Keyboard navigation MUST
  work without a mouse.
- **Web-native UI patterns**: Follow established web/browser interaction conventions — standard form
  behavior, focus management, scroll anchoring, and link semantics (`<a>` for navigation, `<button>`
  for actions).
- **Performance baseline**: Core Web Vitals targets — LCP < 2.5 s, CLS < 0.1, INP < 200 ms. Use
  Next.js Image optimization, font subsetting via `next/font`, and lazy loading for off-screen
  assets.

If the project expands to iOS or Android in the future, platform-specific constitution amendments
MUST be ratified (Human Interface Guidelines for iOS; Material Design for Android).

## Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.x |
| UI Library | React | 19.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| Backend-as-a-Service | Supabase (Auth, DB, Storage, Realtime) | latest |
| Linting | ESLint (next/core-web-vitals, next/typescript) | 9.x |
| E2E Testing | Playwright | latest |
| Unit/Integration | Vitest or Jest | latest |
| Package Manager | npm | (lockfile committed) |

New dependencies MUST be justified by documented rationale. Direct alternatives in the existing
stack MUST be explicitly ruled out before adding a new library.

## Development Workflow

1. **Spec before code**: A `spec.md` approved by stakeholders MUST exist before implementation
   begins.
2. **Constitution compliance check**: Every PR description MUST confirm compliance with each of
   the 7 core principles. Violations require explicit justification and a rejected alternative.
3. **Test-first gate**: Tests MUST be committed and confirmed failing before feature implementation
   is committed (Principle III).
4. **Security gate**: `npm audit` MUST pass. OWASP controls (Principle VI) MUST be verified by the
   reviewer on every PR.
5. **Design token check**: No PR introducing hardcoded color/spacing values MUST be merged
   (Principle II).
6. **URL evidence check**: Every navigation `href` MUST trace to `SCREENFLOW.md` or a group spec
   file (Principle I).
7. **RLS check**: Any PR adding or modifying a Supabase table MUST include the corresponding RLS
   policy migration (Principle IV).
8. **Commit discipline**: Commits MUST follow Conventional Commits format (`feat:`, `fix:`,
   `docs:`, `test:`, `security:`, etc.).

## Governance

This constitution supersedes all other project practices and guidelines. Any amendment MUST:

1. Be proposed as a documented change with a clear rationale.
2. Specify the semantic version bump (MAJOR / MINOR / PATCH) with justification.
3. Include a migration plan for backward-incompatible changes (MAJOR bump).
4. Update `LAST_AMENDED_DATE` and increment `CONSTITUTION_VERSION`.

Versioning policy:
- **MAJOR**: Removal or backward-incompatible redefinition of an existing principle.
- **MINOR**: Addition of a new principle or material expansion of guidance.
- **PATCH**: Clarifications, wording refinements, typo fixes.

All PRs and code reviews MUST verify compliance with the principles above. Refer to
`.momorph/guidelines/frontend.md` and `.momorph/guidelines/backend.md` for runtime development
guidance.

TODO(SUPABASE_GUIDELINES): Create `.momorph/guidelines/supabase.md` covering Row-Level Security
patterns, Realtime subscription conventions, storage bucket policies, and server-side client setup.

**Version**: 1.0.0 | **Ratified**: 2026-05-13 | **Last Amended**: 2026-05-13
