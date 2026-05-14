# Pipeline — Wave Dependency Graph

Expresses rebuild-spec artifact generation order as `TaskCreate` chains.
Execution handled by TaskList — no custom orchestrator needed.

## Waves

| Wave | Artifact(s) | Depends On | Parallel |
|------|-------------|------------|---------|
| 0 | Scout discovery | — | yes |
| 1 | SystemOverview, RouteList, DataModel | W0 | yes |
| 2 | ScreenList + ScreenFlow | W1 (RouteList + DataModel) | — |
|   | BackgroundLogic | W2 (ScreenList + ScreenFlow) | — |
| 3 | Permissions | W2 (ScreenList + BackgroundLogic) | — |
| 4 | UserStories | W3 | — |
| 5 | FeatureList | W4 | — |
| 6 | FeatureSpec × F### | W5 | yes (fan-out) |
| 7a | Core artifact reviewer | W5 | yes (parallel with W6) |
| 7b | Feature spec reviewer (batched, 5/reviewer) | W6 | yes (batches parallel) |
| 7-merge | Combine review reports | W7a + W7b | — |
| 8 | Implementer + Re-reviewer (fix cycles, max 3, conditional) | W7-merge | — |
| 9 | Doc-writer (persist to docs/specs/) | W8 | — |

## Task chain pattern

```
// Wave 0
TaskCreate({ subject: "Scout: discovery scan",
  description: "Scan routing, data models, screens, bg logic, permissions. Detect project language from manifest (package.json → JS/TS; composer.json → PHP; Gemfile → Ruby; pyproject.toml → Python; pom.xml/build.gradle → Java; go.mod → Go; Cargo.toml → Rust). Scan all non-test, non-vendor source dirs relevant to the detected stack (e.g. pages/, views/, components/, features/, modules/ for JS/TS; app/Http/, resources/views/ for Laravel; app/controllers/, app/views/ for Rails; adapt accordingly). Multi-manifest rule: if multiple manifests coexist at root level (e.g. package.json + composer.json), the root-level manifest wins; priority order JS/TS > PHP > Ruby > Python > Java > Go > Rust if tied at same depth. Emit [MULTI_STACK] note in scout-report.md Notes section listing all detected stacks. Output MUST follow templates/scout-report-template.md. File Inventory is the contract for Wave 2 content-completeness and Wave 7 reviewer cross-validation — every source file must appear. After File Inventory: emit `## Background Logic Source Inventory` section. To do this: (1) read references/bl-source-patterns.md; (2) for Mode A stacks apply the folder-convention globs for the detected stack row; (3) for Mode B stacks apply the annotation/decorator grep markers from bl-source-patterns.md § Mode B Grep Markers; (4) emit one entry per file (Mode A) or per decorator hit (Mode B) sorted by category then path; (5) for any category with no matches emit `_(none found)_`; (6) for stacks/libraries not in the table use [SIGNAL_INFERRED] protocol (see bl-source-patterns.md § Signal Inference Fallback); (7) for [MULTI_STACK] projects emit one subsection per detected stack. Output: plans/<active-plan>/artifacts/scout-report.md" })

// Wave 1 — 3 tasks in parallel, each addBlockedBy: [scoutTaskId]
TaskCreate({ subject: "Wave1: system-overview",
  description: "Synthesize SystemOverview. Template: system-overview-template.md. Schema: references/code-formats.md. Draft: plans/<active-plan>/artifacts/system-overview.md",
  addBlockedBy: [scoutTaskId] })
TaskCreate({ subject: "Wave1: route-list",
  description: "Synthesize RouteList. Template: route-list-template.md. Draft: plans/<active-plan>/artifacts/route-list.md",
  addBlockedBy: [scoutTaskId] })
TaskCreate({ subject: "Wave1: data-model",
  description: "Synthesize DataModel. Template: data-model-template.md. Draft: plans/<active-plan>/artifacts/data-model.md",
  addBlockedBy: [scoutTaskId] })

