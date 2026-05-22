# Incremental State Schema

Two committed JSON files anchor incremental mode. Both live under `docs/specs/` so they survive plan archival and are git-collaborative.

## `.rebuild-state.json`

```json
{
  "last_rebuild_sha": "abc123def456...",
  "rebuilt_at": "2026-05-20T08:30:00Z",
  "mode": "full|incremental",
  "fcode_index_sha": "sha256-hex-of-canonical-index-json",
  "doc_shas": {
    "route-list.md": "<sha256-hex>",
    "data-model.md": "<sha256-hex>",
    "screen-list.md": "<sha256-hex>",
    "screen-flow.md": "<sha256-hex>",
    "background-logic.md": "<sha256-hex>",
    "permissions.md": "<sha256-hex>",
    "user-stories.md": "<sha256-hex>",
    "feature-list.md": "<sha256-hex>"
  }
}
```

| Field | Type | Semantics |
|-------|------|-----------|
| `last_rebuild_sha` | string | `git rev-parse HEAD` at emit time. Can be set explicitly via `--last-rebuild-sha` during bootstrap-from-git flow (Wave -2); otherwise derives from `git rev-parse HEAD`. |
| `rebuilt_at` | string | ISO-8601 UTC timestamp |
| `mode` | string | `"full"` or `"incremental"` — the mode of the run that wrote this file |
| `fcode_index_sha` | string | SHA-256 hex digest of the canonical `_source-to-fcode.json` content |
| `doc_shas` | object | `{ "<artifact>.md": "<sha256-hex>" }` — snapshot of promoted core docs at last rebuild; absent on first run |

## `_source-to-fcode.json`

```json
{
  "generated_at": "2026-05-20T08:30:00Z",
  "index": {
    "api/app/Http/Controllers/SurveyController.php": ["F001", "F005"],
    "web/src/pages/SurveyCreate.vue": ["F005"]
  }
}
```

| Field | Type | Semantics |
|-------|------|-----------|
| `generated_at` | string | ISO-8601 UTC timestamp |
| `index` | object | `{ "<repo-relative-path>": ["F###", ...] }` — sorted by path key; each value is a sorted unique array |

## Citation parse rules

Only TWO citation forms are recognized (verified against real specs):

1. **Inline `**Source:**`**: `**Source:** \`path/to/file.ext:44-58\``
   - Regex: `` r'\*\*Source:\*\*\s+`([^`]+)`' ``
2. **Table row in `## Source Code References`**: backtick-wrapped path in table cells
   - Regex (within section only): `` r'`([^`]+\.[A-Za-z0-9]+(?::[0-9\-]+)?)`' ``
   - Section bounded by `## Source Code References` heading until next `## ` heading

## Path normalization

- Strip `:lines` suffix (e.g. `api/foo.php:44-58` → `api/foo.php`)
- Forward-slash only (`Path.as_posix()`)
- Repo-relative (no leading `/` or `./`)

## SHA computation (`fcode_index_sha`)

Canonical JSON serialization then SHA-256:

```python
canonical = json.dumps(index, sort_keys=True, separators=(",", ":"))
sha = hashlib.sha256(canonical.encode("utf-8")).hexdigest()
```

Where `index` is the `"index"` sub-object of `_source-to-fcode.json` (excluding `generated_at` so the hash is a stable content fingerprint).

## `.incremental-plan.json`

Per-run decision payload emitted by `scripts/incremental_planner.py`. Lives at `plans/<active>/artifacts/.incremental-plan.json`. Ephemeral — each incremental run overwrites it.

```json
{
  "mode": "incremental",
  "affected_waves": ["Wave1: route-list", "Wave2: screen-list + screen-flow"],
  "affected_fcodes": ["F001", "F005"],
  "w5_reran": true,
  "cascade_chain": "route → W1.route-list → W2 → W3 → W4 → W5",
  "fallback_reason": null,
  "fallback_to_full": false,
  "deleted_files": [],
  "doc_shas_snapshot": {
    "route-list.md": "<sha256-hex>",
    "data-model.md": "<sha256-hex>"
  },
  "generated_at": "2026-05-20T08:30:00Z",
  "since_sha": "abc123",
  "head_sha": "def456"
}
```

| Field | Type | Semantics |
|-------|------|-----------|
| `mode` | string | `"full"` or `"incremental"` — decision output |
| `affected_waves` | string[] | Pipeline.md subject strings for waves that must re-run; empty for `other`-only changes |
| `affected_fcodes` | string[] | F### codes whose specs must be regenerated; all F### if `w5_reran=true` |
| `w5_reran` | boolean | `true` if Wave 5 (feature-list) is in `affected_waves`; gates W6 scope (all vs subset) |
| `cascade_chain` | string | Human-readable cascade trace for logging; `null` if mode=full |
| `fallback_reason` | string\|null | Why mode fell back to full; `null` if incremental succeeded |
| `fallback_to_full` | boolean | `true` if planner originally computed incremental but a fallback condition fired |
| `deleted_files` | string[] | Repo-relative paths deleted since `last_rebuild_sha`; advisory only |
| `doc_shas_snapshot` | object | `{ "<artifact>.md": "<sha256>" }` — state of `docs/specs/` artifacts at plan time; updated by hydrate |
| `generated_at` | string | ISO-8601 UTC timestamp of planner invocation |
| `since_sha` | string | Git SHA used as diff base (`last_rebuild_sha` from state file) |
| `head_sha` | string | Current `git rev-parse HEAD` at plan time |
