# Verification Checklist

Consumed by `reviewer` subagent when validating rebuild-spec artifacts.

## How to use

Load this file + target artifact + cross-ref artifacts listed per section.
Output: per-issue list with severity (`critical`/`warning`) and `location.file:line`.
`passed` iff `failed === 0`.

## Validator Pre-Check Protocol

Before applying this checklist to feature specs (W7b), the reviewer MUST read `plans/<active-plan>/artifacts/validation/validation-summary.json`. The orchestrator injects per-fcode validator state into each W7b TaskCreate prompt. The reviewer behaves differently per state:

| Validator status (per fcode) | Reviewer behavior |
|------------------------------|-------------------|
| PASS (no validator issues) | Skip all `rule_id`s listed in `## Deterministic Validator Coverage`; mark them `[deterministic-pass]` in the review report. Focus on semantic depth (BR depth, FR/SC coverage, fabricated citations, cross-ref accuracy, edge case sufficiency). |
| WARN (warnings only) | Same as PASS, but cite warning `rule_id`s under "Validator notes" in the review report. Do not re-check those rules. |
| FAIL (critical present) | This should not occur at review time — orchestrator runs implementer fix cycle BEFORE dispatching W7b. If FAIL slips through, treat as critical and surface immediately. |
| no summary JSON (legacy plan) | Apply the full checklist (legacy mode). Note `[validator-summary-absent]` in the review report. |

`.pending` marker present in `artifacts/features/{slug}/` → reviewer emits `MISSING` for that fcode (see § Pending Marker Rule below). `MISSING` counts toward the review report's `failed` total.

## Universal rules

Applies to every artifact — do not repeat in per-artifact sections.

| Rule | Severity |
|------|----------|
| Artifact exists and is non-empty | critical |
| No placeholder text (`{PLACEHOLDER}`) | critical |
| Required sections present, in template order | critical |
| Orphaned code: exists in artifact but no F### in FeatureList references it | critical |
| Every reported issue includes `location.file` + `location.line` | critical |
| REG### must always appear as SCR###/REG### in cross-refs (bare REG### invalid) | critical |
| REG### parent SCR### must exist in same ScreenList | critical |
| REG### _NameSlug mandatory (no anonymous regions) | critical |
| REG### must not nest (no REG inside REG) | critical |
| Cross-ref tokenizer: split refs on `,` then on `/`. Left token = SCR### (must exist in ScreenList main index). Right token (if present) = REG### (must exist in the parent screen's Regions subsection). | critical |
| Content-completeness: every documented entity (route, model, screen, background-logic entry, permission) must be traceable to actual source code via scout-report.md inventory. Documented item with no verifiable source → critical. If scout-report.md absent → mark N/A, emit [WARN]. | critical |

Counting: `critical` → `failed`; `warning` → `warnings`; `MISSING` (see § Pending Marker Rule) → `missing` (counts toward `failed` for Wave 9 gate).

### Pending Marker Rule

`.pending` is a zero-byte sentinel written by Wave 5 and removed by Wave 6 researcher on successful `spec.md` write (see `references/canonical-fcode-schema.md § Folder Lifecycle`). When the W7b reviewer encounters `.pending` in `artifacts/features/{slug}/`:

| Marker state | spec.md state | Reviewer verdict | Frontmatter slot |
|--------------|---------------|------------------|------------------|
| `.pending` present | absent | `MISSING` | `missing += 1` |
| `.pending` present | present (W6 wrote but failed to remove marker) | `MISSING` | `missing += 1` (partial-write signal — researcher must verify or remove marker manually) |
| `.pending` absent | present | normal review | n/a |
| `.pending` absent | absent | critical (folder skeleton without content nor marker — orchestrator bug) | `failed += 1` |

`MISSING` blocks Wave 9 (review report frontmatter `missing > 0` → doc-writer HALT). Recovery: rerun Wave 6 for the affected fcode OR (after manual verification that `spec.md` is complete) remove `.pending` and rerun Wave 7b.

## Artifacts

### SystemOverview

**Cross-refs:** codebase package files (technology accuracy), FeatureList

**Required sections:** `# System Overview` (Project/Generated/Architecture Type) → `## Executive Summary` → `## System Architecture` → `### High-Level Architecture` (Mermaid graph TB) → `### Technology Stack` (Layer|Technology|Version) → `## Data Flow` (Mermaid sequenceDiagram) → `## Key Design Decisions` (min 2 × Context/Decision/Rationale) → `## Security Overview` → `## Scalability`

**Format checks:** both Mermaid diagrams present; Technology Stack has Layer/Technology/Version columns; heading hierarchy correct.

