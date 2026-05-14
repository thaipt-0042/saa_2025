# Improvement Aspect: {ASPECT_TITLE} — {PRODUCT_NAME}
**Use context:** {internal|hybrid|customer-facing}
<!-- REQUIRED: copy verbatim from source 02-improvement/<NN>-<slug>.md line 2. Do NOT re-classify. -->

<!-- Per-aspect deduped output. Same shape as source 02-improvement/<NN>-<slug>.md — non-merged entries first (original order), then merged entries appended at the END (one per merge group, in source-first-appearance order). Empty source aspect or sole `clean` entry → verbatim pass-through. -->

{entries — see Entry format below}

---

## Entry format

```markdown
- Status: {opportunity | clean — no current gap | clean — spec-excluded}
- Category: {aspect-id from source — MUST match source file's slug; preserved verbatim across dedup}
- Observation: {1-2 sentences; for merged entries, names every target/scope}
- Evidence: {union of merged entries' Evidence; never fabricate; cite path:line / package / vendor as in source}
- Potential improvement: {1-3 sentences; for merged entries, may enumerate per-target sub-steps}
- Customer-value signal: {categorical tag — vocabulary in source reference; for merged entries, deduplicated union}
- Value: {high | medium | low — max(values) for merged entries}
- Effort hint: {low | medium | high — max(efforts), bumped for ≥3-member merges with broadened scope}
- Risk if untouched: {union of merged risks; collapse duplicate phrasing}
- Commercial hook: {one sentence; for merged entries, captures the consolidated commercial argument}
```

<!-- Total length under 200 lines. No prioritization — Step 4.3 handles selection. Per-aspect dedup is intra-file only; cross-aspect duplicates survive into Step 5b cross-track dedup. -->
