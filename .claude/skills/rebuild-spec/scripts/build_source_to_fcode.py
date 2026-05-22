#!/usr/bin/env python3
"""Wave 9.5 — reverse-index + state file emitter.

Scans promoted feature specs, extracts source-file citations,
writes `_source-to-fcode.json` (reverse index) and `.rebuild-state.json` (state).

Stdlib only. Authority: ../references/incremental-state-schema.md.

Exit codes: 0 (success), 1 (no spec files found), 2 (internal error).
"""
from __future__ import annotations

import argparse
import datetime as _dt
import hashlib
import json
import os
import re
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from _slug_lib import resolve_project_root  # noqa: E402

FCODE_DIR_RE = re.compile(r"^(F[0-9]{3,4})")
INLINE_SOURCE_RE = re.compile(r"\*\*Source:\*\*\s+`([^`]+)`")
TABLE_CITE_RE = re.compile(r"`([^`]+\.[A-Za-z0-9]+(?::[0-9\-]+)?)`")
LINE_SUFFIX_RE = re.compile(r":[0-9\-]+$")


def _parse_citations(spec_text: str) -> set[str]:
    """Extract cited file paths from spec markdown."""
    paths: set[str] = set()
    for m in INLINE_SOURCE_RE.finditer(spec_text):
        paths.add(m.group(1))
    in_section = False
    for line in spec_text.splitlines():
        if line.startswith("## Source Code References"):
            in_section = True
            continue
        if in_section and line.startswith("## "):
            break
        if in_section:
            for m in TABLE_CITE_RE.finditer(line):
                paths.add(m.group(1))
    return paths


def _normalize_path(raw: str) -> str:
    """Strip :lines suffix, normalize to forward-slash repo-relative."""
    cleaned = LINE_SUFFIX_RE.sub("", raw)
    posix = Path(cleaned).as_posix()
    return posix.lstrip("./")


def _extract_fcode(spec_path: Path) -> str | None:
    m = FCODE_DIR_RE.match(spec_path.parent.name)
    return m.group(1) if m else None


def _git_head_sha() -> str:
    r = subprocess.run(
        ["git", "rev-parse", "HEAD"],
        capture_output=True, text=True, timeout=5, check=True,
    )
    return r.stdout.strip()


def _compute_doc_shas(docs_root: Path) -> dict[str, str]:
    """SHA-256 each *.md directly under docs_root (core artifacts). Sorted by filename."""
    shas: dict[str, str] = {}
    if not docs_root.is_dir():
        return shas
    for md in sorted(docs_root.glob("*.md")):
        if md.is_file():
            digest = hashlib.sha256(md.read_bytes()).hexdigest()
            shas[md.name] = digest
    return shas


def build_index(specs_root: Path) -> dict[str, list[str]]:
    """Build {path: [F###, ...]} reverse index from spec files."""
    path_to_fcodes: dict[str, set[str]] = {}
    spec_files = sorted(specs_root.glob("*/spec.md"))
    if not spec_files:
        return {}
    for spec_file in spec_files:
        fcode = _extract_fcode(spec_file)
        if not fcode:
            continue
        text = spec_file.read_text(encoding="utf-8", errors="replace")
        for raw_path in _parse_citations(text):
            norm = _normalize_path(raw_path)
            if norm:
                path_to_fcodes.setdefault(norm, set()).add(fcode)
    return {k: sorted(v) for k, v in sorted(path_to_fcodes.items())}


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Wave 9.5 reverse-index emitter")
    parser.add_argument("--specs-root", required=True, help="Path to docs/specs/features")
    parser.add_argument("--state-out", required=True, help="Output path for .rebuild-state.json")
    parser.add_argument("--index-out", required=True, help="Output path for _source-to-fcode.json")
    parser.add_argument("--docs-root", default=None, help="Path to docs/specs/ (parent of features/); default: specs-root parent")
    parser.add_argument("--mode", default="full", choices=["full", "incremental"])
    parser.add_argument("--rebuilt-at", default=None, help="ISO-8601 timestamp (default: now)")
    parser.add_argument("--last-rebuild-sha", default=None,
                        help="Override last_rebuild_sha (default: git rev-parse HEAD). Used by bootstrap-from-git flow.")
    args = parser.parse_args(argv)

    specs_root = Path(args.specs_root).resolve()
    if not specs_root.is_dir():
        print(f"[ERROR] specs-root not found: {specs_root}", file=sys.stderr)
        return 1

    index = build_index(specs_root)
    if not index:
        spec_count = len(list(specs_root.glob("*/spec.md")))
        if spec_count == 0:
            print(f"[ERROR] no feature specs found under {specs_root}", file=sys.stderr)
            return 1

    rebuilt_at = args.rebuilt_at or (_dt.datetime.now(_dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"))

    index_data = {"generated_at": rebuilt_at, "index": index}
    canonical = json.dumps(index, sort_keys=True, separators=(",", ":"))
    fcode_index_sha = hashlib.sha256(canonical.encode("utf-8")).hexdigest()

    if args.last_rebuild_sha:
        sha_val = args.last_rebuild_sha.lower()
        if not re.fullmatch(r"[0-9a-f]{7,40}", sha_val):
            print(f"[ERROR] --last-rebuild-sha invalid format: {args.last_rebuild_sha!r}", file=sys.stderr)
            return 2
        last_rebuild_sha = sha_val
    else:
        try:
            last_rebuild_sha = _git_head_sha()
        except (subprocess.CalledProcessError, subprocess.TimeoutExpired, FileNotFoundError) as exc:
            print(f"[ERROR] git rev-parse HEAD failed: {exc}", file=sys.stderr)
            return 2

    docs_root = Path(args.docs_root).resolve() if args.docs_root else specs_root.parent
    doc_shas = _compute_doc_shas(docs_root)

    state_data = {
        "doc_shas": doc_shas,
        "fcode_index_sha": fcode_index_sha,
        "last_rebuild_sha": last_rebuild_sha,
        "mode": args.mode,
        "rebuilt_at": rebuilt_at,
    }

    for out_path, data in [(args.index_out, index_data), (args.state_out, state_data)]:
        p = Path(out_path)
        p.parent.mkdir(parents=True, exist_ok=True)
        tmp = p.with_suffix(p.suffix + ".tmp")
        tmp.write_text(json.dumps(data, indent=2, sort_keys=True) + "\n", encoding="utf-8")
        os.replace(str(tmp), str(p))

    return 0


if __name__ == "__main__":
    sys.exit(main())
