# Upsale Skill — Pipeline Flow

ASCII visualization of the current `/tkm:upsale` pipeline. See `SKILL.md` for the
authoritative spec and `references/` for per-step procedures.

```
                       ┌───────────────────────────┐
                       │  /tkm:upsale invoked (CWD) │
                       │  Preflight: project? PII? │
                       └─────────────┬─────────────┘
                                     │
                                     ▼
╔══════════════════════════════════════════════════════════════════════╗
║ PHASE A — Repo classification (parallel · researcher × 2 + /tkm:scan-codebase)║
╠══════════════════════════════════════════════════════════════════════╣
║   ┌───────────┐    ┌──────────────────┐    ┌─────────────────────┐   ║
║   │ Step 1  T1│    │ Step 2        T2 │    │ Step S           TS │   ║
║   │ SDD       │    │ Use-context      │    │ /tkm:scan-codebase fan-out   │   ║
║   │ detection │    │ classifier       │    │ (parallel Explore)  │   ║
║   └─────┬─────┘    └────────┬─────────┘    └──────────┬──────────┘   ║
║         ▼                   ▼                         ▼              ║
║  sdd-detection.json    use-context.json        scout-report.md       ║
╚════════╤══════════════════╤═════════════════════════╤════════════════╝
         │                  │ gates every step        │ shared inventory
         │                  ▼                         │
         │       ┌────────────────────┐               │
         │  YES  │ isSDD == true ?    │  NO           │
         ├──────►│                    ├──────┐        │
         │       └─────────┬──────────┘      │        │
         │                 │ both tracks     │ tech-only
         ▼                 ▼                 ▼        ▼
╔══════════════════════════════════════════════════════════════════════╗
║ PHASE B-discovery — Per-item fan-out (researcher × ≤10 concurrent)   ║
╠══════════════════════════════════════════════════════════════════════╣
║   BUSINESS DISCOVERY (SDD only)      TECHNICAL DISCOVERY (always)    ║
║   3.1.01–3.1.09 [T3.1.NN]            4.1.01–4.1.08 [T4.1.NN]         ║
║   ┌──────────────────────┐           ┌──────────────────────┐        ║
║   │ product-identity     │           │ repository-identity  │        ║
║   │ target-users         │           │ tech-stack           │        ║
║   │ value-proposition    │           │ architecture-shape   │        ║
║   │ feature-inventory    │           │ delivery-operations  │        ║
║   │ user-journeys        │           │ scale-complexity     │        ║
║   │ monetization-model   │           │ security-compliance  │        ║
║   │ success-metrics      │           │ product-surface      │        ║
║   │ compliance-          │           │ platform-support     │        ║
║   │ constraints          │           └──────────────────────┘        ║
║   │ known-gaps           │                                            ║
║   └──────────┬───────────┘                      │                    ║
║              ▼                                  ▼                    ║
║   business/01-discovery/<NN>-<slug>.md   technical/01-discovery/…    ║
║   (orchestrator dispatches in batches of ≤10 across both tracks)     ║
╠══════════════════════════════════════════════════════════════════════╣
║ PHASE B-research — Per-section fan-out (biz only · researcher × ≤10) ║
╠══════════════════════════════════════════════════════════════════════╣
║   3.2.01–3.2.05 (wave 1, parallel)    [T3.2.NN]                      ║
║   ┌──────────────────────┐                                           ║
║   │ market-snapshot      │                                           ║
║   │ competitor-scan      │                                           ║
║   │ persona-deep-dive    │                                           ║
║   │ domain-regulatory…   │                                           ║
║   │ pricing-packaging…   │                                           ║
║   └──────────┬───────────┘                                           ║
║              ▼                                                       ║
║   3.2.06 (wave 2 · depends on wave 1)                                ║
║   ┌──────────────────────┐                                           ║
║   │ gap-summary          │                                           ║
║   └──────────┬───────────┘                                           ║
║              ▼                                                       ║
║   business/02-research/<NN>-<slug>.md                                ║
╠══════════════════════════════════════════════════════════════════════╣
║ PHASE B-improvement — Per-aspect fan-out (researcher × ≤10 globally) ║
╠══════════════════════════════════════════════════════════════════════╣
║   BUSINESS IMPROVEMENT (SDD only)    TECHNICAL IMPROVEMENT (always)  ║
║   3.3.01–3.3.12 [T3.3.NN]            4.2.01–4.2.14 [T4.2.NN]         ║
║   ┌──────────────────────┐           ┌──────────────────────┐        ║
║   │ spec-goal-alignment  │           │ architecture         │        ║
║   │ feature-coverage     │           │ code-quality         │        ║
║   │ ux-gaps              │           │ test-coverage        │        ║
║   │ conversion-retention │           │ ci-cd                │        ║
║   │ time-to-market       │           │ performance          │        ║
║   │ competitive-posit.   │           │ security-and-deps    │        ║
║   │ compliance           │           │ observability        │        ║
║   │ growth-and-distr.    │           │ docs-and-dx          │        ║
║   │ pricing-monetization │           │ error-handling       │        ║
║   │ analytics-instrum.   │           │ scalability          │        ║
║   │ customer-support     │           │ accessibility        │        ║
║   │ new-features         │           │ new-features         │        ║
║   └──────────┬───────────┘           │ ecosystem-parity     │        ║
║              ▼                       │ platform-parity      │        ║
║   business/03-improvement/…          └──────────┬───────────┘        ║
║                                                 ▼                    ║
║                                      technical/02-improvement/…      ║
╠══════════════════════════════════════════════════════════════════════╣
║ PHASE B-track-proposal — Track proposal (parallel tracks · ≤2)       ║
╠══════════════════════════════════════════════════════════════════════╣
║   3.4 Biz proposal [T3.4]            4.3 Tech proposal [T4.3]        ║
║   ┌────────────────────────┐         ┌────────────────────────┐      ║
║   │ select + aspect group  │         │ select + aspect group  │      ║
║   │ from 03-improvement/   │         │ from 02-improvement/   │      ║
║   └──────────┬─────────────┘         └──────────┬─────────────┘      ║
║              ▼                                  ▼                    ║
║   business/04-business-proposal.md   technical/03-technical-prop.md  ║
╚══════════════╤═══════════════════════════════════╤═══════════════════╝
               │                                   │
               └─────────────────┬─────────────────┘
                                 ▼
╔══════════════════════════════════════════════════════════════════════╗
║ PHASE C — Combine (sequential)                                       ║
╠══════════════════════════════════════════════════════════════════════╣
║   ┌────────────────────────┐                                         ║
║   │ 5a  Combine proposals  │  script (combine_proposals.py)    [T5a] ║
║   │     (merge biz + tech) │                                         ║
║   └───────────┬────────────┘                                         ║
║               ▼                                                      ║
║      combined-initial.md                                             ║
║               │                                                      ║
║               ▼                                                      ║
║   ┌────────────────────────┐                                         ║
║   │ 5b  Dedup + reclassify │  reviewer                          [T5b] ║
║   │     (full-scope: intra-│  (always runs — flips marker to        ║
║   │      aspect + cross-   │   `applied (n=N)`)                      ║
║   │      aspect intra-track│                                          ║
║   │      + cross-track)    │                                          ║
║   └────────┬───────────────┘                                         ║
║            ▼                                                         ║
║    combined-initial.md (rewritten · marker `dedup: applied (n=N)`)   ║
╠══════════════════════════════════════════════════════════════════════╣
║ PHASE C-prep — Phase D pre-extraction dispatcher (sequential)        ║
╠══════════════════════════════════════════════════════════════════════╣
║   ┌────────────────────────┐                                         ║
║   │ 5c  Phase-D-prep       │  script (phase_d_prep.py)          [T5c] ║
║   │     dispatcher         │  reads combined + each track's           ║
║   │                        │  improvement dir + discovery files       ║
║   └────────┬───────────────┘                                         ║
║            ▼                                                         ║
║   validation/_payloads/item-NN-<slug>.json  (per-item payload × N)   ║
║   validation/_payloads/_manifest.json       (atomic completion)      ║
╚════════════╤═════════════════════════════════════════════════════════╝
                ▼
╔══════════════════════════════════════════════════════════════════════╗
║ PHASE D — Validate (parallel per item · reviewer × N · batched ≤10)  ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║   ┌──────────────────────────────────────────────────────────┐       ║
║   │ 6.<NN>-<slug> Validator (one per item) [T6.NN]           │       ║
║   │   Read({payload_path}) → load item + evidence + stack    │       ║
║   │   Holistic gate: evaluate whole item                     │       ║
║   │     fail → DROP, skip checks 2–6                         │       ║
║   │     else → checks 2–6 → KEEP/REVISE/DROP                 │       ║
║   └────────────────────────┬─────────────────────────────────┘       ║
║                            ▼                                         ║
║       validation/item-NN-<slug>.md  (KEEP / REVISE / DROP)           ║
╚════════════════════════════╤═════════════════════════════════════════╝
                             ▼
╔══════════════════════════════════════════════════════════════════════╗
║ PHASE E — Apply verdicts (sequential · researcher)                   ║
╠══════════════════════════════════════════════════════════════════════╣
║   ┌────────────────────────────────────────────────────────────┐     ║
║   │ 7  Apply verdicts:                                    [T7] │     ║
║   │      KEEP   → carry over                                   │     ║
║   │      REVISE → rewrite per verdict body (else KEEP+warn)    │     ║
║   │      DROP   → remove + drop:line                           │     ║
║   │      slug mismatch → KEEP + warn                           │     ║
║   │      then rollup recompute + within-aspect sort            │     ║
║   │        (Value desc, Effort asc, doc order tiebreak)        │     ║
║   │      (subagent self-closes T7 before returning)            │     ║
║   └─────────────────────────┬──────────────────────────────────┘     ║
║                             ▼                                        ║
║                  upsale-proposal.md   ◄── final customer-ready       ║
╚══════════════════════════════════════════════════════════════════════╝
                              │
                              ▼
                 ┌────────────────────────────┐
                 │ Response trailer:          │
                 │  skip:/done: log lines     │
                 │  use-context, scout, dedup │
                 │  revise:/drop:/warn:       │
                 │  Saved: <abs path>         │
                 │  Status: DONE | DWC        │
                 └────────────────────────────┘
```

