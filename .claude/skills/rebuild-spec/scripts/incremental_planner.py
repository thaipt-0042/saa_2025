#!/usr/bin/env python3
"""Cascade-aware incremental planner for rebuild-spec.

Decision oracle: reads state, git diff, scout-report → emits .incremental-plan.json.
Does NOT dispatch tasks — pipeline.md reads the payload and gates TaskCreate calls.

Exit codes: 0 = decision emitted, 1 = hard halt (prereqs missing), 2 = arg error.
Stdlib only. Authority: ../references/incremental-state-schema.md.
"""
from __future__ import annotations

import argparse
import datetime as _dt
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

# Wave subject strings — must match pipeline.md verbatim.
CORE_ARTIFACT_TO_WAVE_SUBJECT: dict[str, str] = {
    "route-list.md": "Wave1: route-list",
    "data-model.md": "Wave1: data-model",
    "screen-list.md": "Wave2: screen-list + screen-flow",
    "screen-flow.md": "Wave2: screen-list + screen-flow",
    "background-logic.md": "Wave2: background-logic",
    "permissions.md": "Wave3: permissions",
    "user-stories.md": "Wave4: user-stories",
    "feature-list.md": "Wave5: feature-list",
}

WAVE_ORDER = [
    "Wave1: route-list",
    "Wave1: data-model",
    "Wave2: screen-list + screen-flow",
    "Wave2: background-logic",
    "Wave3: permissions",
    "Wave4: user-stories",
    "Wave5: feature-list",
]

MANIFEST_FILES = frozenset({
    "package.json", "composer.json", "Gemfile", "pyproject.toml",
    "pom.xml", "build.gradle", "go.mod", "Cargo.toml",
})

# Cascade chains per file type (researcher-03 Q1 table).
CASCADE_CHAINS: dict[str, list[str]] = {
    "route": [
        "Wave1: route-list",
        "Wave2: screen-list + screen-flow",
        "Wave2: background-logic",
        "Wave3: permissions",
        "Wave4: user-stories",
        "Wave5: feature-list",
    ],
    "model": [
        "Wave1: data-model",
        "Wave2: screen-list + screen-flow",
        "Wave2: background-logic",
        "Wave3: permissions",
        "Wave4: user-stories",
        "Wave5: feature-list",
    ],
    "screen": [
        "Wave2: screen-list + screen-flow",
        "Wave2: background-logic",
        "Wave3: permissions",
        "Wave4: user-stories",
        "Wave5: feature-list",
    ],
    "background": [
        "Wave2: background-logic",
        "Wave3: permissions",
        "Wave4: user-stories",
        "Wave5: feature-list",
    ],
    "permission": [
        "Wave3: permissions",
        "Wave4: user-stories",
        "Wave5: feature-list",
    ],
}


def _load_json(path: Path) -> dict | None:
    if not path.is_file():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return None


def _git_diff(since: str, head: str = "HEAD") -> list[tuple[str, str, str | None]]:
    """Return [(status, path, new_path_or_None)] from git diff."""
    r = subprocess.run(
        ["git", "diff", "--name-status", "--diff-filter=AMRD", "-M", f"{since}..{head}"],
        capture_output=True, text=True, timeout=15, check=True,
    )
    rows: list[tuple[str, str, str | None]] = []
    for line in r.stdout.strip().splitlines():
        parts = line.split("\t")
        if len(parts) == 3:
            rows.append((parts[0][0], parts[1], parts[2]))
        elif len(parts) == 2:
            rows.append((parts[0][0], parts[1], None))
    return rows


def _git_sha_reachable(sha: str) -> bool:
    try:
        r = subprocess.run(
            ["git", "merge-base", "--is-ancestor", sha, "HEAD"],
            capture_output=True, timeout=10, check=False,
        )
        return r.returncode == 0
    except (subprocess.TimeoutExpired, FileNotFoundError, OSError):
        return False


