---
name: tkm:rebuild-spec
description: "Reverse-engineer an existing codebase into structured documentation — 9 standard doc artifacts (architecture, data models, API specs, flows, etc.) plus per-feature specifications. Uses parallel agents: scanner, researcher, reviewer, doc-writer."
argument-hint: "[--features F001,F002] [--artifact NAME]"
metadata:
  author: takumi-agent-kit
  version: "3.2.2"
---

# tkm:rebuild-spec

Reverse-engineer existing codebase → structured spec artifacts by composing existing skills.
Zero third-party CLI dependencies. Output lands in `docs/specs/`.

**Principles:** YAGNI, KISS, DRY | Compose, don't reinvent | Template-first.

## Usage

```
/tkm:rebuild-spec                        # Incremental if .rebuild-state.json present; full otherwise. Reconcile preflight; auto-resume.
/tkm:rebuild-spec --full                 # Force full rebuild (ignore state, rebuild everything)
/tkm:rebuild-spec --since abc123         # Override diff base SHA (custom incremental starting point)
/tkm:rebuild-spec --dry-run              # Print planner decision JSON to stdout; no file writes
/tkm:rebuild-spec --features F001,F002   # Feature specs only (requires FeatureList exists)
/tkm:rebuild-spec --artifact route-list  # Regenerate single artifact (reuses upstream if present)
/tkm:rebuild-spec --resume               # Reconcile-only: sync TaskList against disk, close stale in_progress tasks whose outputs already exist. No new work dispatched.
```

**Force restart:** delete `plans/<active>/artifacts/` → next no-args invocation starts fresh.

## Preflight

1. Detect project root = CWD (must be under git control).
2. Verify source code present: non-empty working tree AND has at least one of `package.json`, `composer.json`, `pom.xml`, `go.mod`, `Cargo.toml`, `pyproject.toml`, `Gemfile`. Empty → ABORT with clear hint.
3. Resolve active plan path from `## Plan Context` hook; if none, fallback to `plans/<timestamp>-rebuild-spec/`.
3.5. **Bootstrap detection (v2.x upgrade):** If `.rebuild-state.json` absent AND `docs/specs/system-overview.md` or `feature-list.md` present AND `git log -1 -- docs/specs/` returns a SHA ≠ HEAD → prompt user to bootstrap state from git history or force full rebuild. See `references/pipeline.md` § Wave -2.
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
1.5. Wave 0.5 — emit `_session-context.md` shared context (`scripts/build_session_context.py`) + extract BL inventory fragment (`scripts/extract_scout_section.py`). All W1-W9 subagents read `_session-context.md` FIRST.
2. Waves 1–5 — `researcher` chain, one per doc artifact, `blockedBy` per dep graph. Inputs: scout report + template + `code-formats.md`. Wave 5 co-emits `_canonical-fcodes.json` and per-feature `artifacts/features/{slug}/.pending` markers — see `references/canonical-fcode-schema.md`. After W5: update `_session-context.md` feature_count.
3. Wave 5.5 — deterministic existence validator (`scripts/validate_feature_existence.py`); halts pipeline on FAIL before W6 dispatch. Unconditional (no opt-in flag).
4. Wave 6 — fan-out `researcher` × F### extracted from FeatureList (parallel, `blockedBy` W5). If F### count > 20, split into **batches of 5** (env override: `REBUILD_W6_BATCH_SIZE`) (`Wave6.batch-01`, `Wave6.batch-02`, …) to bound peak context and rate-limit pressure. Each researcher removes its own `.pending` on success.
5. Wave 6.5 — deterministic spec + citation validators (`scripts/validate_feature_spec.py`, `scripts/validate_source_citations.py`); merge into single `artifacts/validation/validation-summary.json`. On FAIL, orchestrator spawns `implementer` per failed F### (max 2 cycles → escalate to fresh `researcher`). On PASS/WARN, dispatch W7b.
6. Wave 7a — `reviewer` pass on 9 core artifacts using scoped `verification-checklist.md` sections + pre-extracted BL inventory fragment (runs **parallel** with Wave 6).
7. Wave 7b — `reviewer` pass on feature specs in **batches of 5**, using only FeatureSpec checklist section (runs after Wave 6). Validator summary JSON injected per fcode: deterministic-pass rule_ids skipped; reviewer focuses semantic depth. `.pending` marker present → `MISSING` (counts toward `failed`).
8. Wave 7-merge — combine `core-review-report.md` + `feature-review-batch-*.md` into single `review-report.md`.
8.5. Wave 7.5 — `structural_fixer.py` inserts missing `**Linked FR:**` placeholders in BR/SM/ALG/INT blocks; decrements `failed` count; skips W8 if all critical issues were structural. Optional W7.6: single researcher resolves `FR-???` placeholders.
9. Wave 8 — `implementer` applies fixes + `re-reviewer` verifies each fix (max 3 cycles; escalates to user if still failing after cycle 3).
10. Wave 9 — pre-flight gate reads `validation-summary.json` + review frontmatter; HALTS if `overall_status == FAIL` OR `failed > 0` OR `missing > 0`. On pass: `promote_drafts.py` handles all file-ops (cp drafts → docs/specs/, stub, archive, GC, sha256 manifest); `doc-writer` writes completion flag + **self-closes via `TaskUpdate(status=completed)` before returning**; `system-overview.md` promoted as redirect stub per `claude/skills/_shared/docs-canonical-mapping.md` § Stub Rule.

