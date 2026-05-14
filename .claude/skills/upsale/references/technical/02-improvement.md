# Technical Improvement — Directory Contract

**Track:** technical · **Sub-step:** 2 of 3 (fan-out)
**Output directory:** `plans/upsale/technical/02-improvement/`
**Per-item templates:** `templates/technical/02-improvement/*.md`

The orchestrator fans out **one subagent per aspect**; subagents work in parallel, batched at
**max 10 concurrent** across the active fan-out phase (combined with business 3.3.* — see
`references/orchestrator-protocol.md` → `## Phase B-improvement`).

This file is the **complete contract** — shared rules, ownership map, and per-aspect specs
(Goal + use-context overrides) all live here. There are NO per-aspect reference files.

## Items (14 total — one per aspect)

| # | Slug | Output file | Template |
|---|------|-------------|----------|
| 01 | architecture              | `plans/upsale/technical/02-improvement/01-architecture.md`              | `templates/technical/02-improvement/01-architecture.md`              |
| 02 | code-quality              | `plans/upsale/technical/02-improvement/02-code-quality.md`              | `templates/technical/02-improvement/02-code-quality.md`              |
| 03 | test-coverage             | `plans/upsale/technical/02-improvement/03-test-coverage.md`             | `templates/technical/02-improvement/03-test-coverage.md`             |
| 04 | ci-cd                     | `plans/upsale/technical/02-improvement/04-ci-cd.md`                     | `templates/technical/02-improvement/04-ci-cd.md`                     |
| 05 | performance               | `plans/upsale/technical/02-improvement/05-performance.md`               | `templates/technical/02-improvement/05-performance.md`               |
| 06 | security-and-dependencies | `plans/upsale/technical/02-improvement/06-security-and-dependencies.md` | `templates/technical/02-improvement/06-security-and-dependencies.md` |
| 07 | observability             | `plans/upsale/technical/02-improvement/07-observability.md`             | `templates/technical/02-improvement/07-observability.md`             |
| 08 | docs-and-dx               | `plans/upsale/technical/02-improvement/08-docs-and-dx.md`               | `templates/technical/02-improvement/08-docs-and-dx.md`               |
| 09 | error-handling            | `plans/upsale/technical/02-improvement/09-error-handling.md`            | `templates/technical/02-improvement/09-error-handling.md`            |
| 10 | scalability               | `plans/upsale/technical/02-improvement/10-scalability.md`               | `templates/technical/02-improvement/10-scalability.md`               |
| 11 | accessibility             | `plans/upsale/technical/02-improvement/11-accessibility.md`             | `templates/technical/02-improvement/11-accessibility.md`             |
| 12 | new-features              | `plans/upsale/technical/02-improvement/12-new-features.md`              | `templates/technical/02-improvement/12-new-features.md`              |
| 13 | ecosystem-parity          | `plans/upsale/technical/02-improvement/13-ecosystem-parity.md`          | `templates/technical/02-improvement/13-ecosystem-parity.md`          |
| 14 | platform-parity           | `plans/upsale/technical/02-improvement/14-platform-parity.md`           | `templates/technical/02-improvement/14-platform-parity.md`           |

## Shared rules (apply to every aspect)