**Critical edge cases:**
- Missing Mermaid diagram → critical
- Technology documented but not in codebase → critical
- Technology in codebase but not documented → critical
- Mermaid syntax invalid → warning
- Key Design Decision missing Context/Decision/Rationale → warning

### RouteList

**Cross-refs:** codebase routes (`**/routes*.{php,js,ts,rb}`, `**/api*.{php,js,ts}`), FeatureList

**Required sections:** per `route-list-template.md`

**Format checks:** route path format valid (`METHOD /path`); handler references match actual code.

**Cross-refs:** every route in codebase must appear here; RouteList does NOT contain F### mapping (belongs to FeatureList only).

**Critical edge cases:**
- Route in codebase but not documented → critical
- Route documented but no F### in FeatureList references it → critical
- Route path/method doesn't match actual code → warning
- Route format invalid → warning

### DataModel

**Cross-refs:** codebase model files (`**/models/**/*.{js,ts,php,rb}`, `**/entities/**/*.{js,ts,php}`), FeatureList

**Required sections:** per `data-model-template.md`

**Format checks:** entity/attribute format valid; relationship types correct.

**Cross-refs:** every model in codebase must appear here; DataModel does NOT contain F### mapping.

**Critical edge cases:**
- Entity in codebase but not documented → critical
- Entity documented but no F### in FeatureList references it → critical
- Attribute format invalid → warning
- Relationship doesn't match actual model → warning

### ScreenList

**Cross-refs:** screen/view/component source files inventoried in `scout-report.md` (reviewer uses W0 scout inventory — avoids framework-specific extension assumptions; exact dirs and extensions are project-language-dependent), FeatureList, RouteList

**Required sections:** per `screen-list-template.md`

**Format checks:** all SCR### codes follow `SCR###_NameSlug`; each screen has ≥1 US### mapped; each screen has a route in RouteList.

**Cross-refs:** ScreenList does NOT contain F### or US### mapping (feature → FeatureList; US → UserStories).

**Critical edge cases:**
- Screen in codebase but not documented → critical
- Screen documented but no F### in FeatureList references it → critical
- Screen has no US### mapped → critical
- Screen has no route in RouteList → critical
- Service coverage: a service/API hook/helper module used by the screen's page file or its immediate component/partial/helper dependencies (per scout-report.md inventory) has no matching ROUTE### in RouteList AND no matching BL### in BackgroundLogic → critical
- SCR### format invalid → warning
- Router-outlet grouping [H6-VIOLATION]: a screen documented as composite (with REG regions) where the source file's primary content is a router outlet (per-stack H6 outlet signals in `composite-screen-detection.md § H6`) AND child routes each have a distinct URL path segment — should be separate SCR entries, not REG regions → critical
- Parent shell without own API: a screen with zero independent API calls (only renders router outlet) documented as its own SCR entry, with no persistent layout content (sidebar, timeline nav) → warning; shell context belongs in each child SCR description
- Over-merged screen [OVER-MERGED]: a single SCR entry listing ≥3 URL patterns of structurally different depth (not just :id param variants — e.g. /batches, /compare, /batch-results under same parent path) is a candidate for H6-split; flag for researcher review → warning

### ScreenFlow