// Extract detected stack from scout report (Wave 0 output, available at this point)
const scoutReportPath = `plans/<active-plan>/artifacts/scout-report.md`
const scoutContent = existsNonEmpty(scoutReportPath) ? readFile(scoutReportPath) : ''
const detectedLangMatch = scoutContent.match(/^## Detected Language\s*\n\s*(\S[^\n]*)/m)
const detectedStack = detectedLangMatch ? detectedLangMatch[1].trim() : 'JS/TS'
const isMultiStack = scoutContent.includes('[MULTI_STACK]')

// Enumerate every root-level manifest present so reviewer/researcher know exactly
// which stacks' signal rows to OR-merge in H-rule tables.
// Bare filenames are intentional — these manifests live at the repo root (CWD).
const manifestMap = {
  'package.json': 'JS/TS',
  'composer.json': 'PHP',
  'Gemfile': 'Ruby',
  'pyproject.toml': 'Python',
  'pom.xml': 'Java',
  'build.gradle': 'Java',
  'go.mod': 'Go',
  'Cargo.toml': 'Rust'
}
const uniqueFoundStacks = [...new Set(
  Object.entries(manifestMap)
    .filter(([file]) => existsNonEmpty(file))
    .map(([, stack]) => stack)
)]
let stackNote = detectedStack
if (isMultiStack) {
  stackNote = uniqueFoundStacks.length > 1
    ? `${detectedStack} [MULTI_STACK — all stacks: ${uniqueFoundStacks.join(', ')}; apply union of signals for all listed stacks in H-rule tables (consult each stack's row in every H-rule table; OR-merge signals before counting)]`
    : `${detectedStack} [MULTI_STACK — scout flagged multi-stack but root manifest scan found ${uniqueFoundStacks.length} stack(s); cannot enumerate union — emit [STACK_LIST_MISSING] advisory in classification justification per composite-screen-detection.md § Stack Probe]`
}

// Wave 2a — ScreenList runs first (its service-call inventory feeds BackgroundLogic)
TaskCreate({ subject: "Wave2: screen-list + screen-flow",
  description: `Generate ScreenList + ScreenFlow. Templates: screen-list-template.md, screen-flow-template.md. Drafts: plans/<active-plan>/artifacts/. Context: references/composite-screen-detection.md (H1-H6 rules — read this file before classifying any screen), references/verification-checklist.md (Composite Detection Rules + Failure Trap Assertions). Detected stack: ${stackNote} — pre-extracted from scout-report.md § ## Detected Language by the orchestrator; use this for per-stack signal selection in H-rule tables, do not re-read scout-report.md for stack detection. Route-first enumeration: Before applying H-rules, cross-reference the RouteList artifact (Wave 1, already complete). Map each distinct URL pattern to its page/component file. Each file serving a distinct URL path = one SCR candidate. Multiple URL patterns mapping to the SAME file = same SCR. Different files → separate SCR candidates. Then apply H1-H6 (full execution order: H6 → H4 → H5 → H2 → H3 → H1 → 2-of-3 gate) within each candidate. Apply composite-screen detection unconditionally to every screen file per references/composite-screen-detection.md. Import chain rule: if scout-report.md exists, use its flat file inventory to identify screen files (do not re-glob); if absent (e.g. --artifact entry point), emit [WARN] scout-report.md not found — skip content-completeness check and mark service coverage N/A. When scout-report exists: (1) resolve path aliases first (read tsconfig.json paths or package.json workspaces — unresolvable → treat as compliant, log [UNRESOLVED_ALIAS]); (2) follow imports one level deep using language-specific mechanism (ES6 import for JS/TS; use/require for PHP; require for Ruby; import for Python; import for Java/Kotlin/Go; use for Rust); (3) extract all service calls, API hooks, and helper functions in those immediate imports; (4) Known Limitation: barrel/re-export files (e.g. index.ts) re-exporting service modules at depth 2 are not followed — flag screens importing ONLY barrel files as [BARREL_IMPORT] advisory. The extracted service-call inventory is consumed by BackgroundLogic (Wave 2b) and confirms RouteList coverage.`,
  addBlockedBy: [routeListTaskId, dataModelTaskId] })

// Wave 2b — BackgroundLogic waits on ScreenList to consume its service-call inventory
TaskCreate({ subject: "Wave2: background-logic",
  description: "Generate BackgroundLogic. Template: background-logic-template.md. Schema: references/code-formats.md (canonical 10 BL types + Source File/Source Symbol field schema). Context: screen-list.md (service-call references extracted by Wave 2a). CARDINALITY CONTRACT (read template § Cardinality Contract before writing any BL item): (1) Read scout-report.md § Background Logic Source Inventory — this is the authoritative file list; (2) For each inventory entry emit exactly 1 BL item (Mode A: 1 file = 1 BL; Mode B: 1 decorator hit = 1 BL; multiple hits in same file = multiple BL items); (2a) Sentinel handling — entries shaped `- {category}: _(none found)_` (value field is the sentinel) are scout markers for empty categories; SKIP them, never emit a BL; (3) Set Source File = inventory entry path and Source Symbol = class or method name (single symbol only — see template Rule C2 for forbidden multi-symbol delimiters); (4) Aggregation is a critical violation — do NOT combine multiple source files into one BL item; (5) For per-stack signal context (what counts as each BL type per stack) read references/bl-source-patterns.md. Draft: plans/<active-plan>/artifacts/background-logic.md",
  addBlockedBy: [screenListAndFlowTaskId] })

// Wave 3
TaskCreate({ subject: "Wave3: permissions",
  description: "Generate Permissions. Template: permissions-template.md. Draft: plans/<active-plan>/artifacts/permissions.md",
  addBlockedBy: [screenListAndFlowTaskId, backgroundLogicTaskId] })

// Wave 4
TaskCreate({ subject: "Wave4: user-stories",
  description: `Generate UserStories. Template: user-stories-template.md. Draft: plans/<active-plan>/artifacts/user-stories.md.
Load: references/user-stories-ipe-protocol.md — run ALL IPE steps BEFORE writing any US.
Inputs: ScreenList (SCR### + source file paths), Permissions (actor split).`,
  addBlockedBy: [permissionsTaskId] })

// Wave 5
TaskCreate({ subject: "Wave5: feature-list",
  description: "Generate FeatureList from all prior drafts. Template: feature-list-template.md. Draft: plans/<active-plan>/artifacts/feature-list.md",
  addBlockedBy: [userStoriesTaskId] })
```

## Fan-out pattern (Wave 6)

After Fea
**Small codebases (F### count ≤ 20):** flat fan-out — one task per feature, all blocked on FeatureList.

```
// Collect task IDs for Wave 7 blocking
const allFeatureTaskIds = []

// Repeat for every F### found in plans/<active-plan>/artifacts/feature-list.md
const wave6TaskId = TaskCreate({ subject: "Wave6: feature-spec F001_Auth",
  description: `Generate DETAILED spec for F001_Auth.

CONTRACT: Read references/feature-spec-researcher-contract.md for mandatory rules.
TEMPLATE: feature-spec-template.md.
DRAFT: plans/<active-plan>/artifacts/features/F001_Auth/spec.md

CONTEXT LOADING (token-efficient — DO NOT load full artifacts):
1. Grep plans/<active-plan>/artifacts/feature-list.md for the F001 entry.
   Extract all referenced codes: US###, SCR###, ROUTE###, MODEL###, BL###, PERM###.
2. For each referenced code, Grep ONLY that code's section from its artifact:
   - US### → user-stories.md (heading ### US### … read until next ### US)
   - SCR### → screen-list.md (heading ### SCR### … read section)
   - BL### → background-logic.md (heading ### BL### … read section)
   - PERM### → permissions.md (heading ### PERM### … read section)
   - ROUTE### → route-list.md (grep the route entry row)
   - MODEL### → data-model.md (grep the entity entry)
3. Always read in full: system-overview.md (small, provides global context).
4. DO NOT read entire upstream artifacts — only the sections for codes in step 1.

SOURCE CODE: Use Grep/Read to find and read real controller(s), model(s), job(s),
service(s), policy(ies), and page files. Extract file paths, line ranges, method names,
table names, HTTP status codes, job class names, event names from actual code.

ALL TEMPLATE SECTIONS MANDATORY. DEPTH BAR enforced — see contract.`,
  addBlockedBy: [featureListTaskId] })
allFeatureTaskIds.push(wave6TaskId)
```

**Large codebases (F### count > 20):** batch of 10 features per dispatcher task — bounds peak context and gives reviewer intermediate checkpoints.

```
// Chunk F### list into groups of 10
const batches = chunk(fCodes, 10)  // [[F001..F010], [F011..F020], ...]

// Each batch gets a dispatcher task that spawns researcher per feature within it.
// Batches run sequentially to cap parallel subagent count; features within a batch run in parallel.
let prevBatchId = featureListTaskId
for (const [i, batch] of batches.entries()) {
  const batchTaskId = TaskCreate({
    subject: `Wave6.batch-${pad2(i+1)}: feature-specs (${batch[0]}..${batch.at(-1)})`,
    description: `Generate DETAILED specs for ${batch.length} features in parallel: ${batch.join(', ')}.
Apply the same rules as the small-codebase Wave 6 block above to EACH feature in this batch:
- Read researcher contract, use scoped context loading (Grep per-feature codes only), read real source code.

Contract: references/feature-spec-researcher-contract.md.
Template: feature-spec-template.md. Drafts: plans/<active-plan>/artifacts/features/<F###>/spec.md.
On batch completion, write plans/<active-plan>/artifacts/wave6-batch-${pad2(i+1)}.flag listing completed F###.`,
    addBlockedBy: [prevBatchId]
  })
  prevBatchId = batchTaskId
}
// Wave 7 reviewer blocks on the final batch (large codebase)
```

**Rationale:** orchestrator only holds batch-level task state in context at any time, not all N features.

## Review + fix cycle (Waves 7-9)

```
// review-report.md format — markdown body with YAML frontmatter:
//
// ---
// failed: <number>      # count of critical-severity issues (0 = all pass)
// warnings: <number>    # count of warning-severity issues
// result: PASS | FAIL   # PASS iff failed === 0
// ---
// (markdown body follows — use templates/review-report-template.md as base)
//
// Reviewer MUST start from templates/review-report-template.md and fill in all fields.
// Orchestrator reads ONLY the frontmatter to branch on failed count.

// parseFrontmatter: extract key-value pairs from YAML frontmatter block (--- delimiters)
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return {}
  return Object.fromEntries(
    match[1].split('\n')
      .filter(line => line.includes(':'))
      .map(line => { const [k, ...v] = line.split(':'); return [k.trim(), v.join(':').trim()] })
  )
}

