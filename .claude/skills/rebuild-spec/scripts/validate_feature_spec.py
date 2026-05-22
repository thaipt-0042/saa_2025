#!/usr/bin/env python3
"""Wave 6.5 — feature spec structural validator.
Checks `spec.md` files against verification-checklist.md FeatureSpec rules.
Regex + fence-state tracking; stdlib only.
Exit codes: 0 (no critical), 1 (critical), 2 (internal).
"""
from __future__ import annotations
import argparse
import datetime as _dt
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from _slug_lib import assert_under, iter_spec_files, resolve_project_root  # noqa: E402
from _spec_parse import parse_headings_and_blocks, strip_html_comments  # noqa: E402
from _summary_lib import (  # noqa: E402
    atomic_write, derive_overall_status, load_summary, merge_validator_result, recalculate_totals,
)

VALIDATOR = "feature_spec"

REQUIRED_H2 = ["## Overview", "## Why This Exists", "## Who Uses It", "## Business Workflow", "## Screen Flow", "## Cross-Cutting Logic", "## User Stories", "## Key Entities",
               "## Related Artifacts", "## Spec Documents", "## Assumptions", "## Source Code References", "## Unresolved Questions"]
REQUIRED_CCL_H3 = ["### Requirements", "### Business Rules", "### State Machines", "### Algorithms", "### External Integrations", "### Verification"]
DEPRECATED_H2 = {"## Requirements", "## Business Rules", "## State Machines", "## Algorithms", "## External Integrations", "## Success Criteria", "## How It Works"}
PLACEHOLDER_RE = re.compile(r"\{[A-Z][A-Z0-9_/|]*\}")
FCODE_HEADING_RE = re.compile(r"^#\s+F\d{3}_[A-Za-z0-9]+")
SCREEN_FLOW_OK_RE = re.compile(r"^\*\*See:\*\*\s+ScreenFlow\s+§\s+F\d{3}_\w+|^N/A —")
SM_BLOCK_RE = re.compile(r"^###\s+SM-\d{3}_")
NUMBERED_STEP_RE = re.compile(r"^\s*\d+\.\s+\S")


def _bounds(h2, name, total):
    for i, (idx, h) in enumerate(h2):
        if h == name:
            return idx + 1, (h2[i + 1][0] if i + 1 < len(h2) else total)
    return None


def _issue(sev, rid, spec, root, line, msg):
    try:
        loc = str(spec.relative_to(root))
    except ValueError:
        loc = str(spec)
    return {"validator": VALIDATOR, "severity": sev, "rule_id": rid,
            "location": {"file": loc, "line": line}, "message": msg}