**Cross-refs:** ScreenList (SCR### completeness), FeatureList

**Required sections:** per `screen-flow-template.md`

**Format checks:** all SCR### in flow exist in ScreenList; navigation transitions documented.

**Cross-refs:** every SCR### in ScreenList must appear in ScreenFlow.

**Critical edge cases:**
- SCR### in ScreenList but not in ScreenFlow → critical
- SCR### in ScreenFlow but no F### in FeatureList references it → critical
- Circular navigation dependency → critical
- Screen transition doesn't match actual navigation → warning
- Auth flow not documented → warning

### BackgroundLogic

**Cross-refs:** RouteList (ROUTE### refs), DataModel (MODEL### refs), FeatureList, scout-report.md `## Background Logic Source Inventory`

**Required sections:** `# Background Logic` → `## Background Logic Index` (Code|Name|Type|Trigger) → `## Background Logic Details` → `## Summary` → `## Cross-Reference Validation`

**Format checks:** all BL### follow `BL###_NameSlug`; codes unique; valid Type values (canonical 10): `custom-command`, `event-listener`, `integration`, `mail`, `middleware`, `notification`, `observer`, `queue-worker`, `scheduled-job`, `webhook`; each item has Type + Trigger + Description + Related Modules + Source File + Source Symbol.

**Cross-refs:** referenced ROUTE### must exist in RouteList; referenced MODEL### must exist in DataModel; overlap check: same name+different BL### or >50% keyword overlap = critical.

**Critical edge cases:**
- Duplicate BL### codes → critical
- BL### format invalid → critical
- Missing Type, Trigger, or Description → critical
- Invalid Type value (not in canonical 10) → critical
- BL item missing `Source File` field → critical
- BL item missing `Source Symbol` field → critical
- BL item `Source Symbol` containing multi-symbol delimiter — `,`, `;`, or whitespace-bounded ` and ` / ` & ` / ` + ` → critical (aggregation; split into separate BL items). `/` is excluded (overlaps composite refs / paths); `+`/`&` only count when surrounded by whitespace to avoid false-positives on Swift `MyClass+Extension` and similar single-symbol forms.
- Referenced ROUTE### not in RouteList → warning
- Referenced MODEL### not in DataModel → warning
- BL Source File not found in scout BL inventory → warning (researcher must justify in Description)

**Cardinality Cross-Check** (load scout `## Background Logic Source Inventory` before running):

Run per-stack, then take MAX gap across stacks (do NOT OR-merge — see bl-source-patterns.md § Multi-Stack Handling).

1. **Total count gap** — for each stack subsection: `gap = abs(inventory_count − bl_count) / max(inventory_count, 1) × 100`. Both undershoot and overshoot count. Bounds use strict-inequality semantics — boundary values fall in the lower band.
   - `gap ≤ 5%`: PASS
   - `5% < gap ≤ 15%`: warning + list uncovered entries (or BL items not backed by inventory)
   - `gap > 15%`: critical
   - Small-project floor: if `max(inventory_count, bl_count) < 20`, switch to absolute thresholds — `abs gap ≤ 2`: PASS; `2 < abs gap ≤ 4`: warning; `abs gap > 4`: critical.
   - **Overshoot diagnosis** (bl_count > inventory_count): surplus is either (a) duplicate BLs sharing a Source File with no distinct Source Symbol → critical (Rule C1 violation), or (b) BL items without inventory backing → check Rule 3.
2. **Category drop** — for each category present in inventory with ≥ 1 entry: artifact must have ≥ 1 BL of matching type. Category present in inventory but 0 BL of that type → critical.
3. **Source File check** — BL item with no `Source File` field → critical (already covered above). BL Source File not in any inventory entry → warning.
4. **Orphan file** — inventory entry with no matching BL Source File → critical (one finding per orphaned file).
5. **Inferred ratio (per stack)** — applies ONLY to stacks listed in `references/bl-source-patterns.md` table AND NOT the `### Unknown` no-manifest subsection. Stacks outside the table (e.g., Phoenix Elixir) and `### Unknown` are exempt — 100% inferred is expected and Rule 5 does not fire. For applicable stacks: `inferred_ratio = signal_inferred_count / stack_inventory_count` (both counts read from scout report § Background Logic Source Inventory, same stack subsection). Strict-inequality semantics — boundary values fall in the lower band. Thresholds preliminary; calibrate after smoke test.
   - **Guard (applied AFTER exemption check):** if `stack_inventory_count == 0`, skip ratio check (division undefined). If also `signal_inferred_count > 0`, that is a scout self-contradiction → critical.
   - `ratio ≤ 20%`: PASS
   - `20% < ratio ≤ 50%`: warning ("verify Mode A globs / Mode B grep coverage; non-standard libraries may be legitimate")
   - `ratio > 50%`: critical ("scout likely skipped per-stack patterns; re-scan required")
6. **Exclusion-pattern leak** — BL Source File matching scout filename-level exclusions → critical (scout-side filter failure; researcher cannot fix — re-run scout). Patterns:
   - **Test files (per language):** `*Test.{php,java,kt}`, `*Tests.cs`, `*_spec.rb`, `test_*.py`, `*_test.py`, `*_test.go`, `*.test.{ts,tsx,js,jsx}`, `*.spec.{ts,tsx,js,jsx}`, `tests/*.rs`
   - **Abstract bases:** `Abstract*.{php,java,kt,ts,cs}`, `*Base.{php,java,kt,ts,cs}`
   - **Vendor paths:** `vendor/`, `node_modules/`, `Pods/`, `.venv/`, `target/`
   LOC and auth-classification checks remain scout-side; if a leaked file passes filename heuristics, surface in next re-scan.

Reviewer output format for Cardinality Cross-Check:

```markdown
### BackgroundLogic Cardinality
- Inventory total: {N}
- Artifact BL count: {N}
- Gap: {X}% ({PASS|WARNING|CRITICAL})
- Missing categories: {type1, type2, ...} or none
- Orphan files: {path1}, {path2}, ... or none
```

Multi-stack example: "Laravel gap 2%, NestJS gap 67% (CRITICAL); max=67% → CRITICAL"

### Permissions

**Cross-refs:** RouteList (ROUTE### refs), ScreenList (SCR### refs), FeatureList

**Required sections:** `# Permissions` → `## Authorization System Type` → `## Permissions Index` (Code|Name|Type|Enforced At) → `### PERM###: Name` subsections → `## Summary` → `## Cross-Reference Validation`

**Format checks:** all PERM### follow `PERM###_NameSlug`; codes unique; valid Auth System Type: `rbac`, `abac`, `acl`, `ownership`, `hybrid`, `other`; valid Permission Type: `route-guard`, `screen-permission`, `action-permission`, `data-permission`, `role-based`, `resource-ownership`, `field-permission`, `api-scope`; each item has Type + Enforced At + Description + Permission Rules matrix + Related Modules.

**Cross-refs:** referenced ROUTE### must exist in RouteList; referenced SCR### must exist in ScreenList; overlap check same as BackgroundLogic.

**Critical edge cases:**
- Missing Authorization System Type section → critical
- Invalid Authorization System Type value → critical
- Duplicate PERM### codes → critical
- PERM### format invalid → critical
- Missing Type, Enforced At, Description, or Permission Rules → critical
- Same route/screen with conflicting permissions → warning
- Referenced ROUTE### not in RouteList → warning
- Referenced SCR### not in ScreenList → warning

### UserStories

**Cross-refs:** ScreenList (SCR### count + refs), BackgroundLogic (BL### refs), Permissions (actor split), FeatureList

**Required sections:** per `user-stories-template.md`

**Format checks:** all US### follow `US###_NameSlug`; `ui` type US has ≥1 SCR### in Screens section; `system` type US has ≥1 BL### in Background Logic section; UI US count ≥ SCR### count in ScreenList.

**Cross-refs:** actor split — if Permissions shows different roles have different access → verify US split by actor.

**Critical edge cases:**
- UI US count < UI Screen count → critical
- US### not referenced by any F### in FeatureList → critical
- UI US### has no SCR### mapped → critical
- System US### has no BL### mapped → critical
- Referenced SCR### not in ScreenList → warning
- Referenced BL### not in BackgroundLogic → warning
- US combines multiple user actions (compound title with "and"/"or", multiple verbs, or CRUD grouping like "manage"/"CRUD"/"create/edit/delete") → critical
- US title uses compound/vague action verbs ("manage", "handle", "CRUD", "create/edit", "create or edit") → critical; split into separate US per verb
- US title contains "/" separating two actions (e.g., "Create/Edit User") → critical
- Destructive action (Delete/Remove/Revoke/Deactivate) visible on a screen with no dedicated US → critical [IPE_MISSING_DESTRUCTIVE]
- Screen with ≥3 distinct buttons/actions in source but only 1 US mapped → warning [IPE_SPARSE]; note screen for researcher re-pass
- Interaction Inventory table absent or empty when UI screen count > 0 → warning
- Two US sharing identical HTTP endpoint AND actor → warning [IPE_MERGE_CANDIDATE]; verify merge exception applies (same data flow required)
- Multiple distinct actors combined in single US (e.g., "Admin and User") → warning
- Acceptance criteria vague/non-testable → warning
- US missing priority → warning

### FeatureList

**Cross-refs:** UserStories, ScreenList, RouteList, DataModel, BackgroundLogic, Permissions (all codes cross-validated)

**Required sections:** `# Feature List` → `## Feature Hierarchy` (Code|Name|Type|Language|Workspace|Priority) → `## Feature Details` → `## Summary` → `## Cross-Reference Validation`

**Format checks:** all F### follow `F###_NameSlug`; codes unique; valid Type: `ui`, `background`, `mixed`; feature names specific (not "Management", "CRUD").

**Feature type rules:** `ui` → SCR### required; `background` → BL### required, no SCR###; `mixed` → SCR### + BL### both required. PERM### optional for all types.

**Valid feature criteria (all 4):** Single Intent, Clear Flow (input→process→output), Independently Testable, Agent Implementable. Same name+different F### or >50% keyword overlap = critical.

**Cross-refs:**
- All US###/SCR###/ROUTE###/MODEL###/BL###/PERM### in feature must exist in their source artifact
- Every BL### in BackgroundLogic must be referenced by ≥1 F### (orphan BL### → missing-feature-log)
- Every PERM### in Permissions must be referenced by ≥1 F### (orphan PERM### → missing-feature-log)
- Read missing-feature-log at start → report each item as critical → clear log

**Critical edge cases:**
- Duplicate F### codes → critical
- Feature with multiple intents or no clear flow → critical
- Orphaned US###/SCR###/ROUTE###/MODEL### in feature → critical
- BL### in BackgroundLogic not mapped to any F### → critical
- PERM### in Permissions not mapped to any F### → critical
- Feature name vague → warning

### FeatureSpec

**Cross-refs:** all 9 document artifacts (FeatureList, UserStories, ScreenList, ScreenFlow, RouteList, DataModel, BackgroundLogic, Permissions, SystemOverview)

**Required sections (in order):** `## Overview` → `## Why This Exists` → `## Who Uses It` → `## Business Workflow` → `## Screen Flow` → `## Cross-Cutting Logic` → `## User Stories` → `## Key Entities` → `## Related Artifacts` → `## Spec Documents` → `## Assumptions` → `## Source Code References` → `## Unresolved Questions`

**Preamble structure:** All 4 preamble sections (`## Why This Exists`, `## Who Uses It`, `## Business Workflow`, `## Screen Flow`) MUST be present and non-empty. Valid content: real prose OR literal `N/A — {justification}.` Specifically: `## Why This Exists` accepts `N/A — inferred from code; domain confirmation needed.`; `## Screen Flow` MUST begin with `**See:** ScreenFlow § {F###_entry}` cross-ref OR `N/A — background feature; no user-facing screen flow.`; `## Who Uses It` PERM### refs MUST resolve to Permissions artifact.

**Cross-Cutting Logic structure:** 6 required H3 subsections in order: `### Requirements`, `### Business Rules`, `### State Machines`, `### Algorithms`, `### External Integrations`, `### Verification`. Empty subsection MUST contain `None.`.

**User Stories structure:** ≥1 `### {US###_CODE} — {Title} (Priority: Pn)` block. Each block: `**What happens:**`, `**Why this priority:**`, `**Independent Test:**`, `**Acceptance Scenarios:**` (Given/When/Then), `**Requirements fulfilled:**` bullets are REQUIRED. `**Rules enforced:**`, `**State transitions:**`, `**Algorithms:**`, `**External integrations:**`, `**Verification:**` are OPTIONAL (omit when not applicable). `### Edge Cases` H3 MUST appear after last US block.

**Format checks:**
- F### code follows `F###_NameSlug`, matches FeatureList entry exactly (code + name + priority).
- US### / SCR### / REG### formats valid (reference code-formats.md).
- BR / SM / ALG / INT codes use `{PREFIX}-###_NameSlug`; per-spec unique; code appears with full `**Source:**` block exactly once.
- Each BR/SM/ALG/INT full block has `**Source:** path:start-end` citation (line range mandatory).
- Each BR/SM/ALG/INT full block has ≥1 `**Linked FR:** FR-###` referencing an FR in the same spec. (Mechanical insertion handled by `scripts/structural_fixer.py` at Wave 7.5; reviewer flags only when placeholder `FR-???` remains.)
- SM full block MUST contain a Mermaid `stateDiagram-v2` fenced block.
- Pseudocode blocks ≤20 lines; no literal `{lang}` in fence; no secrets/credentials.
- Each FR-### appears in exactly one of: a US's `**Requirements fulfilled:**` list OR Cross-Cutting `### Requirements` table.
- Every FR-### declared (whether under a US or in `## Cross-Cutting Logic > ### Requirements`) MUST be covered by ≥1 SC-### via the `(covers …)` back-ref. Uncovered FR = critical (verification missing).
- Each SC-### appears inline in a US's `**Verification:**` list OR in Cross-Cutting `### Verification`; has `(covers FR-### / BR-### / …)` back-ref to ≥1 code in the same spec.
- Cross-US reference format: `BR-### (see US###)` — reference-only, no Source block.
- `## Screen Flow` first non-blank line matches regex `^\*\*See:\*\* ScreenFlow § F\d{3}_\w+$` OR equals `N/A — background feature; no user-facing screen flow.`.
- No H2 heading named `## Requirements`, `## Business Rules`, `## State Machines*`, `## Algorithms*`, `## External Integrations*`, `## Success Criteria`, or `## How It Works`.
- No `## Appendix` heading in submitted draft.

**Cross-refs (all 9 artifacts mandatory):**

| Field in spec | Must match |
|---------------|-----------|
| F### code, feature name, priority | FeatureList (exact match) |
| All SCR###/US###/ROUTE###/MODEL###/BL### listed in FeatureList for this F### | Present in spec |
| SCR### codes | Exist in ScreenList |
| US### codes | Exist in UserStories |
| Screen flow references | Match ScreenFlow |
| Routes referenced | Exist in RouteList |
| Entities referenced | Exist in DataModel |
| BL### codes in Related Artifacts | Exist in BackgroundLogic |
| PERM### codes in Related Artifacts | Exist in Permissions |
| `**Source:** file:line` cited in BR/SM/ALG/INT blocks | File exists and cited range contains the described logic (reviewer reads to verify) |

Content grounded in actual source code (no fabricated details).

**Critical edge cases:**
- Feature spec missing / empty → critical
- F### not in FeatureList → critical
- Feature name or priority mismatch with FeatureList → critical
- Required section absent or out of order → critical (includes missing `## Why This Exists` / `## Who Uses It` / `## Business Workflow` / `## Screen Flow` / `## Key Entities` / `## Related Artifacts` / `## Spec Documents` / `## Assumptions` / `## Source Code References` / `## Unresolved Questions`)
- Preamble section present but empty / placeholder-only → critical
- `## Screen Flow` missing `**See:** ScreenFlow § {F###_entry}` first-line cross-ref AND not the N/A fallback → critical
- `## Who Uses It` references PERM### not in Permissions artifact → critical
- Top-level deprecated heading present (`## Requirements` / `## Business Rules` / `## State Machines*` / `## Algorithms*` / `## External Integrations*` / `## Success Criteria` / `## How It Works`) → critical
- FR-### defined but not appearing under any US's `**Requirements fulfilled:**` list or under Cross-Cutting `### Requirements` → critical (orphan FR)
- FR-### declared in `## Cross-Cutting Logic > ### Requirements` but not referenced from any US's `**Requirements fulfilled:**` list AND not covered by any SC-### `(covers …)` back-ref → critical (zombie cross-cutting FR — declared but never consumed).
- FR-### declared anywhere (US or Cross-Cutting) but no SC-### `(covers …)` references it → critical (uncovered FR — no verification path).
- FR-### appearing BOTH under a US AND under Cross-Cutting → critical (ambiguous home)
- SC-### appearing in a dedicated top-level section → critical (must be inline under US or Cross-Cutting)
- SC-### without `(covers …)` back-ref → critical
- SC-### `(covers …)` references a code not defined in this spec → critical

**Content depth checks (CRITICAL — these catch shallow/generic specs):**
- `## Business Workflow` without numbered steps (≥3 for non-trivial features) → critical
- `## Business Workflow` steps that lack specific entity/table/job/field references → critical (generic prose)
- `## Screen Flow` for UI/mixed features missing Screen Route Table (Screen|Route|Purpose) → critical
- `## Cross-Cutting Logic > ### Business Rules` with <3 BRs for UI features → warning (shallow extraction)
- BR/SM/ALG/INT block missing `**Source:** file:line-range` citation → critical
- `**Source:**` cites a non-existent file or invalid/unverified range → critical
- User Story missing `**What happens:**` / `**Why this priority:**` / `**Independent Test:**` → critical
- User Story acceptance scenarios without Given/When/Then structure → warning (vague criteria)
- User Story missing `**Endpoints**: METHOD /path` for its routes → warning
- `### Edge Cases` section missing → critical (must appear under `## User Stories`)
- `### Edge Cases` with <3 rows for UI features or <1 for background features → critical (shallow)
- Edge case rows missing HTTP status code or specific error message → warning
- `## Key Entities` missing or has 0 entity rows → critical
- `## Key Entities` without database table names (just model codes) → warning
- `## Key Entities` with <3 entities for non-trivial features → warning (likely incomplete)
- `## Source Code References` missing or has 0 entries → critical
- `## Source Code References` with <3 entries → warning (likely incomplete)
- `## Source Code References` entries without file path line ranges → warning
- `## Assumptions` missing or has 0 entries → warning
- `## Assumptions` with <2 entries for non-trivial features → warning
- `## Unresolved Questions` missing → warning (expected for complex features)
- `## Related Artifacts` missing or has 0 artifact references → critical
- `## Spec Documents` missing → critical
- `## Spec Documents` without `System Overview` and `Feature List` checked → critical (both are always-checked)
- `## Spec Documents` checked item references codes not present in `## Related Artifacts` → warning (stale cross-ref)
- `## Spec Documents` unchecked item but `## Related Artifacts` lists codes from that artifact → warning (should be checked)
- Same BR/SM/ALG/INT code with `**Source:**` line appearing in 2+ places → critical (duplicate full block; secondary occurrences must be reference-only)
- Cross-Cutting subsection blank (no `None.` under empty H3) → critical
- Any SCR###/US###/ROUTE###/MODEL###/BL### from FeatureList absent in spec → critical
- BR/SM/ALG/INT referencing FR-### not in same spec → critical
- Cross-spec BR/SM/ALG/INT ref (e.g., "see BR-001 in F002") → critical
- SM full block missing Mermaid `stateDiagram-v2` → critical
- Secret/credential leaked in pseudocode → critical
- `## Appendix` heading present in submitted draft → critical
- `### Edge Cases` promoted to H2 or missing from `## User Stories` → critical
- Cross-US reference using a format other than `BR-### (see US###)` (e.g., `BR-### from US###`, `see BR-001`) → warning
- Pseudocode block > 20 lines → warning
- Pseudocode fence contains literal `{lang}` placeholder → warning
- US without priority → warning
- `## Why This Exists` reads as invented product rationale without `**Source:**` citation or N/A disclaimer (reviewer judgment call; when in doubt, flag) → warning
- `## Screen Flow` inline prose duplicates > 50% of `## Business Workflow` prose (reviewer judgment; substring overlap heuristic) → warning

## Composite Detection Rules

Rules fire unconditionally on every pipeline invocation. No opt-in flag.

- [ ] **H4 short-circuit respected (tabs only):** mutually-exclusive tab content (per-stack tab signals in `composite-screen-detection.md § H4`) → SCR variants (SCR###a/b), not REG. Hard rule; overrides all other heuristics for tab-style screens. Reviewer selects signals from the row matching the task's `Detected stack:` value.
- [ ] **H5 wizard/stepper classification:** screens with wizard/stepper signals (per-stack signals in `composite-screen-detection.md § H5`) MUST cite classification evidence in spec. Case A (SCR variants) requires explicit citation of distinct validation rules AND distinct API endpoints AND distinct user action per step. Case A without cited evidence → warning (researcher should re-evaluate as Case B). 2-step wizards defaulting to Case A → critical (must be Case B). ≥3-step wizards default to Case B (composite SCR + step REGs).
- [ ] **H3 region count excludes H4/H5 signals:** tab signals (H4) and wizard/stepper signals (H5) — per per-stack tables in `composite-screen-detection.md § H4` and `§ H5` — MUST NOT count toward H3 (any stack).
- [ ] **H2 module count uses per-stack include/exclude tables:** only domain/feature module imports count toward H2; UI-library and framework-primitive imports are excluded. Reviewer applies the include/exclude row matching the task's `Detected stack:` value — see per-stack tables in `composite-screen-detection.md § H2`.
- [ ] **2-of-3 signal gate applied:** composites cite which 2 signals passed (H1∧H2, H1∧H3, or H2∧H3). Screens not meeting gate → emit bare SCR###.
- [ ] **Raw-div fallback noted when H3=0:** if H3 yields 0, gate uses H1+H2 only. If both H1 and H2 also fail → emit atomic + warning. Known Detection Limitation documented in spec output.
- [ ] **FeatureList composite-ref tokenizer (C3):** FeatureList Related Screens tokenizer splits on `,` then on `/`. Left token = SCR### (must exist in ScreenList main index). Right token (if present) = REG### (must exist in that screen's Regions subsection). Both tokens validated independently. Missing REG### under valid SCR### → critical.
- [ ] **Malformed composite ref (M3):** malformed composite refs (`SCR001REG001` missing `/`, `SCR001/` missing REG, `SCR/REG001` missing digits, `SCR001/REG` missing digits) → critical. Regex: `^SCR\d{3}_\w+(/REG\d{3}_\w+)?$` must match.
- [ ] **W1 no-REG rule (M5):** W1 artifacts (SystemOverview, RouteList, DataModel) MUST NOT contain REG### codes. REG### first appears in W2 ScreenList. Orphan REG### in W1 artifact → critical.
- [ ] **Partial-screen ownership (CE3):** each SCR### must have ≥1 F### owning the screen shell (bare SCR### ref in FeatureList Related Screens); each REG### must have ≥1 F### owning it (SCR###/REG### ref). An F### with only SCR###/REG### refs does NOT own the parent SCR.
- [ ] **SIGNAL_INFERRED cap and justification:** `[SIGNAL_INFERRED]` tag in ScreenList Notes signals researcher used `composite-screen-detection.md § Signal Inference Fallback`. Tag MUST cite an H-rule in H2–H6 (H1 has no signal table — inference invalid for H1). Each occurrence MUST carry a 3-part justification (Intent matched / No-row reason / Observed pattern). Missing any part → critical. Count `[SIGNAL_INFERRED]` occurrences across the entire ScreenList document; threshold = `max(5, ceil(0.10 × SCR_count))` — exceeding triggers warning (over-reliance on inference; per-stack tables likely outdated or stack uncovered).

## Deterministic Validator Coverage

These `rule_id`s are pre-checked by `scripts/validate_*.py` BEFORE the W7b reviewer runs. When `validation-summary.json` reports a rule as `PASS`, the reviewer marks that rule `[deterministic-pass]` and focuses on semantic depth instead. When a rule is `FAIL`, the orchestrator dispatches an `implementer` fix cycle before W7b runs (see `pipeline.md § Wave 6.5`).

| rule_id | validator script | severity |
|---------|------------------|----------|
| existence.folder_missing | validate_feature_existence.py | critical |
| existence.folder_incomplete | validate_feature_existence.py | critical |
| existence.slug_format | validate_feature_existence.py | critical/warning |
| existence.orphan_folder | validate_feature_existence.py | warning |
| existence.canonical_missing | validate_feature_existence.py | warning |
| FeatureSpec.required_sections | validate_feature_spec.py | critical |
| FeatureSpec.ccl_subsections | validate_feature_spec.py | critical |
| FeatureSpec.ccl_blank | validate_feature_spec.py | critical |
| FeatureSpec.screen_flow_crossref | validate_feature_spec.py | critical |
| FeatureSpec.bw_steps | validate_feature_spec.py | critical |
| FeatureSpec.deprecated_headings | validate_feature_spec.py | critical |
| FeatureSpec.no_appendix | validate_feature_spec.py | critical |
| FeatureSpec.edge_cases | validate_feature_spec.py | critical |
| FeatureSpec.f_code_format | validate_feature_spec.py | critical |
| FeatureSpec.sm_mermaid | validate_feature_spec.py | critical |
| FeatureSpec.pseudocode_length | validate_feature_spec.py | warning |
| FeatureSpec.pseudocode_fence | validate_feature_spec.py | warning |
| Universal.no_placeholder | validate_feature_spec.py | critical |
| citation.file_missing | validate_source_citations.py | critical |
| citation.range_invalid | validate_source_citations.py | critical |
| citation.range_inverted | validate_source_citations.py | critical |
| citation.path_traversal | validate_source_citations.py | critical |
| citation.unreadable | validate_source_citations.py | warning |
| FeatureSpec.br_linked_fr_present | structural_fixer.py | critical |

Rules NOT in this table remain reviewer-only (e.g., FR/SC coverage cross-refs, BR depth heuristics, cardinality cross-check, composite detection — these need semantic judgement).

## Failure Trap Assertions

- **Trap 1 (proliferation):** every REG has ≥1 independence signal, drawn from: distinct API endpoint (read or write), independent loading state, independent scroll container, independent auth / permission gate, distinct business workflow, distinct mutation surface / API cluster (distinct write endpoints or POST/PUT/DELETE namespace — even if the initial GET payload is shared), distinct validation / action path. Missing signal → critical. Visual separation alone is NOT sufficient.
- **Trap 2 (tab/stepper misclassification):** mutually-exclusive tab content declared as REG (not SCR variants) → critical. Wizard/stepper content: Case A emitted without cited distinct-validation + distinct-endpoint evidence → warning (prompt researcher to re-evaluate as Case B). 2-step wizard emitted as Case A → critical.
- **Trap 3 (shared data):** collapse two REG candidates into one Feature ONLY when they share ALL of: read surface (same GET endpoint/store) AND write surface (same mutations) AND business workflow. Shared initial payload alone does NOT disqualify a split — if regions diverge on write endpoints, validation rules, action paths, or business workflow, they remain separate. Researcher self-check advisory (NOT reviewer-enforceable critical — reviewer cannot inspect codebase at review time).
- **Trap 4 (LOC-based over-split):** LOC is NOT a composite signal. H3 uses named wrapper components only. Advisory note: flag any ScreenList entry where the researcher's justification cites line count rather than named wrappers or import count.
- **Trap 5 (spec orphan):** every REG### in ScreenList must have an owner annotation (can be `TBD`) → critical if owner annotation missing entirely.
- **Trap 6 (inferred-signal abuse):** `[SIGNAL_INFERRED]` tag without all 3 justification parts (Intent matched, No-row reason, Observed pattern) → critical. Tag citing H1 (which has no signal table) → critical; H2–H6 only. Tag used to bypass a per-stack row that DOES match the screen's stack/library naming → critical (researcher must use explicit row first). Tag count exceeding `max(5, ceil(0.10 × SCR_count))` across the entire ScreenList document → warning (suggests per-stack tables need updating or stack/library not covered).
