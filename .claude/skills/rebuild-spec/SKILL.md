---
name: tkm:rebuild-spec
description: "Reverse-engineer an existing codebase into structured documentation — 9 standard doc artifacts (architecture, data models, API specs, flows, etc.) plus per-feature specifications. Uses parallel agents: scanner, researcher, reviewer, doc-writer."
argument-hint: "[--features F001,F002] [--artifact NAME]"
metadata:
  author: takumi-agent-kit
  version: "2.9.1"
---

# tkm:rebuild-spec

Reverse-engineer existing codebase → structured spec artifacts by composing existing skills.
Zero third-party CLI dependencies. Output lands in `docs/specs/`.

**Principles:** YAGNI, KISS, DRY | Compose, don't reinvent | Template-first.

## Usage

```
/tkm:rebuild-spec                        # Full pipeline (9 artifacts + all feature specs). Runs reconcile preflight first; auto-resumes if TaskList has pending rebuild-spec tasks.
/tkm:rebuild-spec --features F001,F002   # Feature specs only (requires FeatureList exists)
/tkm:rebuild-spec --artifact route-list  # Regenerate single artifact (reuses upstream if present)
/tkm:rebuild-spec --resume               # Reconcile-only: sync TaskList against disk, close stale in_progress tasks whose outputs already exist. No new work dispatched.
```

**Force restart:** delete `plans/<active>/artifacts/` → next no-args invocation starts fresh.

## Preflight

1. Detect project root = CWD (must be under git control).
2. Verify source code present: non-empty working tree AND has at least one of `package.json`, `composer.json`, `pom.xml`, `go.mod`, `Cargo.toml`, `pyproject.toml`, `Gemfile`. Empty → ABORT with clear hint.
3. Resolve active plan path from `## Plan Context` hook; if none, fallback to `plans/<timestamp>-rebuild-spec/`.
4. Ensure output dirs exist: `docs/specs/`, `plans/<active>/artifacts/`.

## Pipeline

Load on demand (not inlined here):
- `references/pipeline.md` — wave graph + `TaskCreate` patterns
- `references/code-formats.md` — shared schema; pass to researcher
- `references/verification-checklist.md` — pass to reviewer

Composite screen detection is automatic. See `references/composite-screen-detection.md` for the H1-H6 rules, execution order, 2-of-3 gate, tab short-circuit, and wizard sub-classification.

BackgroundLogic stability enforced via scout BL inventory (Wave 0) + 1-BL-per-file cardinality contract (Wave 2b) + reviewer cardinality cross-check (Wave 7a). See `references/bl-source-patterns.md`.

**Default flow (no flags):**
1. Wave 0 — `/tkm:scan-codebase` discovery (parallel per target dir).
2. Waves 1–5 — `researcher` chain, one per doc artifact, `blockedBy` per dep graph. Inputs: scout report + template + `code-formats.md`.
3. Wave 6 — fan-out `researcher` × F### extracted from FeatureList (parallel, `blockedBy` W5). If F### count > 20, split into **batches of 10** (`Wave6.batch-01`, `Wave6.batch-02`, …) to bound peak context.
4. Wave 7a — `reviewer` pass on 9 core artifacts using scoped `verification-checklist.md` sections (runs **parallel** with Wave 6).
5. Wave 7b — `reviewer` pass on feature specs in **batches of 5**, using only FeatureSpec checklist section (runs after Wave 6).
6. Wave 7-merge — combine `core-review-report.md` + `feature-review-batch-*.md` into single `review-report.md`.
7. Wave 8 — `implementer` applies fixes + `re-reviewer` verifies each fix (max 3 cycles; escalates to user if still failing after cycle 3).
8. Wave 9 — `doc-writer` promotes `plans/<active>/artifacts/` → `docs/specs/`, writes completion sentinel `plans/<active>/artifacts/wave9-complete.flag` listing promoted files + SHA, then **self-closes via `TaskUpdate(status=completed)` before returning** (do not rely on orchestrator liveness).

**Flag overrides:**

