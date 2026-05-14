# Upsale — Flags

Load this reference when parsing CLI flags off the input. Full semantics live here so SKILL.md stays terse.

## Flag matrix

| Flag | Effect | Mutually-exclusive-with | Arg-strip | Log line(s) added |
|------|--------|-------------------------|-----------|-------------------|
| `--force` | Wipe `plans/upsale/` (entire tree incl. `validation/`) before Step 1. Also `TaskUpdate(status=deleted)` on every open `upsale: *` task before re-dispatch. | — (composes with `--*-only`); refused with `--debug` | strip token from args | `force: wiped plans/upsale/` as the very first response line |
| `--technical-only` | Skip business track unconditionally. Step 1 (SDD detection) is skipped entirely — no `sdd-detection.json` written, no log line. | `--business-only`, `--debug` | strip token | `track: technical-only` after the Step 2 line |
| `--business-only` | Skip technical track. Requires `isSDD == true` (abort with `BLOCKED — --business-only requires SDD repo` if Step 1 returns `isSDD: false`). | `--technical-only`, `--debug` | strip token | `track: business-only` after the Step 2 line |
| `--debug <module>` | Short-circuit pipeline to one Phase-A classifier. Supported modules: `use-context` (Step 2), `SDD-detection` (Step 1). Full wire-level contract in `references/debug-mode.md`. | `--force`, `--technical-only`, `--business-only` | see `references/debug-mode.md` | per `references/debug-mode.md` |

## Argument-strip rule

After parsing flags, strip the flag tokens (and `--debug`'s module argument) from the input before treating the remainder as `[focus-area or extra context]`. Flag order does not matter. `--force --technical-only focus on observability` and `focus on observability --force --technical-only` are equivalent.

## Defense in depth

- Reject paths containing `..`, absolute paths, or null bytes when applying `--force`'s wipe. The resolved path MUST be inside `plans/`.
- Refuse the combinations listed in the "Mutually-exclusive-with" column with `BLOCKED — <flag-a> and <flag-b> are mutually exclusive` (abort before Step 1).

## Cache safety

If a previous run produced the *other* track under `plans/upsale/`, a `--technical-only` or `--business-only` flag does NOT delete those artifacts. They are idempotent and useful if the user re-runs without the flag. Step 5a reads only the active track's proposal, so stale artifacts from the inactive track cannot leak into output.

## Phase C behavior under single-track flags

Step 5b still runs to flip the dedup marker from `<!-- dedup: pending -->` to `<!-- dedup: applied (n=0) -->` — but the cross-track Pass 1 is a natural no-op (no other track to merge against), and Pass 2 (Reclassify) is largely inert with one section. Phase D spawns one validator per item from the single active track. Step 5a's `track gating` table:

| Flag state | tracks set | Step 5a `Inputs` |
|------------|------------|-------------------|
| `--technical-only` | `["technical"]` | omit `business_path` |
| `--business-only` | `["business"]` | omit `technical_path` |
| default + `isSDD == true` | `["technical", "business"]` | both paths |
| default + `isSDD == false` | `["technical"]` | omit `business_path` |