// --- Wave 7a: Core artifact review (runs in PARALLEL with Wave 6) ---
// Blocks only on W5 (FeatureList), NOT on W6. Reviews the 9 core doc artifacts.
const w7aTaskId = TaskCreate({ subject: "Wave7a: core-artifact-review",
  description: `Review 9 core artifacts: system-overview, route-list, data-model, screen-list, screen-flow, background-logic, permissions, user-stories, feature-list.

Detected stack: ${stackNote} — when applying composite detection rules from verification-checklist.md, select per-stack signals from the row matching this stack value (see composite-screen-detection.md § Stack Probe).

CHECKLIST SECTION TARGETING — load ONLY these sections from references/verification-checklist.md:
- "## Universal rules"
- "### SystemOverview" through "### FeatureList" (all core artifact sections)
- "## Composite Detection Rules"
- "## Failure Trap Assertions"
SKIP the "### FeatureSpec" section entirely (handled by Wave 7b).

BACKGROUND LOGIC CARDINALITY CHECK — for the background-logic artifact: load scout-report.md § Background Logic Source Inventory, then apply all 4 rules from verification-checklist.md § BackgroundLogic "Cardinality Cross-Check" (total count gap per stack + MAX, category drop, Source File check, orphan file check). Emit the "### BackgroundLogic Cardinality" output block in the review report.

Use templates/review-report-template.md as base. Output: plans/<active-plan>/artifacts/core-review-report.md`,
  addBlockedBy: [featureListTaskId] })

