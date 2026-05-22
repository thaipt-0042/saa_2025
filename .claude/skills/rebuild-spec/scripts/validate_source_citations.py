#!/usr/bin/env python3
"""Wave 6.5 — source citation validator.
Verifies `**Source:** path:N-M` references in spec.md files: file exists, range
within bounds, no path traversal. Stdlib only.
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
from _summary_lib import (  # noqa: E402
    atomic_write, derive_overall_status, load_summary, merge_validator_result, recalculate_totals,
)

VALIDATOR = "citation"
CITATION_RE = re.compile(r"\*\*Source:\*\*\s+`?([^`\n:]+):(\d+)(?:-(\d+))?`?")


def _issue(sev, rid, spec, root, line, msg):
    try:
        loc = str(spec.relative_to(root))
    except ValueError:
        loc = str(spec)
    return {"validator": VALIDATOR, "severity": sev, "rule_id": rid,
            "location": {"file": loc, "line": line}, "message": msg}


def _resolve_citation(raw: str, spec_path: Path, project_root: Path) -> Path | None:
    """Try project_root/raw, then spec.parent/raw. Return resolved path or None."""
    for base in (project_root, spec_path.parent):
        candidate = (base / raw).resolve()
        try:
            assert_under(candidate, project_root)
        except ValueError:
            continue
        if candidate.is_file():
            return candidate
    return None


def _check_citations(spec: Path, root: Path) -> list[dict]:
    out: list[dict] = []
    lines = spec.read_text(encoding="utf-8", errors="replace").splitlines()
    in_fence = False
    for i, ln in enumerate(lines):
        if ln.startswith("```"):
            in_fence = not in_fence
            continue
        if in_fence:
            continue
        m = CITATION_RE.search(ln)
        if not m:
            continue
        raw_path, start_s, end_s = m.group(1).strip(), m.group(2), m.group(3)
        # path-traversal guard before resolving
        if ".." in raw_path.split("/") or raw_path.startswith("/"):
            out.append(_issue("critical", "citation.path_traversal", spec, root, i + 1,
                              f"citation path looks like traversal/absolute: {raw_path!r}"))
            continue
        resolved = _resolve_citation(raw_path, spec, root)
        if resolved is None:
            out.append(_issue("critical", "citation.file_missing", spec, root, i + 1,
                              f"cited file not found under project root: {raw_path!r}"))
            continue
        try:
            file_lines = resolved.read_text(encoding="utf-8", errors="replace").splitlines()
            count = len(file_lines)
        except (OSError, UnicodeDecodeError):
            out.append(_issue("warning", "citation.unreadable", spec, root, i + 1,
                              f"cited file unreadable: {raw_path!r}"))
            continue
        start = int(start_s); end = int(end_s) if end_s else start
        if start < 1 or end > count:
            out.append(_issue("critical", "citation.range_invalid", spec, root, i + 1,
                              f"range {start}-{end} out of bounds (file has {count} lines): {raw_path!r}"))
        elif end < start:
            out.append(_issue("critical", "citation.range_inverted", spec, root, i + 1,
                              f"inverted range {start}-{end}: {raw_path!r}"))
    return out


def validate(plan_dir: Path, root: Path, single: Path | None) -> dict:
    paths = [single] if single else list(iter_spec_files(plan_dir))
    per_spec = {}
    for sp in paths:
        try:
            rel = str(sp.relative_to(root))
        except ValueError:
            rel = str(sp)
        per_spec[sp.parent.name] = {"spec_path": rel, "issues": _check_citations(sp, root)}
    return {"validator": VALIDATOR,
            "timestamp": _dt.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
            "plan_dir": str(plan_dir), "specs": per_spec}


def main(argv: list[str]) -> int:
    p = argparse.ArgumentParser(description="rebuild-spec Wave 6.5 source-citation validator")
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
