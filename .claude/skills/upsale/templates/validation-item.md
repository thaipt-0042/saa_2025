# Validation Verdict — Per-Item Output Template

<!-- One file per item under `plans/upsale/validation/item-<NN>-<slug>.md`.
     Written by the per-item validator subagent (Phase D, Step 6 — one subagent per item, batched ≤10) atomically via
     Bash + tempfile + rename. Consumed by the Step 7 apply subagent
     (`references/apply-validations.md`) which parses frontmatter `decision:` to
     apply KEEP/REVISE/DROP. -->

## File naming

`plans/upsale/validation/item-{NN}-{kebab-slug}.md`

- `{NN}` — zero-padded 1-based item index in document order (Technical first, then Business).
- `{kebab-slug}` — lower-case kebab slug derived from the item title.

## File body (REQUIRED structure)

```markdown
---
item_index: {N}
item_slug: {kebab-slug}
track: {technical | business}
decision: {KEEP | REVISE | DROP}
---

# Audits

- **Clause:** {atomic claim verbatim or tightly paraphrased from the item's `**Need:**` bullet — one bullet per claim, covering every distinct assertion in Need}
  - **Evidence:** {what was checked to verify this specific claim; cite the supporting `path:line` from `item_evidence` or repo grep, or state "not found in `item_evidence`; repo grep on `<pattern>` returned no match" when the claim is unsupportable}
  - **Verdict:** {correct | wrong}
- **Clause:** {next Need claim}
  - **Evidence:** …
  - **Verdict:** {correct | wrong}

# Reason

{1-3 sentences citing check number(s) (1–6 from validation.md) and the specific claim that failed or was corrected.}

# Revised item

{Omit this entire `# Revised item` block when decision is KEEP or DROP.
 When decision is REVISE, emit the FULL revised item starting with `## <title>`,
 followed by the five bullets in order: Value, Need, Benefits, Proposed solution, Effort hint.
 `**Category:**` is NOT part of the schema — apply rejects bodies that include it (KEEP fallback).
 Schema MUST be preserved exactly — no extra headings, no extra bullets.}
```

## Frontmatter rules

- `item_index` — integer, matches the 1-based position assigned by the orchestrator.
- `item_slug` — kebab-case, must match the `{slug}` in the file name.
- `track` — `technical` or `business` (lower-case).
- `decision` — `KEEP` | `REVISE` | `DROP` (case-insensitive — the apply subagent accepts both `keep` and `KEEP`).

## Audits block rules

**Scope:** Audits cover ONLY the item's `**Need:**` bullet. Other bullets (Value, Benefits, Proposed solution, Effort hint) are NOT audited here — their verdicts are summarised in `# Reason` by citing the relevant check number from `references/validation.md`.