// --- Wave 7b: Feature spec review (batched, runs after Wave 6) ---
// Blocks on ALL Wave 6 outputs, same as the old single-reviewer W7.
const wave7bBlockedBy = isLargeCodebase
  ? [prevBatchId]       // prevBatchId = ID of the last batch in the loop above
  : allFeatureTaskIds   // array populated during small-codebase fan-out

// Chunk feature specs into groups of 5 for bounded reviewer context
const reviewBatches = chunk(fCodes, 5)
const allW7bTaskIds = []

for (const [i, batch] of reviewBatches.entries()) {
  const w7bTaskId = TaskCreate({
    subject: `Wave7b.batch-${pad2(i+1)}: feature-spec-review (${batch[0]}..${batch.at(-1)})`,
    description: `Review ${batch.length} feature specs: ${batch.join(', ')}.

Detected stack: ${stackNote} — when validating composite-screen tags (REG/SCR variants) in feature specs, select per-stack signals from the row matching this stack value (see composite-screen-detection.md § Stack Probe).

CHECKLIST SECTION TARGETING — load ONLY these sections from references/verification-checklist.md:
- "## Universal rules"
- "### FeatureSpec" (feature spec rules only)
- "## Composite Detection Rules"
- "## Failure Trap Assertions"
SKIP all core artifact sections (SystemOverview through FeatureList — handled by Wave 7a).

For each spec, cross-ref against its F### entry in feature-list.md.
Use templates/review-report-template.md as base. Output: plans/<active-plan>/artifacts/feature-review-batch-${pad2(i+1)}.md`,
    addBlockedBy: wave7bBlockedBy
  })
  allW7bTaskIds.push(w7bTaskId)
}

