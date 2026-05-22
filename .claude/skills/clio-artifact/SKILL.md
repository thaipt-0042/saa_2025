---
name: tkm:clio-artifact
description: "Generate SVN Proposal slide content (markdown + PNG images) from Clio Knowledge Graph data. Queries KG via clio_query MCP, generates slide content as markdown with FILL_SLIDE/SHAPE markers, then renders PPTX via local scripts."
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
argument-hint: "[--generate proposal-slide] [--project-id ID] [--skip-slides 8,43]"
metadata:
  author: takumi-agent-kit
  version: "2.0.0"
---

# Slide Proposal — SVN Proposal Content Generator

Generate SVN Proposal slide content (markdown + PNG images) from Clio Knowledge Graph. Queries KG via `clio_query` MCP tool and generates markdown with `FILL_SLIDE`/`SHAPE` markers plus Mermaid PNG images. PPTX is generated via the local `scripts/generate_pptx.py` script.

**Requires:** Data provider configured (Clio MCP server).

---

## Data Provider

The skill uses **Clio Knowledge Graph** as the data provider.

- Query tool: `clio_query` MCP tool
- Config: `.clio.yml` (primary) / `.estimate.yml` (fallback)

### Setup

Add to `.mcp.json` or `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "clio": {
      "type": "http",
      "url": "https://clio.sun-asterisk.vn/mcp",
      "headers": { "x-api-key": "${CLIO_API_KEY}" }
    }
  }
}
```

Then add `CLIO_API_KEY=your-key` to `~/.claude/.env`.

Create `.clio.yml` in project root:
```yaml
project_id: your-project-id
```

### Verify Setup

- Check `clio_query` MCP tool is available

---

## Available MCP Tools

| Tool | Description |
|------|-------------|
| `clio_query` | Query project data using natural language |

---

## Execution Workflow

### **CRITICAL: Automatic Sequential Execution**

**This workflow executes ALL steps automatically in sequence:**

1. **Step 0** — Get Project ID from `.clio.yml`
2. **Steps 1-2** — Query KG for issues, pain points, objectives
3. **Step 3-4** — Generate Slide 4 (current issues + objectives)
4. **Step 5** — Generate Slide 5 (function list table) from existing `function_list_*.csv`
5. **Step 6** — Generate Slide 6 (non-functional requirements) — optional
6. **Step 7** — Generate Slide 8 (screen transition diagram PNG via Mermaid)
7. **Step 8** — Generate Slides 10 & 11 (business process flow before/after)
8. **Step 9-10** — Generate Slides 12 & 13 (system benefits)
9. **Step 11** — Generate Slide 21 (approach comparison table)
10. **Step 12** — Generate Slides 23, 24, 25 (estimated assumptions)
11. **Step 13-14** — Generate Slides 33 & 34 (infrastructure + software config)
12. **Step 15-16** — Generate Slides 35 & 36 (non-functional requirements detailed)
13. **Step 17** — Generate Slide 43 (development schedule Gantt)
14. **Step 18** — Finalize markdown + PNG images (no PPTX generation)

**Agent must:**
- Execute all steps in order without stopping
- Generate each slide completely before moving to next
- Use Edit/Write tools to write content to markdown file
- Generate PNG images only (no base64 encoding)
- DO NOT use `clio_slide_generator` MCP tool — PPTX is generated via local `scripts/generate_pptx.py`
- After all slides are generated, run the local PPTX generation script

---

## Detailed Steps

For detailed instructions on each step, see the reference files:

| Step | Reference |
|------|-----------|
| Steps 0-6 (Issues, Features, NFR) | `references/generate-content-overview.md` |
| Steps 7-8 (Screen Flow, Process) | `references/generate-content-flow.md` |
| Steps 9-10 (Benefits) | `references/generate-content-benefits.md` |
| Steps 11-12 (Approach, Assumptions) | `references/generate-content-approach.md` |
| Steps 13-17 (Infra, NFR Detail, Schedule) | `references/generate-content-technical.md` |
| Step 18 (Finalize & Instructions) | `references/generate-pptx.md` |

