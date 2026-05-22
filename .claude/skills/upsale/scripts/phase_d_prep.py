#!/usr/bin/env python3
"""Upsale Step 5c CLI — Phase-D pre-extraction dispatcher.

Authoritative implementation of `claude/skills/upsale/references/phase-d-prep.md`.
Replaces the previous `researcher` subagent invocation. The orchestrator calls
this script via Bash; stdout is captured into its log buffer verbatim.

Stdout contract:
  - Zero or more `warn:` lines (stale-manifest, evidence-degraded, stack-context-missing).
  - One `done: step-5c -> <manifest_path>` line OR `skip: step-5c (artifact exists)`.
  - Exactly one trailer: `Status: DONE` | `Status: DONE_WITH_CONCERNS - <reason>`
    | `Status: BLOCKED - <reason>`.

Exit code: 0 for DONE / DONE_WITH_CONCERNS / skip. Non-zero only for BLOCKED.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from phase_d_prep_lib import (  # noqa: E402
    VALID_USE_CONTEXTS,
    Manifest,
    assert_under_plans,
    build_stack_context,
    compute_sha256,
    load_evidence,
    parse_items,
    resolve_aspect_id,
    rewrite_h4_to_h2,
    validate_filename_slug,
)


DEDUP_APPLIED_MARKER = "<!-- dedup: applied"


def _parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    p = argparse.ArgumentParser(
        description="Phase-D pre-extraction dispatcher (Upsale Step 5c).",
        allow_abbrev=False,
    )
    p.add_argument("--combined-path", type=Path, required=True)
    p.add_argument("--use-context-json-path", type=Path, required=True)
    p.add_argument("--business-improvement-dir", type=Path, default=None)
    p.add_argument("--technical-improvement-dir", type=Path, default=None)
    p.add_argument("--business-discovery-dir", type=Path, default=None)
    p.add_argument("--technical-discovery-dir", type=Path, default=None)
    p.add_argument("--payloads-dir", type=Path, required=True)
    p.add_argument("--manifest-path", type=Path, required=True)
    p.add_argument("--validation-dir", type=Path, required=True)
    return p.parse_args(argv)


def _print_status(status: str, reason: str = "") -> None:
    if reason:
        print(f"Status: {status} — {reason}")
    else:
        print(f"Status: {status}")


def _atomic_write_json(target: Path, payload: dict) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp_name = tempfile.mkstemp(
        prefix=target.name + ".", suffix=".tmp", dir=str(target.parent),
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


def _read_use_context(json_path: Path) -> str | None:
    if not json_path.exists():
        return None
    try:
        data = json.loads(json_path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return None
    val = data.get("useContext") if isinstance(data, dict) else None
    if isinstance(val, str) and val.lower() in VALID_USE_CONTEXTS:
        return val.lower()
    return None


def _last_non_blank_line(text: str) -> str:
    for line in reversed(text.splitlines()):
        if line.strip():
            return line
    return ""


def _track_inputs(args: argparse.Namespace) -> dict[str, dict[str, Path]]:
    tracks: dict[str, dict[str, Path]] = {}
    if args.technical_improvement_dir is not None:
        tracks["technical"] = {
            "improvement": args.technical_improvement_dir,
            "discovery": args.technical_discovery_dir or Path("plans/upsale/technical/01-discovery/"),
            "stack_files": ["01-repository-identity.md", "02-tech-stack.md"],
        }
    if args.business_improvement_dir is not None:
        tracks["business"] = {
            "improvement": args.business_improvement_dir,
            "discovery": args.business_discovery_dir or Path("plans/upsale/business/01-discovery/"),
            "stack_files": ["01-product-identity.md", "02-target-users.md"],
        }
    return tracks


def main(argv: list[str] | None = None) -> int:
    args = _parse_args(argv)
    warns: list[str] = []
    plans_root = Path("plans").resolve()

    # Path-safety on every external path we'll touch.
    for p in [args.combined_path, args.payloads_dir, args.manifest_path, args.validation_dir]:
        try:
            assert_under_plans(p, plans_root)
        except ValueError as exc:
            _print_status("BLOCKED", f"path-safety: {exc}")
            return 2

    tracks = _track_inputs(args)
    if not tracks:
        _print_status("BLOCKED", "no active track — must provide at least one --*-improvement-dir")
        return 2

    # Procedure step 1: combined-initial.md presence + dedup-applied marker.
    if not args.combined_path.is_file():
        _print_status("BLOCKED", f"combined missing at {args.combined_path}")
        return 2
    combined_text = args.combined_path.read_text(encoding="utf-8")
    if not _last_non_blank_line(combined_text).startswith(DEDUP_APPLIED_MARKER):
        _print_status("BLOCKED", "combined-initial.md not finalised by step-5b")
        return 2

    current_sha = compute_sha256(combined_text.encode("utf-8"))

    # Idempotency: manifest SHA check.
    if args.manifest_path.exists() and args.manifest_path.stat().st_size > 0:
        try:
            existing = json.loads(args.manifest_path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            existing = None
        if isinstance(existing, dict) and existing.get("combined_md_sha256") == current_sha:
            print("skip: step-5c (artifact exists)")
            _print_status("DONE")
            return 0
        # Stale manifest → wipe payloads_dir + manifest, rebuild.
        if args.payloads_dir.is_dir():
            for entry in args.payloads_dir.iterdir():
                if entry.is_file() and (entry.name.startswith("item-") or entry.name == "_manifest.json"):
                    try:
                        entry.unlink()
                    except OSError:
                        pass
        warns.append(
            "warn: step-5c stale manifest (combined-initial.md changed) — rebuilt payloads"
        )

    # Procedure step 2: use-context.
    use_context = _read_use_context(args.use_context_json_path)
    if use_context is None:
        _print_status("BLOCKED", "use-context.json missing or invalid useContext value")
        return 2

    # Procedure step 3: parse items.
    items = parse_items(combined_text)
    # Filter out items whose track is inactive (single-track run).
    items = [it for it in items if it.track in tracks]
    # Re-number after filtering (1-based, doc order — parse_items already gives doc order).
    for new_idx, it in enumerate(items, start=1):
        it.index = new_idx

    # Procedure step 7: build per-track stack_context (once each).
    stack_contexts: dict[str, str] = {}
    for track, cfg in tracks.items():
        ctx, missing = build_stack_context(cfg["discovery"], cfg["stack_files"])
        for m in missing:
            warns.append(f"warn: stack-context source missing for {track} — {m}")
        stack_contexts[track] = ctx

    # Procedure steps 4-6 + 8-9: per-item resolution + payload writes.
    manifest_items: list[dict] = []
    evidence_degraded_warns: list[str] = []

    args.payloads_dir.mkdir(parents=True, exist_ok=True)

    for it in items:
        if not validate_filename_slug(it.slug):
            _print_status("BLOCKED", f"invalid slug for item-{it.index}: {it.slug!r}")
            return 2

        aspect_id, fallback = resolve_aspect_id(combined_text, it)
        evidence = ""
        if aspect_id:
            track_cfg = tracks[it.track]
            evidence, found = load_evidence(track_cfg["improvement"], aspect_id)
            if not found:
                evidence_degraded_warns.append(
                    f"warn: item-{it.index:02d} \"{it.title}\" evidence-degraded — "
                    f"aspect-id={aspect_id} has no matching ^[0-9]+-{aspect_id}\\.md$ "
                    f"in {it.track} improvement directory"
                )
            if fallback == "rollup-heading":
                evidence_degraded_warns.append(
                    f"warn: pre-ext aspect-id-comment-missing for item-{it.index:02d} "
                    f"\"{it.title}\" — fell back to slug-from-rollup-heading"
                )
        else:
            evidence_degraded_warns.append(
                f"warn: item-{it.index:02d} \"{it.title}\" evidence-degraded — "
                f"aspect-id unresolvable in combined-initial.md"
            )

        payload_path = args.payloads_dir / f"item-{it.index:02d}-{it.slug}.json"
        output_path = args.validation_dir / f"item-{it.index:02d}-{it.slug}.md"

        payload = {
            "schema_version": 1,
            "track": it.track,
            "use_context": use_context,
            "item_index": it.index,
            "item_slug": it.slug,
            "output_path": str(output_path),
            "stack_context": stack_contexts.get(it.track, ""),
            "item_markdown": rewrite_h4_to_h2(it.body),
            "item_evidence": evidence,
        }
        _atomic_write_json(payload_path, payload)

        manifest_items.append({
            "item_index": it.index,
            "item_slug": it.slug,
            "track": it.track,
            "payload_path": str(payload_path.resolve()),
            "output_path": str(output_path.resolve()),
        })

    # Procedure step 10: write manifest LAST.
    manifest_payload = {
        "schema_version": 1,
        "combined_md_sha256": current_sha,
        "use_context": use_context,
        "items": manifest_items,
        "evidence_degraded_warns": evidence_degraded_warns,
    }
    _atomic_write_json(args.manifest_path, manifest_payload)

    # Output.
    for w in warns + evidence_degraded_warns:
        print(w)

    if not items:
        print(f"done: step-5c (no items) → {args.manifest_path.resolve()}")
    else:
        print(f"done: step-5c → {args.manifest_path.resolve()}")

    if warns or evidence_degraded_warns:
        reasons = []
        if warns:
            reasons.append("stale-manifest or stack-context degraded")
        if evidence_degraded_warns:
            reasons.append(f"{len(evidence_degraded_warns)} evidence-degraded item(s)")
        _print_status("DONE_WITH_CONCERNS", "; ".join(reasons))
    else:
        _print_status("DONE")
    return 0


if __name__ == "__main__":
    sys.exit(main())