// --- Wave 7-merge: Combine all review reports ---
const w7MergeTaskId = TaskCreate({ subject: "Wave7-merge: combine review reports",
  description: `Merge core-review-report.md + all feature-review-batch-*.md into a single review-report.md.
Sum failed/warnings counts across all reports. Set result = PASS iff combined failed === 0.
Use templates/review-report-template.md format with combined YAML frontmatter.
Output: plans/<active-plan>/artifacts/review-report.md`,
  addBlockedBy: [w7aTaskId, ...allW7bTaskIds] })

// After Wave 7-merge completes, read frontmatter to determine branch.
const reportContent = readFile("plans/<active-plan>/artifacts/review-report.md")
const report = parseFrontmatter(reportContent)
if (!report.result) throw new Error("review-report.md missing YAML frontmatter — reviewer must use review-report-template.md")
let currentFailed = parseInt(report.failed ?? 0)

const MAX_FIX_CYCLES = 3
let fixCycle = 0
let lastReviewTaskId = w7MergeTaskId

while (currentFailed > 0 && fixCycle < MAX_FIX_CYCLES) {
  fixCycle++

  const fixTaskId = TaskCreate({
    subject: `Wave8.cycle-${fixCycle}: implementer — fix issues`,
    description: `Fix cycle ${fixCycle}/${MAX_FIX_CYCLES}. Read review-report.md. Fix all artifacts listed under Critical Issues with status OPEN. Do NOT alter passing artifacts. Re-write fixed files in place.

Detected stack: ${stackNote} — when fixing composite-screen classifications (SCR/REG/H-tags), apply per-stack signals from the row matching this stack value (see composite-screen-detection.md § Stack Probe).`,
    addBlockedBy: [lastReviewTaskId]
  })

  // Re-run reviewer to verify fixes — scope checklist to affected artifact types only
  const reReviewTaskId = TaskCreate({
    subject: `Wave8.review-${fixCycle}: re-reviewer`,
    description: `Re-verify all drafts after fix cycle ${fixCycle}. Load references/verification-checklist.md sections:
- "## Universal rules" (always)
- ONLY the "### {ArtifactType}" sections for artifacts with OPEN critical issues in review-report.md
- "## Composite Detection Rules" and "## Failure Trap Assertions" (if any Screen/FeatureSpec affected)

Detected stack: ${stackNote} — when re-checking composite detection rules, select per-stack signals from the row matching this stack value (see composite-screen-detection.md § Stack Probe).

Overwrite plans/<active-plan>/artifacts/review-report.md with fresh content (frontmatter + markdown body using review-report-template.md).`,
    addBlockedBy: [fixTaskId]
  })

  // Re-read frontmatter after re-review completes
  const freshContent = readFile("plans/<active-plan>/artifacts/review-report.md")
  currentFailed = parseInt(parseFrontmatter(freshContent).failed ?? 0)
  lastReviewTaskId = reReviewTaskId
}

