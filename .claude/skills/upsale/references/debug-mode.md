# Debug Mode

**Flag:** `--debug <module>` · **Loaded:** only when `--debug` appears in arguments.

Runs ONE Phase-A classifier in isolation for testing. Short-circuits the upsale pipeline:
no Phase B/C/D/E, no `combined-initial.md`, no `upsale-proposal.md`, no TaskCreate, no
reconcile preflight.

## Supported modules

| Module           | Step | Spec                                  | Output artifact                    |
|------------------|------|---------------------------------------|------------------------------------|
| `use-context`    | 2    | `references/use-context-classifier.md`| `plans/upsale/use-context.json`    |
| `SDD-detection`  | 1    | `references/sdd-detection.md`         | `plans/upsale/sdd-detection.json`  |

Module names are case-sensitive. Unknown module →
`BLOCKED — unknown debug module: <name>. Supported: use-context, SDD-detection`.

## Argument parsing

1. The token immediately after `--debug` is the module name. If absent →
   `BLOCKED — --debug requires a module name`.
2. Strip `--debug <module>` from arguments before further parsing. Anything else after
   stripping is ignored (debug does not consume `[focus-area or extra context]`).
3. Mutual exclusion — if any of `--force`, `--business-only`, `--technical-only` is also
   present → `BLOCKED — --debug cannot be combined with --force / --business-only / --technical-only`.

## Procedure

1. `mkdir -p plans/upsale`.
2. `rm -f <target artifact>` — debug always overwrites; do NOT respect the subagent's
   idempotency skip (that defeats the purpose of a debug probe).
3. Spawn ONLY that step's `Task(researcher)` per `references/orchestrator-protocol.md` →
   Phase A spawn template for the matching step (Step 1 or Step 2), verbatim. Do NOT spawn
   the other Phase A step, Step S, or any later phase. Do NOT call `TaskCreate`.
4. On subagent return, emit the response (see below) and stop.

## Response format

Emit exactly these lines, in order, no preamble:

```
debug: <module>
<subagent's done:/skip: line verbatim>
Saved: <absolute path to target artifact>
warn: debug result written to canonical cache path; rerun with `/tkm:upsale --force` before any production run to clear it (Step 2 / Step 1 idempotency would otherwise reuse this debug output verbatim)
Status: <subagent's Status verbatim>
```

The `warn:` line is the ONLY pipeline trailer debug emits — it exists because debug
overwrites `plans/upsale/use-context.json` / `plans/upsale/sdd-detection.json` (the
canonical production paths, not a debug-scoped path), so a subsequent non-debug
`/tkm:upsale` would silently reuse the debug output unless `--force` is passed. Skip every
other trailer used by the full pipeline (`use-context:`, `scout:`, `dedup:`,
`reclassify:`, `revise:`, `drop:`, `track:`, `force:`) — none apply.

## Why no TaskCreate / no reconcile

Debug is a one-shot probe with no downstream dependencies. TaskCreate exists for dep
enforcement + observability across the multi-step pipeline; a single isolated step
needs neither. Reconcile preflight closes stale `upsale: *` tasks from prior pipeline
runs — debug doesn't create any, so reconcile is irrelevant. Skipping both keeps the
debug path fast and side-effect-free against TaskList state.