def _git_head_sha() -> str:
    r = subprocess.run(
        ["git", "rev-parse", "HEAD"],
        capture_output=True, text=True, timeout=5, check=True,
    )
    return r.stdout.strip()


def _parse_scout_inventory(scout_path: Path) -> dict[str, str]:
    """Parse scout-report.md File Inventory → {path: type}."""
    inventory: dict[str, str] = {}
    if not scout_path.is_file():
        return inventory
    in_section = False
    found_section = False
    for line in scout_path.read_text(encoding="utf-8", errors="replace").splitlines():
        if line.startswith("## File Inventory"):
            in_section = True
            found_section = True
            continue
        if in_section and line.startswith("## "):
            break
        if in_section and "\t" in line:
            parts = line.split("\t", 1)
            if len(parts) == 2:
                inventory[parts[0].strip()] = parts[1].strip()
    if found_section and not inventory:
        print("[WARN] ## File Inventory section found but yielded 0 entries", file=sys.stderr)
    return inventory


def _classify_files(
    diff_rows: list[tuple[str, str, str | None]],
    inventory: dict[str, str],
) -> tuple[dict[str, list[str]], list[str]]:
    """Classify changed files by type. Returns (type_to_paths, unowned_new)."""
    classified: dict[str, list[str]] = {}
    unowned: list[str] = []
    for status, path, new_path in diff_rows:
        effective = new_path or path
        ftype = inventory.get(effective, "other")
        if status in ("A", "R") and effective not in inventory:
            unowned.append(effective)
        classified.setdefault(ftype, []).append(effective)
    return classified, unowned


def _cascade(types_present: set[str]) -> tuple[list[str], str | None]:
    """Compute affected_waves + cascade_chain description. Returns (waves, chain_desc)."""
    if "config" in types_present:
        return [], "FULL (config changed)"

    all_waves: list[str] = []
    chain_parts: list[str] = []
    for ftype in ["route", "model", "screen", "background", "permission"]:
        if ftype in types_present:
            chain = CASCADE_CHAINS[ftype]
            all_waves.extend(chain)
            chain_parts.append(f"{ftype} → {' → '.join(chain)}")

    seen: set[str] = set()
    ordered: list[str] = []
    for w in WAVE_ORDER:
        if w in all_waves and w not in seen:
            seen.add(w)
            ordered.append(w)

    chain_desc = "; ".join(chain_parts) if chain_parts else None
    return ordered, chain_desc


def _resolve_fcodes(
    reverse_index: dict, changed_paths: list[str],
    w5_reran: bool, canonical_path: Path,
) -> list[str]:
    if w5_reran:
        canonical = _load_json(canonical_path)
        if canonical and "features" in canonical:
            return sorted({f["fcode"] for f in canonical["features"]})
        return []
    index = reverse_index.get("index", {})
    fcodes: set[str] = set()
    for p in changed_paths:
        if p in index:
            fcodes.update(index[p])
    return sorted(fcodes)


def _detect_oob(
    state: dict, docs_specs: Path, affected_waves: list[str],
) -> list[str]:
    """Compare current doc SHAs to state. Warn on out-of-band edits for non-affected artifacts."""
    warnings: list[str] = []
    old_shas = state.get("doc_shas", {})
    if not old_shas:
        return warnings
    for fname, old_sha in old_shas.items():
        subject = CORE_ARTIFACT_TO_WAVE_SUBJECT.get(fname)
        if subject and subject in affected_waves:
            continue
        fpath = docs_specs / fname
        if fpath.is_file():
            current = hashlib.sha256(fpath.read_bytes()).hexdigest()
            if current != old_sha:
                warnings.append(f"[OUT_OF_BAND_EDIT] {fname}")
    return warnings