if (currentFailed > 0) {
  // Escalate — do NOT create Wave 9; leave drafts in artifacts/ for manual inspection
  throw new Error(`ESCALATE: ${currentFailed} artifacts still failing after ${MAX_FIX_CYCLES} fix cycles. Manual review required. Drafts preserved in plans/<active-plan>/artifacts/.`)
}

// Wave 9 — only reached when failed === 0
TaskCreate({ subject: "Wave9: doc-writer — persist",
  description: "Promote passing drafts from plans/<active-plan>/artifacts/ to docs/specs/. Feature specs → docs/specs/features/<F###>/spec.md. After promotion: (1) write plans/<active-plan>/artifacts/wave9-complete.flag listing promoted file paths + SHA; (2) call TaskUpdate on this task id with status=completed BEFORE returning — do not rely on orchestrator to mark done.",
  addBlockedBy: [lastReviewTaskId] })
```

## Reconcile pattern (run on every invocation)

Before dispatching any new wave, sync TaskList with disk. Closes tasks whose previous session died after the subagent wrote its output but before `TaskUpdate` fired.

```
// Mapping: task subject pattern → expected output path (relative to plans/<active>/artifacts/)
// null = not reconcilable (no single output file); skip in reconcile loop
const expectedOutput = {
  "Scout: discovery scan":            "scout-report.md",
  "Wave1: system-overview":           "system-overview.md",
  "Wave1: route-list":                "route-list.md",
  "Wave1: data-model":                "data-model.md",
  "Wave2: screen-list + screen-flow": ["screen-list.md", "screen-flow.md"],
  "Wave2: background-logic":          "background-logic.md",
  "Wave3: permissions":               "permissions.md",
  "Wave4: user-stories":              "user-stories.md",
  "Wave5: feature-list":              "feature-list.md",
  // Wave6 per-feature: "Wave6: feature-spec F###_Name" → features/F###_Name/spec.md
  // Wave6 batch:       "Wave6.batch-NN: ..." → wave6-batch-NN.flag
  "Wave7a: core-artifact-review":     "core-review-report.md",
  // Wave7b batch: "Wave7b.batch-NN: ..." → feature-review-batch-NN.md
  "Wave7-merge: combine review reports": "review-report.md",
  "Wave8.*":                          null,  // fix cycles: no single output file — skip auto-close
  "Wave8.review-*":                   null,  // re-reviewer tasks: same — skip auto-close
  "Wave9: doc-writer — persist":      "wave9-complete.flag"
}

// Explicit list of core doc artifacts for Wave 9 fallback check
// Update this list if new doc artifacts are added to the pipeline
const coreDocArtifacts = [
  "system-overview.md", "route-list.md", "data-model.md",
  "screen-list.md", "screen-flow.md", "background-logic.md",
  "permissions.md", "user-stories.md", "feature-list.md"
]

