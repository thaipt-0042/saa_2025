#!/usr/bin/env python3
"""Upsale Step 1 CLI — SDD (Spec-Driven Development) detection.

Authoritative implementation of `claude/skills/upsale/references/sdd-detection.md`.
Replaces the previous `researcher` subagent invocation. The orchestrator calls
this script via Bash; stdout is captured into its log buffer verbatim.

Stdout contract (matches subagent return format):
  - One line: `done: step-1 -> <abs path>` OR `skip: step-1 (artifact exists)`.
  - Exactly one trailer: `Status: DONE` | `Status: DONE_WITH_CONCERNS - <reason>`
    | `Status: BLOCKED - <reason>`.

Exit code: 0 for DONE / DONE_WITH_CONCERNS / skip. Non-zero only for BLOCKED.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import tempfile
from pathlib import Path

# Allow `python detect_sdd.py` invocation without package install.
sys.path.insert(0, str(Path(__file__).resolve().parent))
from detect_sdd_lib import (  # noqa: E402
    classify,
    primary_signals,
    resolve_specs_root,
    secondary_signals,
)


def _parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    p = argparse.ArgumentParser(
        description="Detect Spec-Driven Development conventions (Upsale Step 1).",
        allow_abbrev=False,
    )
    p.add_argument("--repo-root", type=Path, default=Path.cwd(),
                   help="Repository root to scan (default: CWD).")
    p.add_argument("--output-path", type=Path,
                   default=Path("plans/upsale/sdd-detection.json"),
                   help="Where to write the verdict JSON.")
    return p.parse_args(argv)


def _print_status(status: str, reason: str = "") -> None:
    if reason:
        print(f"Status: {status} — {reason}")
    else:
        print(f"Status: {status}")


def _atomic_write_json(target: Path, payload: dict) -> None:
    """Write `payload` as JSON to `target` atomically via tempfile + os.replace."""
    target.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp_name = tempfile.mkstemp(
        prefix=target.name + ".",
        suffix=".tmp",
        dir=str(target.parent),
    )
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as fh:
            json.dump(payload, fh, indent=2)
            fh.write("\n")
        os.replace(tmp_name, target)
    except Exception:
        try:
            os.unlink(tmp_name)
        except OSError:
            pass
        raise


def main(argv: list[str] | None = None) -> int:
    args = _parse_args(argv)
    repo_root: Path = args.repo_root.resolve()
    output_path: Path = args.output_path

    # Idempotency — skip when output already non-empty.
    if output_path.exists() and output_path.stat().st_size > 0:
        print("skip: step-1 (artifact exists)")
        _print_status("DONE")
        return 0

    try:
        primary = primary_signals(repo_root)
        secondary = secondary_signals(repo_root)
        is_sdd = classify(primary, secondary)
        specs_root = resolve_specs_root(repo_root) if is_sdd else ""
    except OSError as exc:
        # Fallback per sdd-detection.md "Fallback" section.
        payload = {"isSDD": False, "signals": [], "specsRoot": ""}
        try:
            _atomic_write_json(output_path, payload)
        except OSError as write_exc:
            _print_status("BLOCKED", f"fs error during fallback write: {write_exc}")
            return 2
        print(f"done: step-1 → {output_path.resolve()}")
        _print_status("DONE_WITH_CONCERNS", f"fs error: {exc}")
        return 0

    payload = {
        "isSDD": is_sdd,
        "signals": [s.to_dict() for s in (primary + secondary)],
        "specsRoot": specs_root,
    }

    try:
        _atomic_write_json(output_path, payload)
    except OSError as exc:
        _print_status("BLOCKED", f"write failed: {exc}")
        return 2

    print(f"done: step-1 → {output_path.resolve()}")
    _print_status("DONE")
    return 0


if __name__ == "__main__":
    sys.exit(main())