**Flag overrides:**

| Flag | Effect |
|------|--------|
| _(none)_ | Incremental if `docs/specs/.rebuild-state.json` present; full otherwise. Reconcile preflight runs first; auto-resume if `TaskList` has pending tasks |
| `--full` | Force full rebuild — ignore state, regenerate all 9 artifacts + all feature specs |
| `--since <sha>` | Override diff base SHA for incremental (custom starting point). Mutually exclusive with `--full` |
| `--dry-run` | Print planner decision JSON to stdout; no file writes, no wave dispatch |
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
| 0.5 | orchestrator (scripts) | scout-report.md + stackNote | `_session-context.md` + `_scout-bl-inventory.md` |
| 1–5 | `researcher` | scout report + template + `code-formats.md` | `plans/<active>/artifacts/<artifact>.md` |
| 6 | `researcher` | scoped artifact sections (Grep per F###) + `feature-spec-researcher-contract.md` + `feature-spec-template.md` | `plans/<active>/artifacts/features/F###_Name/spec.md` + `TaskUpdate(status=completed)` |
| 7a | `reviewer` | 9 core artifacts + `_scout-bl-inventory.md` + scoped `verification-checklist.md` (core sections) | `core-review-report.md` + `TaskUpdate(status=completed)` |
| 7b | `reviewer` | feature spec batches (5/reviewer) + scoped `verification-checklist.md` (FeatureSpec section) | `feature-review-batch-NN.md` + `TaskUpdate(status=completed)` |
| 7-merge | orchestrator | `core-review-report.md` + `feature-review-batch-*.md` | `review-report.md` |
| 7.5 | orchestrator (`structural_fixer.py`) | feature specs + review-report.md | fixed specs + `structural-fix-report.json` + decremented review-report |
| 8 | `implementer` | review report + affected drafts | updated drafts |
| 9 | `promote_drafts.py` + `doc-writer` | approved drafts | `docs/specs/*.md` + `_promoted-sha256.txt` + `wave9-complete.flag`. **MUST** call `TaskUpdate(status=completed)` on its own task before returning |

All subagents read `_session-context.md` first; only artifact-specific reads listed in Input column happen afterward.

## Task management

Plan files = persistent. Tasks = session-scoped. Hydrate waves as Task chain.
Fallback: if Task tools unavailable (VSCode extension) → use `TodoWrite`.
See `references/pipeline.md` for `TaskCreate` examples.

## Resume & Reconcile

Orchestrator context can run out mid-pipeline — tasks may stay `in_progress` even after subagent output files are fully written. Three defenses:

1. **Self-closing subagents (Wave 6, 7a, 7b, 9)** — subagents call `TaskUpdate(status=completed)` on their own task id BEFORE returning, so completion does not depend on the orchestrator still being alive.
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

- **Orphan `.pending` marker** → Wave 6 partial: spec.md write failed OR researcher did not remove the marker on success. Wave 7b emits `MISSING` for that fcode, Wave 9 pre-flight gate blocks promotion. Recovery: rerun Wave 6 for the affected fcode OR (after manually verifying `spec.md` is complete) remove `.pending` and rerun Wave 7b. See `references/canonical-fcode-schema.md § Folder Lifecycle` + `references/verification-checklist.md § Pending Marker Rule`.
- **Validator FAIL at W5.5 or W6.5** → orchestrator HALTS before next wave. W5.5 FAIL halts before Wave 6 fan-out (folder/slug drift). W6.5 FAIL spawns `implementer` fix per failed F###; after 2 failed cycles escalate to fresh `researcher` re-draft. Both checks unconditional — no env var, no opt-in.
- **Empty codebase** → ABORT at preflight; no placeholder docs.
- **Scaffold-only repo** (lockfile present but no source files) → preflight passes lockfile check but Wave 0 scout returns near-empty report. Researcher MUST write "No data" markers per artifact rather than fabricate content.
- **FeatureList has 0 F### codes** → skip Wave 6, warn user.
- **Reviewer fails after 3 cycles** → escalate, leave drafts in `plans/<active>/artifacts/`, do NOT promote.
- **Subagent timeout (>15 min)** → retry once, then `TaskUpdate` failed; user decides resume.
- **Session context exhausted mid-pipeline** → tasks may remain `in_progress` despite output files existing on disk. Next invocation runs reconcile preflight (see Resume & Reconcile) to close them. Subagents self-close on the critical final wave to minimise orchestrator-liveness dependency.
- **Small codebase (screens < 30)** — W2a + W2b merged into single Wave 2 task (env: `REBUILD_W2_MERGE_THRESHOLD`; default 30).
- **Large codebase (F### count > 20)** → Wave 6 fan-out split into batches of 5 (env: `REBUILD_W6_BATCH_SIZE`; default 5) to bound peak context and rate-limit pressure. Wave 7b reviews feature specs in batches of 5 after all W6 batches complete. Wave 7a reviews core artifacts in parallel with W6.
- **PASS one-liner format** — reviewer reports use `✓ <rule_id> @ <fcode>` line format under `## Passed Checks`. W7-merge rolls up consecutive same-rule fcodes into ranges.
- **Incremental mode (v3.1.0+)** — auto-engaged when `docs/specs/.rebuild-state.json` present. Diffs source since last SHA; maps changed files to cascade chain (route/model → full W1→W5→W6; screen/bg/perm → truncated chain; other → W6 subset only). Only affected waves + F### dispatched. Override: `--full`.
- **First-run guard** — incremental on fresh repo (empty `docs/specs/`) → auto-fallback to full silently (no abort).
- **Manifest change** (package.json, composer.json, etc.) → auto-fallback to full.
- **Diff threshold** — diff > 30% of source files → auto-fallback to full (env: `REBUILD_INCREMENTAL_THRESHOLD`).
- **Unowned new source file** — new file not in scout-report → fallback full (FeatureList may be stale).
- **OOB edit detected** — `docs/specs/<artifact>.md` hand-edited between runs → `[OUT_OF_BAND_EDIT]` warning (non-blocking).
- **Empty cascade** (all `other`-type files) → W6 subset only via reverse-index; no core waves dispatched.
- **v2.x upgrade** — `docs/specs/` present without `.rebuild-state.json` → orchestrator offers bootstrap prompt (Wave -2); user can pick fast-incremental (with hand-edit caveat) or safe-full path. If `git log` returns no SHA for `docs/specs/` or derived SHA = HEAD, bootstrap is skipped silently.
- **`--full` + `--since` mutually exclusive** → exit 2 with error.
- **Wave -1 hydrate** — copies non-affected artifacts from `docs/specs/` to `plans/<active>/artifacts/` so downstream waves (reconcile, reviewer) see complete context.
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
- `references/canonical-fcode-schema.md` — `_canonical-fcodes.json` schema + slug grammar + folder lifecycle (`.pending` markers)
- `references/incremental-state-schema.md` — `.rebuild-state.json` + `_source-to-fcode.json` + `.incremental-plan.json` schemas
- `scripts/incremental_planner.py` — cascade-aware incremental planner (decision oracle for selective dispatch)
- `scripts/build_source_to_fcode.py` — Wave 9.5 reverse-index + state emitter (emits `doc_shas`)
- `scripts/` — deterministic Python validators (`validate_feature_existence.py`, `validate_feature_spec.py`, `validate_source_citations.py`) + shared libs (`_slug_lib.py`, `_summary_lib.py`); stdlib-only, no pip
- Canonical docs mapping: `claude/skills/_shared/docs-canonical-mapping.md` — single source of truth for topic → file ownership, stub rule, surgical-edit policy