| Flag | Effect |
|------|--------|
| _(none)_ | Full pipeline; reconcile preflight runs first; auto-resume if `TaskList` has pending rebuild-spec tasks |
| `--artifact NAME` | Skip to the wave owning NAME; reuse existing upstream artifacts if present. ABORT if upstream missing |
| `--features F###,...` | Skip waves 0–5; dispatch W6 fan-out for listed F### only. ABORT if `docs/specs/feature-list.md` missing |
| `--resume` | Run reconcile preflight only — no new waves dispatched. Use after a killed session to sync TaskList with disk |

**Artifact → wave lookup (for `--artifact NAME`):**

| NAME | Wave | Upstream required |
|------|------|-------------------|
| `system-overview` | W1 | scout-report.md |
| `route-list` | W1 | scout-report.md |
| `data-model` | W1 | scout-report.md |
| `screen-list` / `screen-flow` | W2 | route-list.md + data-model.md |
| `background-logic` | W2 | screen-list.md + screen-flow.md |
| `permissions` | W3 | screen-list.md + background-logic.md |
| `user-stories` | W4 | permissions.md |
| `feature-list` | W5 | user-stories.md |

## Subagent contracts

| Wave | Subagent | Input | Output |
|------|----------|-------|--------|
| 0 | `/tkm:scan-codebase` | target dirs | `plans/<active>/artifacts/scout-report.md` |
| 1–5 | `researcher` | scout report + template + `code-formats.md` | `plans/<active>/artifacts/<artifact>.md` |
| 6 | `researcher` | scoped artifact sections (Grep per F###) + `feature-spec-researcher-contract.md` + `feature-spec-template.md` | `plans/<active>/artifacts/features/F###_Name/spec.md` |
| 7a | `reviewer` | 9 core artifacts + scoped `verification-checklist.md` (core sections) | `core-review-report.md` |
| 7b | `reviewer` | feature spec batches (5/reviewer) + scoped `verification-checklist.md` (FeatureSpec section) | `feature-review-batch-NN.md` |
| 7-merge | orchestrator | `core-review-report.md` + `feature-review-batch-*.md` | `review-report.md` |
| 8 | `implementer` | review report + affected drafts | updated drafts |
| 9 | `doc-writer` | approved drafts | `docs/specs/*.md` + `plans/<active>/artifacts/wave9-complete.flag`. **MUST** call `TaskUpdate(status=completed)` on its own task before returning |

## Task management

Plan files = persistent. Tasks = session-scoped. Hydrate waves as Task chain.
Fallback: if Task tools unavailable (VSCode extension) → use `TodoWrite`.
See `references/pipeline.md` for `TaskCreate` examples.

## Resume & Reconcile

Orchestrator context can run out mid-pipeline — tasks may stay `in_progress` even after subagent output files are fully written. Three defenses:

1. **Self-closing subagents (Wave 9)** — `doc-writer` calls `TaskUpdate(status=completed)` on its own task id BEFORE returning, so completion does not depend on the orchestrator still being alive.
2. **Completion sentinel** — `plans/<active>/artifacts/wave9-complete.flag` is the disk-level truth. If it exists, the pipeline succeeded regardless of TaskList state.
3. **Reconcile preflight** — runs on every `/tkm:rebuild-spec` invocation (no-args or `--resume`) before dispatching any new work:

```
For each rebuild-spec task in TaskList with status=in_progress:
  Determine expected output path from task subject (e.g. "Wave1: route-list" → plans/<active>/artifacts/route-list.md)
  If expected output exists AND non-empty AND no placeholder text:
    TaskUpdate(id, status=completed, note="auto-reconciled from disk")
  Else:
    Leave in_progress — will be re-dispatched or retried
```

For Wave 9 specifically, reconcile checks `wave9-complete.flag` OR presence of all expected files in `docs/specs/`. With `--resume` the preflight is the only action.

See `references/pipeline.md` → "Reconcile pattern" for `TaskList`/`TaskUpdate` examples.

## Edge Cases

- **Empty codebase** → ABORT at preflight; no placeholder docs.
- **Scaffold-only repo** (lockfile present but no source files) → preflight passes lockfile check but Wave 0 scout returns near-empty report. Researcher MUST write "No data" markers per artifact rather than fabricate content.
- **FeatureList has 0 F### codes** → skip Wave 6, warn user.
- **Reviewer fails after 3 cycles** → escalate, leave drafts in `plans/<active>/artifacts/`, do NOT promote.
- **Subagent timeout (>15 min)** → retry once, then `TaskUpdate` failed; user decides resume.
- **Session context exhausted mid-pipeline** → tasks may remain `in_progress` despite output files existing on disk. Next invocation runs reconcile preflight (see Resume & Reconcile) to close them. Subagents self-close on the critical final wave to minimise orchestrator-liveness dependency.
- **Large codebase (F### count > 20)** → Wave 6 fan-out split into batches of 10 to bound peak context. Wave 7b reviews feature specs in batches of 5 after all W6 batches complete. Wave 7a reviews core artifacts in parallel with W6.
- **Language-adaptive scanning scope**: Wave 0 scout detects project language from manifest files and outputs flat file inventory + scanned dirs. Wave 2 follows imports one level deep using language-specific mechanisms (see `references/pipeline.md` W2 task for full rules). Reviewer cross-validates via scout-report.md inventory — no hardcoded extension globs. If scout-report.md absent (`--artifact` entry point), content-completeness check is skipped with a warning. Pure UI/presentational components with no service calls are automatically compliant. Known limitation: barrel/re-export files (e.g. `index.ts`) re-exporting at depth 2 are not followed — flagged `[BARREL_IMPORT]` advisory.
- **REG### scoping**: every REG must have parent SCR in same ScreenList. Orphan REG (no parent SCR) → critical.
- **REG nesting**: forbidden. REG inside REG → critical.
- **Mutually-exclusive tab content** → SCR variants (SCR###a/b), NOT REG (H4 short-circuit; hard rule).
- **Wizard/stepper content** → H5 sub-classification: Case A (distinct UI+validation+action per step) → SCR variants. Case B (shared state/endpoint, visual phases) → composite SCR + child REGs. Default for ≥3-step wizards: Case B. Case A requires cited evidence. 2-step wizards: always Case B.
- **W1 researchers (SystemOverview, RouteList, DataModel) MUST NOT emit REG###.** REG### first appears in W2 ScreenList.
- **Partial-screen ownership**: F### with SCR###/REG### ref owns REG only, not the parent SCR. Screen shell must be owned by a separate F### with bare SCR### ref.
- **Region independence signals**: REG### is justified by any ≥1 of — distinct API endpoint (read or write), independent loading state, independent scroll container, independent auth / permission gate, distinct business workflow, distinct mutation surface / API cluster (distinct write endpoints or POST/PUT/DELETE namespace — even if the initial GET payload is shared), distinct validation / action path. Shared initial payload alone does NOT disqualify a split (see verification-checklist Trap 1 + Trap 3).
- **Feature specs (v2.3.0+):** user-journey-first layout with business-reader preamble (`## Why This Exists` / `## Who Uses It` / `## Business Workflow` / `## Screen Flow`); FR/BR/SM/ALG/INT/SC codes inline under owning US or under `## Cross-Cutting Logic`; `## Spec Documents` checklist links to upstream artifact file paths for downstream `/plan` and `/takumi` consumption; see `templates/feature-spec-template.md`.

## Output

- Persistent: `docs/specs/*.md` + `docs/specs/features/F###_Name/spec.md`.
- Drafts + reports: `plans/<active-plan>/artifacts/` (kept for audit).
- Journal: auto-invoke `/tkm:write-journal` on completion (optional — skip silently if skill unavailable).

## References

- `references/code-formats.md` — F###/US###/SCR###/BL###/PERM### schema + valid criteria
- `references/verification-checklist.md` — reviewer checklist per artifact
- `references/pipeline.md` — wave dep graph + `TaskCreate` patterns
- `references/feature-spec-researcher-contract.md` — W6 researcher mandatory rules (extracted from template)
- `references/bl-source-patterns.md` — per-stack BL file patterns (9 stacks; Mode A folder-convention + Mode B annotation/decorator)