const rebuildTasks = TaskList({ filter: /^(Scout:|Wave\d|Wave6\.batch|Wave7[ab\-])/ })
for (const task of rebuildTasks.filter(t => t.status === "in_progress")) {
  const paths = resolveExpected(task.subject, expectedOutput)
  if (paths === null) continue  // Wave 8 tasks: not auto-closeable — require manual resolution

  const allExist = paths.every(p => existsNonEmpty(`plans/<active>/artifacts/${p}`)
                               && !containsPlaceholder(`plans/<active>/artifacts/${p}`))

  // Wave 9 stricter check: flag present OR all core docs promoted to docs/specs/
  const allCoreDocsPromoted = coreDocArtifacts.every(f => existsNonEmpty(`docs/specs/${f}`))
  const anyFeatureSpecPromoted = glob("docs/specs/features/*/spec.md").length > 0
  const wave9Ok = task.subject.startsWith("Wave9") &&
                  (existsNonEmpty("plans/<active>/artifacts/wave9-complete.flag")
                   || (allCoreDocsPromoted && anyFeatureSpecPromoted))

  if (allExist || wave9Ok) {
    TaskUpdate({ id: task.id, status: "completed",
                 note: "auto-reconciled from disk — output present, session likely died before TaskUpdate" })
  }
}
```

**With `--resume`:** run the block above, then STOP.
- Tasks closed: report subject + output path
- Tasks still `in_progress` AND output not yet written (STUCK): report as STUCK — user must manually reset to `pending` or `cancelled` before re-running without `--resume`
- Wave 8 tasks (`null` in map): always reported as STUCK if `in_progress` — cannot auto-close
- No new `TaskCreate` calls in resume mode

**Without `--resume` (default no-args):** run reconcile, then dispatch next pending wave.
- STUCK tasks (`in_progress`, no output) are left as-is — orchestrator does NOT re-create them to avoid duplicates
- If a task is STUCK, use `--resume` first to diagnose, then manually reset before re-running

## Artifact paths

| Stage | Draft path | Persistent path |
|-------|-----------|-----------------|
| Document artifacts | `plans/<active-plan>/artifacts/<name>.md` | `docs/specs/<name>.md` |
| Feature specs | `plans/<active-plan>/artifacts/features/<F###>/spec.md` | `docs/specs/features/<F###>/spec.md` |
| Core review report | `plans/<active-plan>/artifacts/core-review-report.md` | ephemeral (W7a output) |
| Feature review batches | `plans/<active-plan>/artifacts/feature-review-batch-NN.md` | ephemeral (W7b output) |
| Merged review report | `plans/<active-plan>/artifacts/review-report.md` | ephemeral (W7-merge output) |
| Wave 6 batch flags | `plans/<active-plan>/artifacts/wave6-batch-NN.flag` | ephemeral (reconcile signal) |
| Wave 9 completion flag | `plans/<active-plan>/artifacts/wave9-complete.flag` | ephemeral (reconcile signal + audit) |

Doc-writer (Wave 9) promotes drafts only after reviewer passes (`failed === 0`).

## Wave 9 completion flag format

`plans/<active>/artifacts/wave9-complete.flag` is the single source of truth that the pipeline finished. Plain text, one line per promoted file:

```
# Wave 9 complete — <ISO-8601 timestamp>
docs/specs/system-overview.md  <sha256>
docs/specs/route-list.md       <sha256>
docs/specs/data-model.md       <sha256>
docs/specs/screen-list.md      <sha256>
docs/specs/screen-flow.md      <sha256>
docs/specs/background-logic.md <sha256>
docs/specs/permissions.md      <sha256>
docs/specs/user-stories.md     <sha256>
docs/specs/feature-list.md     <sha256>
docs/specs/features/F001_Auth/spec.md <sha256>
...
```

SHA is recorded for audit trail only — reconcile does NOT verify SHA programmatically.
To manually verify integrity: `sha256sum -c wave9-complete.flag` (strip comment lines first).
