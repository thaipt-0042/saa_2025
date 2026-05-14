# Upsale — Edge Cases

Load this reference whenever a step returns non-DONE. Each entry: trigger → action → log/status.

## Step 1 — SDD detection BLOCKED

Write fallback `{"isSDD": false, "signals": [], "specsRoot": ""}`. Status: `DONE_WITH_CONCERNS — sdd-detection fallback`. (Not reachable under `--technical-only` — Step 1 is skipped, not cached.)

## Step 2 — Use-context classifier BLOCKED

Write fallback `{"useContext": "hybrid", "confidence": "low", "signals": [], "reason": "classifier blocked — inclusive default"}`. Status: `DONE_WITH_CONCERNS — classifier fallback`.

## Step S — Scout BLOCKED (tkm:scan-codebase unavailable / Explore timeout / empty fan-out)

1. Orchestrator falls back to direct repo walk via Bash `find` (skip rules per `references/scout-discovery.md`). Write `scout-report.md` with `[SCOUT_FALLBACK]` in `## Notes`. Status: `DONE_WITH_CONCERNS — tkm:scan-codebase fallback`.
2. If the fallback walk ALSO fails → write placeholder (`Detected Language: unknown`, empty `## Relevant Files`, `[SCOUT_BLOCKED]` in `## Notes`). Both tracks degrade to direct repo grep. Status: `DONE_WITH_CONCERNS — scout fallback`.

## Discovery / research / improvement / aspect-dedup — single item BLOCKED

Continue with the rest of the batch. Downstream phase logs `(item <NN>-<slug> missing — track degraded)` and proceeds with the partial directory union.

## Discovery / improvement / aspect-dedup — all items in a track BLOCKED

`BLOCKED — all <step-name> outputs missing for <track>`. That track's proposal is not produced.

**Per-aspect-dedup specific:** the source aspect file under `*-improvement/` is preserved verbatim, but the deduped sibling under `0X1-deduped-improvement/` is missing. Track proposal does NOT fall back to the upstream source on per-item basis (mixing source + deduped would break Phase D aspect-id evidence pre-extraction) — it proceeds only with the surviving deduped union.

## Wave-1 research partial BLOCKED

`06-gap-summary` requires all 5 wave-1 inputs and BLOCKs if any are missing/empty. Dep graph then keeps every Phase B-improvement (business) item blocked on `step-3.2.06` — a single wave-1 failure silently skips the entire business improvement + track-proposal + combine business-section. Status: `DONE_WITH_CONCERNS — business research wave 1 partially blocked (N/5 items failed)`. Idempotent rerun retries only the blocked items.

## Track-proposal subagent BLOCKED (3.4 or 4.3)

Phase C still runs as long as at least one active-track proposal exists; the absent track's section is omitted from `combined-initial.md`. Step 5b still runs (cross-track pass is a no-op when one section is absent; marker flips to `applied (n=0)`). Status: `DONE_WITH_CONCERNS — <track> blocked: <reason>`. Under `--business-only` / `--technical-only`, the blocked active track escalates to `BLOCKED — <track> required by flag`.

## Flag refusals

- `--business-only` on non-SDD repo → `BLOCKED — --business-only requires SDD repo` after Step 1.
- `--business-only` + `--technical-only` → `BLOCKED — flags mutually exclusive`, abort before Step 1.
- `--debug` combined with `--force` / `--business-only` / `--technical-only` → `BLOCKED — --debug is mutually exclusive with --force / --*-only`.

## Use-context divergence (Step 5a)

When both tracks are active and their `**Use context:**` markers disagree, the combiner emits `warn: step-5a use-context divergence — technical=<X>, business=<Y>`. Status: `DONE_WITH_CONCERNS`.

## Both tracks empty after combine

Step 5c writes empty-items manifest (`"items": []`). Phase D skipped entirely (`skip: step-6 (no items to validate)`). Step 7 still runs but writes a minimal proposal with the `⚠️ no items` banner.

## Step 5c phase-d-prep BLOCKED

Orchestrator falls back to inline pre-extraction (writes same payload JSONs + manifest to disk per `references/phase-d-prep.md` § Inline-fallback mode). Phase D proceeds normally. Status: `DONE_WITH_CONCERNS — phase-d-prep blocked, ran inline pre-extraction`. Output byte-identical to the non-degraded path.

## Step 5c manifest stale

`combined-initial.md` changed since manifest was written, detected via `combined_md_sha256` mismatch. Dispatcher rebuilds payloads from scratch; emits `warn: step-5c stale manifest (combined-initial.md changed) — rebuilt payloads`.

## Validator payload schema unsupported

Per-item validator BLOCKs hard with `BLOCKED — payload schema_version=<X> unsupported (expected 1)`. Treated as Validator BLOCKED (next entry).

## Validator BLOCKED or partial

Apply (Step 7) defaults missing verdicts to `KEEP`, emits in-file ⚠️ banner counting unvalidated items.

## Step 5b cross-track dedup BLOCKED

Proceed with the un-cross-track-deduped file (per-aspect dedup outputs are still in place). Emit `warn: dedup agent blocked — skipped cross-track dedup`.

## Apply (Step 7) — verdict edge cases

- **Slug mismatch** (regenerated combined with stale verdicts) → KEEP + `warn:`. Pre-empt by deleting the whole `validation/` tree (incl. `_payloads/`) whenever you delete `combined-initial.md`.
- **REVISE without body** → KEEP + `warn:`.
- **DROP** → remove the item + `drop:` line.

## Session context exhausted mid-pipeline

`upsale: *` tasks may stay `in_progress` despite their artifact being on disk. Next invocation runs **reconcile preflight** (see `references/orchestrator-protocol.md` § Reconcile preflight) to close them; artifact-path idempotency then skips already-completed steps. Step 7 self-closes (calls `TaskUpdate(status=completed)` on its own task ID before returning) to minimise orchestrator-liveness dependency.