- Decompose the `**Need:**` bullet into atomic claims and emit ONE audit bullet per claim, in the order they appear in Need.
- A "claim" is an independently verifiable assertion: a `path:line` citation, a file path, a dependency `package@version`, a CVE/GHSA/RUSTSEC advisory ID, a route, a spec ID, a named metric/threshold ("p95 850 ms"), or a behavior assertion ("no rate limiter detected in middleware chain"). Split on `;`, `.`, and conjunctions when each fragment carries an independently checkable assertion.
- Each audit bullet has exactly three nested sub-bullets in this order: `**Clause:**`, `**Evidence:**`, `**Verdict:**`.
- `**Clause:**` — the atomic claim, verbatim from Need where possible, lightly trimmed for readability (preserve every `path:line` / version / ID / metric exactly as written so the verdict's audit trail stays grep-able).
- `**Evidence:**` — what was inspected to verify the claim, with the supporting `path:line` citation from `item_evidence` or the repo. When the claim cannot be verified, name the search performed and its negative result (e.g., `not found in item_evidence; ripgrep on "rate-limit" across src/api/ returned 0 hits`). No prose-only justifications.
- `**Verdict:**` — exactly `correct` (claim verified against the cited evidence) or `wrong` (claim is unsupportable, the citation is stale/fabricated, the version/ID does not match the lockfile, the metric is not present in the discovery snapshot, etc.).
- If `**Need:**` is missing or empty: emit a single audit bullet with `**Clause:** (Need bullet absent or empty)`, `**Evidence:** schema requires Need bullet; not found in `item_markdown``, `**Verdict:** wrong`.
- Always emit `# Audits` — even on `DROP`. Even when every claim is `correct`, emit the audits to document what was checked.
- `# Audits` is informational — the Step 7 apply subagent does not parse it; the `decision:` frontmatter remains the single source of truth for KEEP/REVISE/DROP. The block exists for human review of why each Need claim held up or failed.

## Decision semantics

The `decision:` frontmatter is determined by the full check 1–6 procedure in `references/validation.md` §Decision rules, NOT by the audits block alone. Audits reflect Need-claim verification only; Value/Use-context/Benefits/Security/Formatting verdicts live in `# Reason`.

| decision | When to emit | `# Revised item` required? | apply-subagent effect |
|----------|--------------|----------------------------|------------------------------|
| `KEEP`   | Every check 1–6 passes (Need audits may all be `correct`, or `wrong` Need claims have been fixed inline at proposal-write time — rare) | NO | Item kept as-is in final proposal |
| `REVISE` | At least one check fired with a recoverable fix (typical: one or more Need claims `wrong` but a closest supportable citation exists, OR Value/Benefits/Use-context issue) | YES — full revised item | Item replaced with revised body |
| `DROP`   | At least one check fired with no recoverable fix (typical: every Need claim `wrong` with no supportable replacement, OR holistic-gate incoherence, OR use-context filter fired) | NO | Item removed; `drop:` log line emitted |

## Validation checks (1–6 from `references/validation.md`)

1. **Holistic proposal evaluation — GATE** (evaluate the whole item end-to-end against the prompt "Here is a product improvement proposal. Evaluate it: \<item\>"; subsumes Need correctness + Proposed-solution fit; DROP short-circuits checks 2–6)
2. Value rating defensibility (`high` / `medium` justified)
3. Use-context consistency (gating rules per `internal | hybrid | customer-facing`)
4. Benefits concreteness (real signal, not generic marketing copy)
5. Security & hallucination guard (no secrets, no invented citations)
6. Formatting preservation (schema intact)

## Revise body example

```markdown
---
item_index: 3
item_slug: introduce-edge-rate-limiter
track: technical
decision: REVISE
---

# Audits

- **Clause:** p95 latency 850ms at the `/api/search` route under burst load (`technical/01-discovery/05-scale-complexity.md`)
  - **Evidence:** `technical/01-discovery/05-scale-complexity.md:18` records `p95 = 850 ms on /api/search at peak burst (k6 run 2026-04-30)`.
  - **Verdict:** correct
- **Clause:** no rate limiter detected in middleware chain
  - **Evidence:** ripgrep on `rate.?limit|throttl|bucket` across `src/api/middleware/` returned 0 hits; `src/api/middleware/index.ts:1-44` registers only auth + logging.
  - **Verdict:** correct
- **Clause:** stale path `src/api/old-middleware.ts:42`
  - **Evidence:** `src/api/old-middleware.ts` does not exist in the current tree (`git ls-files` returns nothing matching); closest live file is `src/api/middleware/index.ts`.
  - **Verdict:** wrong

# Reason

Check 1 (holistic) — item is coherent and the latency Need is evidenced, but the citation
to `src/api/old-middleware.ts:42` is stale; closest supportable file is
`src/api/middleware/index.ts`. Check 2 (Value rating defensibility) downgraded `high` →
`medium` per the discovery snapshot's reliability-only signal (no revenue/incident anchor).
Need rewritten to drop the stale path and keep the live p95-latency citation.

# Revised item

## Introduce edge rate limiter

- **Value:** medium
- **Need:** p95 latency 850ms at the `/api/search` route under burst load (`technical/01-discovery/05-scale-complexity.md`); no rate limiter detected in middleware chain.
- **Benefits:** Reliability — predictable latency under load; cost — fewer wasted compute cycles serving abusive clients.
- **Proposed solution:** Introduce a Redis-backed token-bucket rate limiter in `src/api/middleware/rate-limit.ts` keyed on IP + route prefix; default 60 req/min/IP, configurable via env.
- **Effort hint:** medium
```

## Atomic write recipe

The validator MUST write each verdict file atomically via Bash + tempfile + rename. The Write
tool is NOT atomic, and a half-written verdict whose frontmatter parses but body is truncated
would silently mis-apply on the next idempotent run. See `references/validation.md` → "Output
format" for the exact `cat > "$TMP" <<'__UPSALE_VERDICT_END__' … mv "$TMP" '<output_path>'`
recipe.
