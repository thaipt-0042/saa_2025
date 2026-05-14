---
name: tkm:estimate
description: "Generate project estimation artifacts. Modes: project-profile, screen-flow, function-list, estimate,  user-story. No mode = full pipeline. Uses configurable data provider (default: Clio KG)."
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
argument-hint: "[mode] [--project-id ID]"
metadata:
  author: takumi-agent-kit
  version: "1.0.0"
---

# Estimate — Project Estimation Artifact Generator

Generate project estimation artifacts from a configurable data source. Default data provider is Clio Knowledge Graph via MCP.

**Requires:** Data provider configured (default: Clio API key + MCP server).

## Data Provider

The skill uses a **configurable data provider** for querying project information.

### Current Provider: Clio Knowledge Graph

- Query tool: `clio_query` MCP tool
- Excel generation: `clio_project_profile` MCP tool
- Config: `.estimate.yml` (primary) / `.clio.yml` (fallback)

To switch to a different data source in the future, update the provider references in the reference files — the query strings are natural language and provider-agnostic.

---

## Setup

### 1. Configure Data Provider (Clio)

Add to `.mcp.json` (project-level) or `~/.claude/settings.json` (user-level):

```json
{
  "mcpServers": {
    "clio": {
      "type": "http",
      "url": "https://clio.sun-asterisk.vn/mcp",
      "headers": {
        "x-api-key": "${CLIO_API_KEY}"
      }
    }
  }
}
```

Then add `CLIO_API_KEY=your-key-here` to `~/.claude/.env`.

### 2. Project Configuration

Create `.estimate.yml` (or `.clio.yml`) in your project root:

```yaml
project_id: your-project-id
```

### 3. Verify Setup

- Check `clio_query` MCP tool is available

---

## Available MCP Tools (Clio Provider)

| Tool | Description |
|------|-------------|
| `clio_query` | Query the project data source using natural language |
| `clio_project_profile` | Generate Excel Project Profile from CSV |

---

## Modes

### No mode — Full Pipeline

Run all modes in dependency order:

```bash
/tkm:estimate
/tkm:estimate --project-id hayate
```

**Pipeline order:**
1. `project-profile` (standalone)
2. `user-story` (standalone)
3. `screen-flow` (standalone, foundation for next)
4. `function-list` (depends on screen-flow)
5. `estimate` (depends on function-list)

---

### project-profile

Generate full Project Profile (CSV + Excel) matching Sun* template BM-2-901-64.

```bash
/tkm:estimate project-profile
```

**Output:** `outputs/project_profile_{project_id}_{timestamp}.csv` + Excel uploaded to Clio.

**Reference:** `references/generate-project-profile.md`

---

### user-story

Generate User Stories in standard format.

```bash
/tkm:estimate user-story
```

**Output:** `outputs/user_stories_{project_id}_{timestamp}.md`

**Reference:** `references/generate-user-story.md`

---

### screen-flow

Generate Screen List (CSV) and Screen Flow Diagram (Mermaid).

```bash
/tkm:estimate screen-flow
```

**Output:** `outputs/screen_list_{project_id}_{timestamp}.csv` + `outputs/screen_flow_{project_id}_{timestamp}.md`

**Reference:** `references/generate-screen-flow.md`

---

### function-list

Generate detailed Function List from Screen List. **Requires prior `screen-flow` run.**

```bash
/tkm:estimate function-list
```

**Output:** `outputs/function_list_{project_id}_{timestamp}.csv` + `outputs/function_summary_{project_id}_{timestamp}.md`

**Reference:** `references/generate-function-list.md`

---

### estimate

Generate estimation from Function List. **Requires prior `function-list` run.**

```bash
/tkm:estimate estimate
```

**Output:** `outputs/estimation_data_{project_id}.csv` + `outputs/estimation_summary_{project_id}.md`

**Reference:** `references/generate-estimate.md`

---

## Mode Dependency Graph

```
project-profile  (standalone)
user-story       (standalone)

screen-flow → function-list → estimate
```

When running full pipeline, modes execute in order respecting dependencies.

---

## Common Rules (All Modes)

- Read `project_id` from `.estimate.yml` first, fallback to `.clio.yml`; ask user if missing
- All data queries run **SEQUENTIALLY** (not parallel)
- Use data provider tool (default: `clio_query`) for all queries
- Write output files using Edit/Write tools — **no Python scripts**
- If data returns empty/unclear results, run one broader follow-up query
- If still unknown after follow-up, set value = `unknown`
- All files saved to `outputs/` directory in CWD
- **No fabrication** — only include data from the configured data source

## Key Constraints

- Only include data from the configured data source — **no fabrication**
- If data is unavailable, **leave blank** or mark as `unknown`

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `clio_query` not found | MCP server not configured — check Setup |
| `statusCode: 401` | Invalid API key — verify `x-api-key` header |
| No `.estimate.yml` / `.clio.yml` | Create it in project root with `project_id` |
| Empty outputs | Data source may lack data — this is expected |

## References

| Topic | File |
|-------|------|
| Generate Estimate | `references/generate-estimate.md` |
| Generate Function List | `references/generate-function-list.md` |
| Generate Project Profile | `references/generate-project-profile.md` |
| Generate Screen Flow | `references/generate-screen-flow.md` |
| Generate User Story | `references/generate-user-story.md` |
| MCP Config Snippet | `data/mcp-config-snippet.json` |