def _check_spec(spec: Path, root: Path) -> list[dict]:
    lines = spec.read_text(encoding="utf-8", errors="replace").splitlines()
    headings, blocks = parse_headings_and_blocks(lines)
    scrubbed = strip_html_comments(lines)
    h2 = [(i, h) for i, h in headings if h.startswith("## ") and not h.startswith("### ")]
    out: list[dict] = []
    add = lambda s, r, ln, m: out.append(_issue(s, r, spec, root, ln, m))  # noqa: E731

    if not any(FCODE_HEADING_RE.match(lines[i]) for i in range(min(5, len(lines)))):
        add("critical", "FeatureSpec.f_code_format", 1, "missing/invalid F### heading in preamble")

    for idx, raw in headings:
        if raw in DEPRECATED_H2:
            add("critical", "FeatureSpec.deprecated_headings", idx + 1, f"deprecated H2 {raw!r}")
        if raw == "## Appendix":
            add("critical", "FeatureSpec.no_appendix", idx + 1, "## Appendix must be removed")

    h2_names = [h for _, h in h2]
    present = [h for h in h2_names if h in REQUIRED_H2]
    expected = [h for h in REQUIRED_H2 if h in present]
    if present != expected or set(present) != set(REQUIRED_H2):
        missing = [h for h in REQUIRED_H2 if h not in present]
        add("critical", "FeatureSpec.required_sections", None,
            f"required H2 missing/out-of-order; missing: {missing}" if missing else "required H2 out of order")

    b_ccl = _bounds(h2, "## Cross-Cutting Logic", len(lines))
    if b_ccl:
        h3 = [(idx, h) for idx, h in headings if b_ccl[0] <= idx < b_ccl[1] and h.startswith("### ")]
        names = [h for _, h in h3]
        present_ccl = [h for h in names if h in REQUIRED_CCL_H3]
        if present_ccl != [h for h in REQUIRED_CCL_H3 if h in present_ccl] or set(present_ccl) != set(REQUIRED_CCL_H3):
            add("critical", "FeatureSpec.ccl_subsections", None,
                f"required CCL H3 missing/out-of-order; have {names}")
        for i, (idx, h) in enumerate(h3):
            end = h3[i + 1][0] if i + 1 < len(h3) else b_ccl[1]
            if not "\n".join(lines[idx + 1:end]).strip():
                add("critical", "FeatureSpec.ccl_blank", idx + 1, f"{h} is blank; write `None.` if empty")

    b_sf = _bounds(h2, "## Screen Flow", len(lines))
    if b_sf:
        for i in range(*b_sf):
            s = lines[i].strip()
            if s and not s.startswith("#") and not s.startswith("<!--"):
                if not SCREEN_FLOW_OK_RE.match(s):
                    add("critical", "FeatureSpec.screen_flow_crossref", i + 1,
                        "Screen Flow first content line must start with '**See:** ScreenFlow § F###_…' or 'N/A —'")
                break

    b_bw = _bounds(h2, "## Business Workflow", len(lines))
    if b_bw:
        steps = sum(1 for i in range(*b_bw) if NUMBERED_STEP_RE.match(lines[i]))
        if steps < 3:
            add("critical", "FeatureSpec.bw_steps", None,
                f"## Business Workflow needs ≥3 numbered steps; found {steps}")

    b_us = _bounds(h2, "## User Stories", len(lines))
    if b_us and not any(h == "### Edge Cases"
                        for idx, h in headings if b_us[0] <= idx < b_us[1] and h.startswith("### ")):
        add("critical", "FeatureSpec.edge_cases", None, "### Edge Cases required under ## User Stories")

    fenced = {i for s, e, _ in blocks for i in range(s, e + 1)}
    for i, raw in enumerate(lines):
        if i in fenced or not PLACEHOLDER_RE.search(scrubbed[i]):
            continue
        add("critical", "Universal.no_placeholder", i + 1, f"placeholder literal in line: {raw.strip()[:80]!r}")
        break

    sm_heads = [(idx, raw) for idx, raw in headings if SM_BLOCK_RE.match(raw)]
    for k, (idx, raw) in enumerate(sm_heads):
        nxt = sm_heads[k + 1][0] if k + 1 < len(sm_heads) else len(lines)
        if not any(idx < start < nxt and lang.startswith("mermaid") for start, _e, lang in blocks):
            add("critical", "FeatureSpec.sm_mermaid", idx + 1, f"{raw} block missing stateDiagram-v2 fence")

    for start, end, lang in blocks:
        if lines[start].startswith("```{lang}"):
            add("warning", "FeatureSpec.pseudocode_fence", start + 1, "pseudocode fence uses literal {lang}")
        if end - start - 1 > 20 and lang and lang != "mermaid":
            add("warning", "FeatureSpec.pseudocode_length", start + 1,
                f"pseudocode block {end - start - 1} lines > 20")
    return out


def validate(plan_dir, root, single):
    paths = [single] if single else list(iter_spec_files(plan_dir))
    per_spec = {}
    for sp in paths:
        try:
            rel = str(sp.relative_to(root))
        except ValueError:
            rel = str(sp)
        per_spec[sp.parent.name] = {"spec_path": rel, "issues": _check_spec(sp, root)}
    return {"validator": VALIDATOR,
            "timestamp": _dt.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
            "plan_dir": str(plan_dir), "specs": per_spec}


def main(argv: list[str]) -> int:
    p = argparse.ArgumentParser(description="rebuild-spec Wave 6.5 feature-spec validator")
    g = p.add_mutually_exclusive_group(required=True)
    g.add_argument("--plan-dir"); g.add_argument("--spec")
    p.add_argument("--project-root", default=None); p.add_argument("--summary-out", default=None)
    args = p.parse_args(argv)
    root = resolve_project_root(args.project_root)
    if args.plan_dir:
        plan_dir = Path(args.plan_dir).resolve(); single = None
        if not plan_dir.is_dir():
            print(f"[ERROR] --plan-dir is not a directory: {plan_dir}", file=sys.stderr); return 2
    else:
        single = Path(args.spec).resolve(); plan_dir = single.parent.parent.parent
        if not single.is_file():
            print(f"[ERROR] --spec is not a file: {single}", file=sys.stderr); return 2
    try:
        assert_under(plan_dir, root)
    except ValueError as exc:
        print(f"[ERROR] {exc}", file=sys.stderr); return 2
    try:
        result = validate(plan_dir, root, single)
    except Exception as exc:  # noqa: BLE001
        print(f"[ERROR] validator crashed: {exc}", file=sys.stderr); return 2
    print(json.dumps(result, indent=2, sort_keys=True))
    crit = sum(1 for s in result["specs"].values() for i in s["issues"] if i["severity"] == "critical")
    if args.summary_out:
        sp = Path(args.summary_out).resolve()
        try:
            assert_under(sp.parent, root)
            summary = load_summary(sp, plan_dir.name)
            merge_validator_result(summary, VALIDATOR, result)
            recalculate_totals(summary); summary["overall_status"] = derive_overall_status(summary)
            atomic_write(sp, summary)
        except Exception as exc:  # noqa: BLE001
            print(f"[ERROR] failed to merge summary: {exc}", file=sys.stderr); return 2
    return 1 if crit else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