## Cross-cutting rules

```
Idempotency:   each step skips if its output exists & non-empty
Step-input:    each step reads ONLY prev step's artifact (same track)
               + use-context.json + scout-report.md (discovery 3.1.NN/4.1.NN)
               + 01-discovery/ DIR union (research 3.2.NN, tech improvement 4.2.NN)
               + 02-research/ DIR union (biz improvement 3.3.NN)
               + 03-improvement/ DIR union (biz proposal 3.4)
               + 02-improvement/ DIR union (tech proposal 4.3)
               + 04-business-proposal.md + 03-technical-proposal.md (combine 5a)
Force regen:   delete artifact at desired step
               (delete combined-initial.md ⇒ ALSO delete validation/
                — includes _payloads/ AND per-item verdicts;
                step-5c rebuilds manifest on sha256 mismatch)
Gating:        use-context (internal | hybrid | customer-facing)
               applied per-aspect during fan-out
```

## TaskList integration

```
[T#] markers above key each box to a TaskCreate({subject: "upsale: step-X ..."})
in the orchestrator dep graph. Dependencies (addBlockedBy) follow phase arrows
in the diagram: T3.1.NN ⇐ T1+T2+TS, T4.1.NN ⇐ T2+TS,
T3.2.01..05 ⇐ all T3.1.*, T3.2.06 ⇐ T3.2.01..05,
T3.3.NN ⇐ all T3.2.*, T4.2.NN ⇐ all T4.1.*,
T3.4 ⇐ all T3.3.*, T4.3 ⇐ all T4.2.*,
T5a ⇐ T3.4+T4.3, T5b ⇐ T5a, T5c ⇐ T5b (single dispatcher),
T6.<NN> ⇐ T5c (one per item, ≤10 concurrent), T7 ⇐ all T6.<NN>.

Reconcile preflight runs first on every invocation: closes any in_progress
upsale: * task whose declared output is already on disk. T7 self-closes via
TaskUpdate(completed) before returning, so the terminal step lands closed even
if the orchestrator dies before emitting the final response.

See SKILL.md → Task management and references/orchestrator-protocol.md →
Pipeline tasks / Reconcile preflight for full spec.
```

## Degradation paths

```
Step 1 BLOCKED  → fallback {isSDD:false} → tech-only flow
Step 2 BLOCKED  → fallback {useContext:"hybrid", confidence:"low"}
Step S BLOCKED  → /tkm:scan-codebase unavailable → Bash find fallback walk
                  ([SCOUT_FALLBACK] noted in scout-report ## Notes);
                  if that also fails, placeholder scout-report
                  ([SCOUT_BLOCKED] noted in ## Notes) → tracks fallback to direct grep
Item BLOCKED    → continue rest of batch; downstream phase notes missing
                  items and proceeds with partial directory union
All items BLK   → escalate → BLOCKED: all <discovery|research|aspects> missing
Wave 1 fully BLK → skip wave 2 (gap-summary) + biz improvement + biz proposal
Track BLOCKED   → Phase C still runs if technical exists
Both empty      → 5c writes empty manifest → skip Phase D
5c BLOCKED      → orchestrator falls back to inline pre-extraction (writes
                  same payload + manifest files) → Phase D proceeds normally,
                  status DONE_WITH_CONCERNS
Validator BLK   → missing verdicts → KEEP + ⚠ banner
Dedup 5b BLK    → marker stays `pending` → Step 5c BLOCKED (cannot proceed)
```