def _atomic_write(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(data, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    os.replace(str(tmp), str(path))


def _build_payload(
    mode: str, affected_waves: list[str], affected_fcodes: list[str],
    w5_reran: bool, cascade_chain: str | None, fallback_reason: str | None,
    fallback_to_full: bool, deleted_files: list[str],
    doc_shas_snapshot: dict[str, str], since_sha: str, head_sha: str,
) -> dict:
    return {
        "affected_fcodes": affected_fcodes,
        "affected_waves": affected_waves,
        "cascade_chain": cascade_chain,
        "deleted_files": deleted_files,
        "doc_shas_snapshot": doc_shas_snapshot,
        "fallback_reason": fallback_reason,
        "fallback_to_full": fallback_to_full,
        "generated_at": os.environ.get("REBUILD_PLANNER_GENERATED_AT") or _dt.datetime.now(_dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "head_sha": head_sha,
        "mode": mode,
        "since_sha": since_sha,
        "w5_reran": w5_reran,
    }


def _compute_doc_shas_snapshot(docs_specs: Path) -> dict[str, str]:
    shas: dict[str, str] = {}
    if not docs_specs.is_dir():
        return shas
    for md in sorted(docs_specs.glob("*.md")):
        if md.is_file():
            shas[md.name] = hashlib.sha256(md.read_bytes()).hexdigest()
    return shas


def _hydrate(plan_dir: Path, docs_specs: Path) -> int:
    """Wave -1 hydrate: copy non-affected artifacts from docs/specs/ to artifacts/."""
    plan_path = plan_dir / "artifacts" / ".incremental-plan.json"
    plan_data = _load_json(plan_path)
    if not plan_data:
        print("[ERROR] .incremental-plan.json not found or unparseable", file=sys.stderr)
        return 1
    if plan_data.get("mode") == "full":
        return 0

    affected_waves = set(plan_data.get("affected_waves", []))
    affected_fcodes = set(plan_data.get("affected_fcodes", []))
    artifacts_dir = plan_dir / "artifacts"
    artifacts_dir.mkdir(parents=True, exist_ok=True)

    missing_sources: list[str] = []

    # Core artifacts: copy if subject NOT in affected_waves
    for fname, subject in CORE_ARTIFACT_TO_WAVE_SUBJECT.items():
        src = docs_specs / fname
        dst = artifacts_dir / fname
        if subject not in affected_waves:
            if not src.is_file():
                missing_sources.append(fname)
            else:
                shutil.copy2(str(src), str(dst))

    # system-overview.md: always copy (never in affected_waves, excluded from cascade)
    so_src = docs_specs / "system-overview.md"
    so_dst = artifacts_dir / "system-overview.md"
    if so_src.is_file():
        shutil.copy2(str(so_src), str(so_dst))
    else:
        missing_sources.append("system-overview.md")

    # _canonical-fcodes.json: always hydrate
    canon_src = docs_specs / "_canonical-fcodes.json"
    canon_dst = artifacts_dir / "_canonical-fcodes.json"
    if canon_src.is_file():
        shutil.copy2(str(canon_src), str(canon_dst))

    # Feature specs: copy non-affected F###
    features_src = docs_specs / "features"
    features_dst = artifacts_dir / "features"
    if features_src.is_dir():
        for fdir in sorted(features_src.iterdir()):
            if not fdir.is_dir():
                continue
            fcode_match = re.match(r"^(F\d{3,4})", fdir.name)
            if not fcode_match:
                continue
            fcode = fcode_match.group(1)
            if fcode not in affected_fcodes:
                spec_src = fdir / "spec.md"
                spec_dst = features_dst / fdir.name / "spec.md"
                if spec_src.is_file():
                    spec_dst.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copy2(str(spec_src), str(spec_dst))

    # First-run guard: missing source → auto-fallback to full
    if missing_sources:
        fallback_reason = f"docs/specs baseline missing — first incremental on fresh repo (missing: {', '.join(missing_sources)})"
        print(f"[INFO] {fallback_reason}", file=sys.stderr)
        plan_data["mode"] = "full"
        plan_data["fallback_reason"] = fallback_reason
        plan_data["fallback_to_full"] = True
        _atomic_write(plan_path, plan_data)
        return 0

    # Update doc_shas_snapshot after hydration
    shas: dict[str, str] = {}
    for md in sorted(artifacts_dir.glob("*.md")):
        if md.is_file():
            shas[md.name] = hashlib.sha256(md.read_bytes()).hexdigest()
    plan_data["doc_shas_snapshot"] = shas
    _atomic_write(plan_path, plan_data)
    return 0


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Cascade-aware incremental planner")
    p.add_argument("--full", action="store_true", help="Force full rebuild")
    p.add_argument("--since", default=None, help="Override base SHA for diff")
    p.add_argument("--dry-run", action="store_true", help="Print decision, no file write")
    p.add_argument("--features", default=None, help="Manual F### override (comma-sep)")
    p.add_argument("--plan-dir", required=True, help="Active plan directory")
    p.add_argument("--docs-specs", required=True, help="Path to docs/specs/")
    p.add_argument("--scout-report", default=None, help="Path to scout-report.md")
    p.add_argument("--out", default=None, help="Output path for .incremental-plan.json")
    p.add_argument("--threshold", type=float, default=None, help="Diff threshold (0.0-1.0)")
    p.add_argument("--hydrate", action="store_true", help="Run Wave -1 hydrate mode")
    return p.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    plan_dir = Path(args.plan_dir).resolve()
    docs_specs = Path(args.docs_specs).resolve()

    if args.hydrate:
        return _hydrate(plan_dir, docs_specs)

    # Mutually-exclusive guard
    if args.full and args.since:
        print("[ERROR] --full and --since are mutually exclusive", file=sys.stderr)
        return 2

    out_path = Path(args.out) if args.out else plan_dir / "artifacts" / ".incremental-plan.json"
    try:
        head_sha = _git_head_sha()
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired, FileNotFoundError) as exc:
        print(f"[ERROR] git rev-parse HEAD failed: {exc}", file=sys.stderr)
        return 1

    # --features passthrough: skip cascade, emit minimal payload
    if args.features:
        fcodes = [f.strip() for f in args.features.split(",") if f.strip()]
        payload = _build_payload(
            mode="incremental", affected_waves=[], affected_fcodes=fcodes,
            w5_reran=False, cascade_chain=None, fallback_reason=None,
            fallback_to_full=False, deleted_files=[],
            doc_shas_snapshot=_compute_doc_shas_snapshot(docs_specs),
            since_sha="", head_sha=head_sha,
        )
        if args.dry_run:
            print(json.dumps(payload, indent=2, sort_keys=True))
        else:
            _atomic_write(out_path, payload)
        print(f"[INFO] mode=incremental waves=0 fcodes={len(fcodes)} fallback=none (--features override)")
        return 0

    # Prereq checks (hard halt conditions 1-3)
    scout_path = Path(args.scout_report) if args.scout_report else plan_dir / "artifacts" / "scout-report.md"
    if not scout_path.is_file():
        print(f"[ERROR] scout-report.md not found: {scout_path}", file=sys.stderr)
        return 1
    canonical_path = plan_dir / "artifacts" / "_canonical-fcodes.json"
    if not canonical_path.is_file():
        canonical_path = docs_specs / "_canonical-fcodes.json"
        if not canonical_path.is_file():
            print(f"[ERROR] _canonical-fcodes.json not found", file=sys.stderr)
            return 1
    ri_path = docs_specs / "_source-to-fcode.json"
    if not ri_path.is_file():
        print(f"[ERROR] _source-to-fcode.json not found: {ri_path}", file=sys.stderr)
        return 1

    reverse_index = _load_json(ri_path) or {}

    # --full flag (condition 9)
    if args.full:
        payload = _build_payload(
            mode="full", affected_waves=list(WAVE_ORDER),
            affected_fcodes=[], w5_reran=True, cascade_chain=None,
            fallback_reason="explicit --full flag", fallback_to_full=False,
            deleted_files=[], doc_shas_snapshot=_compute_doc_shas_snapshot(docs_specs),
            since_sha="", head_sha=head_sha,
        )
        if args.dry_run:
            print(json.dumps(payload, indent=2, sort_keys=True))
        else:
            _atomic_write(out_path, payload)
        print(f"[INFO] mode=full waves={len(WAVE_ORDER)} fcodes=all fallback=explicit_full")
        return 0

    # Load state (condition 4)
    state_path = docs_specs / ".rebuild-state.json"
    state = _load_json(state_path)
    if not state:
        payload = _build_payload(
            mode="full", affected_waves=list(WAVE_ORDER),
            affected_fcodes=[], w5_reran=True, cascade_chain=None,
            fallback_reason="state_missing", fallback_to_full=True,
            deleted_files=[], doc_shas_snapshot=_compute_doc_shas_snapshot(docs_specs),
            since_sha="", head_sha=head_sha,
        )
        if args.dry_run:
            print(json.dumps(payload, indent=2, sort_keys=True))
        else:
            _atomic_write(out_path, payload)
        print("[INFO] mode=full waves=all fcodes=all fallback=state_missing")
        return 0

    since_sha = args.since or state.get("last_rebuild_sha", "")

    # SHA reachability (condition 5)
    if not since_sha or not _git_sha_reachable(since_sha):
        payload = _build_payload(
            mode="full", affected_waves=list(WAVE_ORDER),
            affected_fcodes=[], w5_reran=True, cascade_chain=None,
            fallback_reason="sha_unreachable", fallback_to_full=True,
            deleted_files=[], doc_shas_snapshot=_compute_doc_shas_snapshot(docs_specs),
            since_sha=since_sha, head_sha=head_sha,
        )
        if args.dry_run:
            print(json.dumps(payload, indent=2, sort_keys=True))
        else:
            _atomic_write(out_path, payload)
        print(f"[INFO] mode=full waves=all fcodes=all fallback=sha_unreachable")
        return 0

    # Git diff
    try:
        diff_rows = _git_diff(since_sha, "HEAD")
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired, FileNotFoundError) as exc:
        print(f"[ERROR] git diff failed: {exc}", file=sys.stderr)
        return 1
    all_changed = [r[2] or r[1] for r in diff_rows]
    deleted_files = [r[1] for r in diff_rows if r[0] == "D"]

    # Threshold check (condition 6)
    threshold = args.threshold or float(os.environ.get("REBUILD_INCREMENTAL_THRESHOLD", "0.30"))
    inventory = _parse_scout_inventory(scout_path)
    total_source = len(inventory) if inventory else 0
    if total_source > 0 and len(all_changed) / total_source > threshold:
        payload = _build_payload(
            mode="full", affected_waves=list(WAVE_ORDER),
            affected_fcodes=[], w5_reran=True, cascade_chain=None,
            fallback_reason=f"threshold_exceeded ({len(all_changed)}/{total_source} > {threshold})",
            fallback_to_full=True, deleted_files=deleted_files,
            doc_shas_snapshot=_compute_doc_shas_snapshot(docs_specs),
            since_sha=since_sha, head_sha=head_sha,
        )
        if args.dry_run:
            print(json.dumps(payload, indent=2, sort_keys=True))
        else:
            _atomic_write(out_path, payload)
        print(f"[INFO] mode=full waves=all fcodes=all fallback=threshold_exceeded")
        return 0

    # Manifest check (condition 7)
    manifest_changed = any(Path(p).name in MANIFEST_FILES for p in all_changed)
    if manifest_changed:
        payload = _build_payload(
            mode="full", affected_waves=list(WAVE_ORDER),
            affected_fcodes=[], w5_reran=True,
            cascade_chain="FULL (manifest changed)",
            fallback_reason="manifest_changed", fallback_to_full=True,
            deleted_files=deleted_files,
            doc_shas_snapshot=_compute_doc_shas_snapshot(docs_specs),
            since_sha=since_sha, head_sha=head_sha,
        )
        if args.dry_run:
            print(json.dumps(payload, indent=2, sort_keys=True))
        else:
            _atomic_write(out_path, payload)
        print("[INFO] mode=full waves=all fcodes=all fallback=manifest_changed")
        return 0

    # Classify files
    classified, unowned = _classify_files(diff_rows, inventory)

    # Unowned new source check (condition 8)
    if unowned:
        new_source = [f for f in unowned if not f.startswith(("docs/", "plans/", "tests/", "test/"))]
        if new_source:
            payload = _build_payload(
                mode="full", affected_waves=list(WAVE_ORDER),
                affected_fcodes=[], w5_reran=True, cascade_chain=None,
                fallback_reason=f"unowned_new_source ({', '.join(new_source[:3])})",
                fallback_to_full=True, deleted_files=deleted_files,
                doc_shas_snapshot=_compute_doc_shas_snapshot(docs_specs),
                since_sha=since_sha, head_sha=head_sha,
            )
            if args.dry_run:
                print(json.dumps(payload, indent=2, sort_keys=True))
            else:
                _atomic_write(out_path, payload)
            print(f"[INFO] mode=full waves=all fcodes=all fallback=unowned_new_source")
            return 0

    # Cascade engine
    types_present = set(classified.keys()) - {"other"}
    affected_waves, cascade_chain = _cascade(types_present)

    # config type triggers full
    if cascade_chain and cascade_chain.startswith("FULL"):
        payload = _build_payload(
            mode="full", affected_waves=list(WAVE_ORDER),
            affected_fcodes=[], w5_reran=True, cascade_chain=cascade_chain,
            fallback_reason="config_changed", fallback_to_full=True,
            deleted_files=deleted_files,
            doc_shas_snapshot=_compute_doc_shas_snapshot(docs_specs),
            since_sha=since_sha, head_sha=head_sha,
        )
        if args.dry_run:
            print(json.dumps(payload, indent=2, sort_keys=True))
        else:
            _atomic_write(out_path, payload)
        print("[INFO] mode=full waves=all fcodes=all fallback=config_changed")
        return 0

    w5_reran = "Wave5: feature-list" in affected_waves
    affected_fcodes = _resolve_fcodes(reverse_index, all_changed, w5_reran, canonical_path)

    # OOB-edit detection — fallback to full if non-affected artifacts were edited
    oob_warnings = _detect_oob(state, docs_specs, affected_waves)
    if oob_warnings:
        for w in oob_warnings:
            print(w, file=sys.stderr)
        payload = _build_payload(
            mode="full", affected_waves=list(WAVE_ORDER),
            affected_fcodes=[], w5_reran=True, cascade_chain=cascade_chain,
            fallback_reason="oob_edits_detected", fallback_to_full=True,
            deleted_files=deleted_files,
            doc_shas_snapshot=_compute_doc_shas_snapshot(docs_specs),
            since_sha=since_sha, head_sha=head_sha,
        )
        if args.dry_run:
            print(json.dumps(payload, indent=2, sort_keys=True))
        else:
            _atomic_write(out_path, payload)
        print(f"[INFO] mode=full waves=all fcodes=all fallback=oob_edits_detected ({len(oob_warnings)} edits)")
        return 0

    payload = _build_payload(
        mode="incremental", affected_waves=affected_waves,
        affected_fcodes=affected_fcodes, w5_reran=w5_reran,
        cascade_chain=cascade_chain, fallback_reason=None,
        fallback_to_full=False, deleted_files=deleted_files,
        doc_shas_snapshot=_compute_doc_shas_snapshot(docs_specs),
        since_sha=since_sha, head_sha=head_sha,
    )

    if args.dry_run:
        print(json.dumps(payload, indent=2, sort_keys=True))
    else:
        _atomic_write(out_path, payload)

    print(f"[INFO] mode=incremental waves={len(affected_waves)} fcodes={len(affected_fcodes)} fallback=none")
    return 0


if __name__ == "__main__":
    sys.exit(main())