### Inputs every aspect subagent receives
- `plans/upsale/technical/01-discovery/` (DIRECTORY — MUST be non-empty). Read every `*.md` once at the start; treat the union as the discovery snapshot. Do NOT re-scan the repository.
- This file (shared rules + the aspect's section below, identified by slug).

### Idempotency
Each per-aspect subagent skips when its declared output is non-empty (logs `skip: step-4.2.<NN> (artifact exists)`).
Input directory missing or empty → `BLOCKED: step-4.1 directory missing or empty`.

### Use-context marker
Copy verbatim from line 2 of any `plans/upsale/technical/01-discovery/*.md` file. Echo as line 2 of the aspect's output. Do NOT re-read `use-context.json`. Do NOT re-classify.

### Single-aspect scope
Each subagent fills exactly one aspect heading and its entries. No prioritization, no cross-aspect ranking, no final recommendation — Step 4.3 (proposal) handles selection.

### Use-context-conditional rules (universal)
In every aspect: drop sub-bullets whose remedy is a monetization, customer-funnel, or public-distribution change when `internal`; drop consumer-funnel sub-bullets when `hybrid`. Additional per-aspect overrides are documented in each aspect's section below.

### Customer-value signal vocabulary (gated by use-context)
- `customer-facing` → `reliability | speed | cost | compliance | retention | revenue | unblocked roadmap | differentiation`
- `hybrid` → `enterprise deal-size unlock | partner-adoption expansion | self-host packaging | differentiation | compliance | operational efficiency | platform capability | reliability`
- `internal` → `operational efficiency | risk reduction | compliance | employee productivity | platform capability | time-to-market for dependent teams | reliability`

Reject `revenue impact | retention | conversion | churn reduction` for `internal`. Reject `mass-market retention | consumer conversion | consumer churn` for `hybrid`.

### Evidence rules
- Every `Evidence:` MUST quote a concrete item from the discovery snapshot (paraphrasing OK — path/metric/ID must survive).
- NEVER introduce claims not supported by discovery. If a claim requires fresh evidence, write `Status: needs-more-discovery` — do NOT fabricate.
- NEVER quote secret values; cite classes (`API_KEY at .env:12`) only.

### Entry format

Every aspect output uses this shape (repeat per opportunity):

```markdown
- Status: <opportunity | clean — no current gap | needs-more-discovery>
- Category: <aspect-id — MUST match the filename's aspect slug>
- Observation: <1-2 sentences tied directly to the discovery snapshot>
- Evidence: <quote specific bullet(s) from discovery; include path:line, metric, or node ID>
- Potential improvement: <what could be done; 1-3 sentences, technology-consistent with stack>
- Customer-value signal: <categorical tag — vocabulary gated by use-context above>
- Value: <high | medium | low>
- Effort hint: <low | medium | high> — based on stack fit and scope, not guessing
- Risk if untouched: <what breaks, slows, or costs the customer if we do nothing>
```

### Value scoring rubric
- **high** — averts a concrete customer-visible incident (outage, security breach, compliance audit failure, revenue leak), unblocks a roadmap item the customer has publicly committed to, or removes a named production risk (EOL runtime past vendor support, known-bad CVE in a prod path). Customer would prioritize this ahead of feature work.
- **medium** — measurably improves a reliability/speed/cost metric, reduces engineering drag on the team, or closes a dependency-hygiene gap that will bite within 1–2 quarters. Customer would schedule this into the next planning cycle.
- **low** — engineering-taste refactor, polish, or long-horizon modernization with no pressing deadline and no customer-visible signal. Customer would park it in the backlog.

If evidence is weak/thin for the magnitude claim, score one step lower. Never score `high` without a concrete risk or unblocked outcome cited from the discovery snapshot.

### Output format
Each aspect writes to its declared output path. H1: `# Improvement Aspect: <Title> — <project name>`. Line 2: verbatim use-context marker. Followed by entries per the Entry format above. Total length under 200 lines.

## Ownership map

Consult before emitting any item — defer to the owner if the topic is not in your row.
Emit an item ONLY when: (a) it falls within YOUR Goal AND (b) the ownership map assigns its primary topic to your aspect. If both conditions fail, drop it — the rightful owner aspect will pick it up.

| Topic | Owner aspect | Tie-breaker |
|-------|-------------|-------------|
| Module boundaries, coupling, layering, god files | 01-architecture | |
| Readability, types, lint, code duplication, TODOs | 02-code-quality | Dependency cleanup → 06-security; tests → 03-test-coverage |
| Tests of any kind, coverage, test infrastructure | 03-test-coverage | A11y tests still here, not 11-accessibility |
| Pipeline stages, build, deploy gates, release automation | 04-ci-cd | SAST/secret-scan **stage** = 04; SAST **findings** = 06 |
| Caching, N+1 queries, hot-path, latency, bundle | 05-performance | "Cache layer" always 05 (even when framed as scale) |
| Secrets, CVEs, auth/authz, dep hygiene, supply-chain | 06-security-and-dependencies | Unused-dep cleanup = 06; SAST findings = 06; SAST stage = 04 |
| Logs, metrics, traces, alerts, dashboards, SLO | 07-observability | "Log/emit metric/trace" mechanics always 07 (even from error handlers) |
| README, API docs, runbooks, architecture diagrams, DX | 08-docs-and-dx | Documenting a new capability = 08; building it = 12 |
| Error classification, retry, circuit breaker, degradation | 09-error-handling | Logging of errors = 07; circuit-breaker logic = 09; alert when it trips = 07 |
| Statelessness, sharding, queue decoupling, conn pool, multi-region | 10-scalability | Caching always defers to 05 |
| WCAG, keyboard nav, screen-reader, ARIA, contrast | 11-accessibility | Writing tests for a11y features = 03 |
| Net-new technical capabilities (SSO, SDK, webhooks, audit log, public API) | 12-new-features | Documenting the capability = 08 |
| Vendor-category parity (CI, IDE, observability vendor peers) | 13-ecosystem-parity | |
| Client/deployment-platform parity (iOS, Android, web, desktop, SDK) | 14-platform-parity | |

---

## Aspect 01 — architecture

### Goal
Enumerate architectural improvement opportunities: module boundaries, coupling, god files, dead code, duplicated responsibilities. Identify structural patterns that will require engineering effort to evolve or scale the system.

---

## Aspect 02 — code-quality

### Goal
Enumerate code-quality improvement opportunities: readability, typing gaps, TODO/FIXME density, lint violations, code duplication, inconsistent patterns, and maintainability debt.

---

## Aspect 03 — test-coverage

### Goal
Enumerate test-coverage improvement opportunities: unit/integration/e2e presence, coverage gaps, critical untested paths, flaky tests, missing test types for the discovered stack.

### Intake gate
Owns ALL testing concerns exclusively. Unit tests, integration tests, e2e tests, coverage-target gaps, missing test scaffolding, flaky-test rehab, test strategy, and test infrastructure concerns ALL belong to this aspect. This is the single authority on testing scope. Aspects 02-code-quality and 04-ci-cd MUST NOT emit entries whose primary remedy is writing or fixing tests, raising coverage targets, or adding test types.

---

## Aspect 04 — ci-cd

### Goal
Enumerate CI/CD improvement opportunities: pipeline health, build time, manual steps, missing stages (lint/test/security scan), deployment reliability, environment promotion gaps, rollback capability.

---

## Aspect 05 — performance

### Goal
Enumerate performance improvement opportunities: hot paths without caching, N+1 queries, bundle size, startup time, memory usage, missing indexes, slow background jobs, unoptimized assets.

### Intake gate
Owns ALL caching, hot-path optimisation, and query performance concerns exclusively. Architecture (01) and scalability (10) MUST NOT emit entries whose primary remedy is adding a cache layer, fixing an N+1 query, or optimising a hot code path. Defers from: 01-architecture, 10-scalability — see ownership map.

---

## Aspect 06 — security-and-dependencies

### Goal
Enumerate security, dependency-hygiene, and tech-debt / modernization improvement opportunities: exposed secrets, outdated dependencies with known CVEs, auth/authz gaps, input validation holes, injection risks, missing security headers, supply-chain vulnerabilities; outdated packages, unused dependencies, license conflicts, supply-chain risk, missing lockfiles, pinning strategy, known-vulnerable transitive deps; legacy framework versions, deprecated APIs in use, outdated patterns, migration paths to current ecosystem standards, EOL runtime upgrades, removed-in-next-major deprecations.

Every entry MUST emit `Category: security-and-dependencies` per the shared Entry format. The three sub-topics above (security / dependency-hygiene / tech-debt-modernization) are scope hints for the aspect, not Category values — encode the specific concern in `Observation:` instead.

---

## Aspect 07 — observability

### Goal
Enumerate observability improvement opportunities: structured logging, metrics instrumentation, distributed tracing, error reporting, alerting rules, dashboards, on-call tooling, SLO/SLA definition.

### Intake gate
Owns ALL logging, metrics, and tracing infrastructure exclusively. Aspect 09-error-handling MUST NOT emit entries whose primary remedy is adding structured logs, wiring metrics, or plumbing traces. Business aspect 10-analytics-instrumentation MUST NOT emit entries whose primary remedy is operational telemetry (that belongs here). Logging of errors = 07; circuit-breaker logic = 09; alert when it trips = 07.

---

## Aspect 08 — docs-and-dx

### Goal
Enumerate documentation and developer-experience improvement opportunities: README accuracy, onboarding docs completeness, API docs, architecture diagrams, runbooks, changelog maintenance, inline code comments on complex logic; local setup friction, missing hot-reload, task automation gaps, slow feedback loops, onboarding time, missing dev tooling, inconsistent environment setup, lack of code generation or scaffolding.

Every entry MUST emit `Category: docs-and-dx` per the shared Entry format. The two sub-topics above (docs / dx) are scope hints for the aspect, not Category values — encode the specific concern in `Observation:` instead.

---

## Aspect 09 — error-handling

### Goal
Enumerate error-handling improvement opportunities: consistent error types, user-facing error messages, retry logic, graceful degradation, circuit breakers, unhandled promise rejections, swallowed exceptions, missing boundary error handling.

---

## Aspect 10 — scalability

### Goal
Enumerate scalability improvement opportunities: statelessness gaps, queue usage, cache layers, DB connection pooling, horizontal scaling blockers, shared mutable state, session affinity requirements, rate limiting, multi-region readiness.

---

## Aspect 11 — accessibility

### Goal
Enumerate accessibility improvement opportunities: WCAG compliance gaps, keyboard navigation, screen-reader labels, color contrast, focus management, ARIA roles, form labeling.

### Use-context overrides
**UI-presence gate (MANDATORY — check first):** Read `plans/upsale/technical/01-discovery/07-product-surface.md`. If it reports `UI presence: no`, emit a single entry:

```markdown
- Status: clean — no UI detected per discovery §7
- Category: accessibility
```

Then stop — do not enumerate any further entries for this aspect.

If `UI presence: yes` (or not explicitly stated as `no`), proceed with the full aspect.

Status values for this aspect include: `opportunity | clean — no current gap | clean — no UI detected per discovery §7 | needs-more-discovery`.

---

## Aspect 12 — new-features

### Goal
Enumerate net-new technical capabilities the stack can support but has not yet implemented (e.g., webhooks, SSO/SAML, audit log, export/import, public API, SDKs, background jobs, admin CLI, feature-flagging, rate-limiting, multi-region, offline mode, webhook retries, search, analytics dashboard). Each proposal MUST be justified by a concrete stack signal from the discovery snapshot (framework capability, existing module boundary, dependency already present) or by a visible gap. Do NOT restate existing features. Propose 3–8 distinct features when discovery supports them; otherwise emit `Status: clean — no current gap`.

### Use-context overrides
**When `internal`:**
- EXCLUDE: public API, public SDK, marketplace listing, public OAuth app, customer-facing billing webhooks, churn-reduction funnel, public developer portal, consumer self-serve upgrade flows

**When `hybrid`:**
- EXCLUDE: mass-market consumer-tier features (consumer churn-reduction funnel, self-serve credit-card upgrades for individual plans, B2C retention loops)

**When `customer-facing`:** full aspect applies with no restrictions.

Output: 3–8 entries (or single `clean — no current gap` entry) per the Entry format above.

---

## Aspect 13 — ecosystem-parity

### Goal
For each `single-vendor` entry in the discovery's vendor-category map, enumerate the dominant peer vendors in the same category that the product does NOT yet support. Each missing peer is a distinct opportunity. Use widely recognized market share, not exhaustive lists (target 1–3 peers per category). Do NOT propose peers outside the vendor's category. If the discovery map contains zero `single-vendor` entries, emit `Status: clean — no current gap` and stop.

### Use-context overrides
**When `internal`:**
- SKIP SaaS-only peers requiring external exposure. Do NOT push peer vendors whose adoption would require exposing the product externally.

**When `hybrid`:**
- EXCLUDE SaaS-only peers that do not also offer a self-hosted or on-premises option.

**When `customer-facing`:** full latitude — any dominant peer in the same category is in scope.

`Effort hint` MUST reflect whether the existing integration code is abstracted (adapter pattern → low/medium) or hardcoded per-vendor (→ high). Cite the evidence that informed the effort estimate.

---

## Aspect 14 — platform-parity

### Goal
Identify client or deployment platforms that peers in this product category commonly offer but the discovery snapshot's §8 (`08-platform-support.md`) shows as `(none detected)` or absent. Each missing platform is a distinct entry (e.g., "no mobile app", "no self-hosted deployment option", "no CLI", "no public API/SDK"). Do NOT propose platforms already detected in §8. If §8 shows no gaps vs category norms, emit `Status: clean — no current gap`.

`Evidence:` MUST quote the §8 detection result from the discovery artifact. Do NOT propose platforms already detected in §8.

### Use-context overrides
**When `internal`:**
- Do NOT propose mobile, consumer desktop, or public-SDK platforms.

**When `hybrid`:**
- Consumer-only platforms (mobile app for end users, browser extension) are out of scope.

**When `customer-facing`:** full platform matrix applies — web, mobile, desktop, CLI, API/SDK, browser extension.