**Note:** Steps 7 and 17 generate PNG images via Mermaid CLI. Images are NOT base64-encoded — they are kept as `.png` files. PPTX generation is done separately via the `kg-base` slide_generator service.

---

## Common Rules (All Steps)

- Read `project_id` from `.clio.yml` first, fallback to `.estimate.yml`; ask user if missing
- All data queries run **SEQUENTIALLY** (not parallel)
- Use `clio_query` MCP tool for all queries
- Write content to markdown file using Edit/Write tools
- If data returns empty/unclear results, run one broader follow-up query
- If still unknown after follow-up, set value = `unknown`
- All files saved to `outputs/` directory in CWD
- **No fabrication** — only include data from KG
- **PNG images only** — generate PNG files via Mermaid CLI, no base64 encoding, no intermediate JSON files
- **PPTX is generated separately** — after skill completes, run the local `scripts/generate_pptx.py` script

---

## Output Files

| File | Description |
|------|-------------|
| `outputs/slides_{project_id}_{timestamp}.md` | Markdown with FILL_SLIDE/SHAPE markers |
| `outputs/screen_flow_{project_id}_{timestamp}.png` | Screen transition diagram (Mermaid) |
| `outputs/schedule_{project_id}_{timestamp}.png` | Gantt chart (Mermaid) |

## PPTX Generation (Separate Step)

After the skill generates all content, run the local PPTX generation script:

```bash
SKILL_DIR="claude/skills/slide-proposal"
VENV_PYTHON=".claude/skills/.venv/bin/python3"

$VENV_PYTHON $SKILL_DIR/scripts/generate_pptx.py \
  --input outputs/slides_{project_id}_{timestamp}.md \
  --output-dir outputs/ \
  --output {project_id}_{timestamp}
```

---

## Slide Templates

The SVN Proposal template (`[SVN] Proposal Menu.pptx`) has 71 slides. Configured slides that are filled by this skill:

| Slide | Content | Layout |
|-------|---------|--------|
| 4 | Current Issues + Objectives | Two-column with shape targets |
| 5 | Function List Table | Text + Table (6 cols) |
| 6 | Non-Functional Requirements | Text + Table (5 cols) |
| 8 | Screen Transition Diagram | Fullscreen image |
| 10 | Business Process (vertical) | 3-column before/after |
| 11 | Business Process (horizontal) | Horizontal before/after |
| 12 | Benefits Part 1 | 2-section text |
| 13 | Benefits Part 2 | 2-section text |
| 21 | Approach Comparison | Table (3-4 approaches) |
| 23 | Assumptions Part 1 | 2-col table (fill col 1) |
| 24 | Assumptions Part 2 | 2-col table (fill col 1) |
| 25 | Assumptions Part 3 | 2-col table (fill col 1) |
| 33 | Infrastructure Config | Table (3 cols) |
| 34 | Software Config | Table (3 cols) |
| 35 | NFR Overview | 4-section text (Performance/Maintainability/Scalability/Availability) |
| 36 | NFR Detailed Table | Table (5 cols, 12-18 rows) |
| 43 | Development Schedule | Text + Gantt image |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `clio_query` not found | MCP server not configured — check Setup |
| `statusCode: 401` | Invalid API key — verify `x-api-key` header |
| No `.clio.yml` | Create it in project root with `project_id` |
| Mermaid PNG fails | Install Node.js and `@mermaid-js/mermaid-cli` |
| PPTX script fails | Check `.claude/skills/.venv` exists and has `python-pptx`, `lxml` installed |
| Template not found | Verify `[SVN] Proposal Menu.pptx` in `claude/skills/slide-proposal/scripts/lib/templates/` |

## References

| Topic | File |
|-------|------|
| Steps 0-6 (Overview slides) | `references/generate-content-overview.md` |
| Steps 7-8 (Flow diagrams) | `references/generate-content-flow.md` |
| Steps 9-10 (Benefits) | `references/generate-content-benefits.md` |
| Steps 11-12 (Approach + Assumptions) | `references/generate-content-approach.md` |
| Steps 13-17 (Technical slides) | `references/generate-content-technical.md` |
| Step 18 (Finalize & Instructions) | `references/generate-pptx.md` |
| MCP Config Snippet | `data/mcp-config-snippet.json` |
