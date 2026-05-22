# Step 18: Finalize Markdown & Images

**Goal:** Verify all outputs are ready for PPTX generation via the local `generate_pptx.py` script.

**IMPORTANT:** This step does NOT generate PPTX. PPTX generation is done separately by running the local script.

---

## Step 18.1: Verify output files exist

Check that all expected files are present:

```bash
ls -lh outputs/slides_{project_id}_{timestamp}.md
ls -lh outputs/screen_flow_{project_id}_{timestamp}.png 2>/dev/null
ls -lh outputs/schedule_{project_id}_{timestamp}.png 2>/dev/null
```

Expected files:
- `outputs/slides_{project_id}_{timestamp}.md` — **required** (markdown with FILL_SLIDE/SHAPE markers)
- `outputs/screen_flow_{project_id}_{timestamp}.png` — optional (Slide 8 screen flow diagram)
- `outputs/schedule_{project_id}_{timestamp}.png` — optional (Slide 43 Gantt chart)

---

## Step 18.2: Show final completion message

```
=== Slide Proposal Content Generation Complete ===

Generated files:
  Markdown:   outputs/slides_{project_id}_{timestamp}.md
  Screen flow: outputs/screen_flow_{project_id}_{timestamp}.png (if generated)
  Schedule:   outputs/schedule_{project_id}_{timestamp}.png (if generated)

The presentation includes:
  - Slide 4: Current Issues & Objectives
  - Slide 5: Function Summary Table
  - Slide 6: Non-Functional Requirements (if applicable)
  - Slide 8: Screen Transition Diagram
  - Slides 10-11: Business Process Flow (before/after)
  - Slides 12-13: System Benefits
  - Slide 21: Approach Comparison
  - Slides 23-25: Estimated Assumptions
  - Slide 33: Infrastructure Configuration
  - Slide 34: Software Configuration
  - Slide 35: NFR Overview
  - Slide 36: Detailed NFR Table
  - Slide 43: Development Schedule Gantt

To generate PPTX, run:
  .claude/skills/.venv/bin/python3 claude/skills/slide-proposal/scripts/generate_pptx.py \
    --input outputs/slides_{project_id}_{timestamp}.md \
    --output-dir outputs/ \
    --output {project_id}_{timestamp}
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Markdown file not found | Check `outputs/` for the correct filename |
| Template not found | Verify `[SVN] Proposal Menu.pptx` exists in `claude/skills/slide-proposal/scripts/lib/templates/` |
| `python-pptx` missing | Install via `.claude/skills/.venv/bin/pip install python-pptx lxml` |
| PNG images not in PPTX | Images must be referenced in markdown via `SHAPE: screen_flow_image` and `SHAPE: schedule_image` markers with filenames only (resolved from `--output-dir`) |
