#!/usr/bin/env python3
"""Wave 9 pre-promote — copy artifacts to docs/specs/, write system-overview stub,
archive review reports, GC archives, compute sha256 manifest.

Exit codes: 0 = success, 2 = arg/IO error.
Stdlib only.
"""
from __future__ import annotations

import argparse
import datetime as _dt
import hashlib
import os
import re
import shutil
import sys
import tempfile

CORE_ARTIFACTS = [
    "route-list.md",
    "data-model.md",
    "screen-list.md",
    "screen-flow.md",
    "background-logic.md",
    "permissions.md",
    "user-stories.md",
    "feature-list.md",
]


def _resolve_guarded(path: str, base: str) -> str:
    resolved = os.path.realpath(os.path.abspath(path))
    base_resolved = os.path.realpath(os.path.abspath(base))
    if os.path.commonpath([resolved, base_resolved]) != base_resolved:
        raise ValueError(f"Path traversal detected: {path!r} escapes {base!r}")
    return resolved


def _atomic_copy(src: str, dst: str) -> None:
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    with open(src, "rb") as f:
        data = f.read()
    dir_ = os.path.dirname(dst) or "."
    fd, tmp = tempfile.mkstemp(dir=dir_, prefix=".pd_tmp_")
    try:
        with os.fdopen(fd, "wb") as f:
            f.write(data)
        os.rename(tmp, dst)
    except Exception:
        try:
            os.unlink(tmp)
        except OSError:
            pass
        raise


def _atomic_write_text(dst: str, content: str) -> None:
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    dir_ = os.path.dirname(dst) or "."
    fd, tmp = tempfile.mkstemp(dir=dir_, prefix=".pd_tmp_")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            f.write(content)
        os.rename(tmp, dst)
    except Exception:
        try:
            os.unlink(tmp)
        except OSError:
            pass
        raise


def _read_stub_from_mapping(script_dir: str) -> str:
    mapping_path = os.path.join(script_dir, "..", "..", "_shared", "docs-canonical-mapping.md")
    mapping_path = os.path.realpath(mapping_path)
    with open(mapping_path, encoding="utf-8") as f:
        content = f.read()
    # Find ## Stub Rule section, then first "> " blockquote line
    m = re.search(r"^## Stub Rule\s*\n(.*?)(?=^## |\Z)", content, re.MULTILINE | re.DOTALL)
    if not m:
        raise ValueError("## Stub Rule section not found in docs-canonical-mapping.md")
    stub_section = m.group(1)
    bq = re.search(r"^> (.+)$", stub_section, re.MULTILINE)
    if not bq:
        raise ValueError("No blockquote line found in ## Stub Rule section")
    return bq.group(1).strip()


def _sha256_file(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def _utc_archive_tag() -> str:
    now = _dt.datetime.now(_dt.timezone.utc)
    return now.strftime("%Y-%m-%dT%H-%M-%SZ")


def promote(args: argparse.Namespace) -> None:
    cwd = os.getcwd()

    try:
        plan_dir = _resolve_guarded(args.plan_dir, cwd)
        docs_specs = _resolve_guarded(args.docs_specs, cwd)
    except ValueError as e:
        print(f"error: {e}", file=sys.stderr)
        sys.exit(2)

    artifacts_dir = os.path.join(plan_dir, "artifacts")
    promoted_files: list[str] = []  # absolute dst paths

    # ── Step 1: Promote artifacts ─────────────────────────────────────────────
    if args.mode == "full":
        filenames_to_promote = CORE_ARTIFACTS
        fcode_dirs: list[str] = []
        features_src = os.path.join(artifacts_dir, "features")
        if os.path.isdir(features_src):
            fcode_dirs = [
                d for d in os.listdir(features_src)
                if os.path.isdir(os.path.join(features_src, d))
            ]
    else:
        filenames_to_promote = [f.strip() for f in (args.affected_artifacts or "").split(",") if f.strip()]
        raw_fcodes = [c.strip() for c in (args.affected_fcodes or "").split(",") if c.strip()]
        fcode_dirs = [fc for fc in raw_fcodes if re.fullmatch(r"F\d{3}(?:_\w+)?", fc)]
        dropped = [fc for fc in raw_fcodes if fc not in set(fcode_dirs)]
        if dropped:
            print(f"[WARN] {len(dropped)} fcode(s) failed validation: {dropped}", file=sys.stderr)

    for fname in filenames_to_promote:
        if fname == "system-overview.md":
            continue  # handled in step 2
        src = os.path.join(artifacts_dir, fname)
        dst = os.path.join(docs_specs, fname)
        if not os.path.isfile(src):
            print(f"warning: source not found, skipping: {src}", file=sys.stderr)
            continue
        try:
            _atomic_copy(src, dst)
            promoted_files.append(dst)
        except OSError as e:
            print(f"error: cannot copy {src} -> {dst}: {e}", file=sys.stderr)
            sys.exit(2)

    for fcode in fcode_dirs:
        src_fdir = os.path.join(artifacts_dir, "features", fcode)
        if not os.path.isdir(src_fdir):
            features_src_dir = os.path.join(artifacts_dir, "features")
            if os.path.isdir(features_src_dir):
                matches = [d for d in os.listdir(features_src_dir) if d.startswith(fcode + "_") and os.path.isdir(os.path.join(features_src_dir, d))]
                if len(matches) == 1:
                    fcode = matches[0]
                    src_fdir = os.path.join(artifacts_dir, "features", fcode)
            if not os.path.isdir(src_fdir):
                print(f"warning: feature dir not found, skipping: {src_fdir}", file=sys.stderr)
                continue
        dst_fdir = os.path.join(docs_specs, "features", fcode)
        if not os.path.isdir(src_fdir):
            continue
        for dirpath, _, filenames in os.walk(src_fdir):
            for fname in filenames:
                src_file = os.path.join(dirpath, fname)
                rel = os.path.relpath(src_file, src_fdir)
                dst_file = os.path.join(dst_fdir, rel)
                try:
                    _atomic_copy(src_file, dst_file)
                    promoted_files.append(dst_file)
                except OSError as e:
                    print(f"error: cannot copy {src_file} -> {dst_file}: {e}", file=sys.stderr)
                    sys.exit(2)

    # ── Step 2: Write system-overview stub ───────────────────────────────────
    script_dir = os.path.dirname(os.path.realpath(__file__))
    try:
        stub_text = _read_stub_from_mapping(script_dir)
    except (OSError, ValueError) as e:
        print(f"error: cannot read stub from docs-canonical-mapping.md: {e}", file=sys.stderr)
        sys.exit(2)

    stub_dst = os.path.join(docs_specs, "system-overview.md")
    try:
        _atomic_write_text(stub_dst, stub_text + "\n")
        promoted_files.append(stub_dst)
    except OSError as e:
        print(f"error: cannot write system-overview stub: {e}", file=sys.stderr)
        sys.exit(2)

    # ── Step 3: Archive review reports ───────────────────────────────────────
    archive_tag = _utc_archive_tag()
    archive_dir = os.path.join(docs_specs, ".review-archive", archive_tag)
    os.makedirs(archive_dir, exist_ok=True)

    review_candidates = ["core-review-report.md", "review-report.md"]
    # also glob feature-review-batch-*.md
    if os.path.isdir(artifacts_dir):
        for name in os.listdir(artifacts_dir):
            if name.startswith("feature-review-batch-") and name.endswith(".md"):
                review_candidates.append(name)

    for rname in review_candidates:
        rsrc = os.path.join(artifacts_dir, rname)
        if not os.path.isfile(rsrc):
            continue
        rdst = os.path.join(archive_dir, rname)
        try:
            _atomic_copy(rsrc, rdst)
        except OSError as e:
            print(f"warning: cannot archive {rname}: {e}", file=sys.stderr)

    # ── Step 4: Archive GC (keep only 5 newest) ──────────────────────────────
    review_archive_root = os.path.join(docs_specs, ".review-archive")
    if os.path.isdir(review_archive_root):
        subdirs = sorted([
            d for d in os.listdir(review_archive_root)
            if os.path.isdir(os.path.join(review_archive_root, d))
        ])
        excess = len(subdirs) - 5
        for old in subdirs[:excess]:
            try:
                shutil.rmtree(os.path.join(review_archive_root, old))
            except OSError as e:
                print(f"warning: cannot remove old archive {old}: {e}", file=sys.stderr)

    # ── Step 5: Compute sha256 manifest ──────────────────────────────────────
    manifest_lines: list[str] = []
    for dst_abs in promoted_files:
        if not os.path.isfile(dst_abs):
            continue
        digest = _sha256_file(dst_abs)
        relpath = os.path.relpath(dst_abs, cwd)
        manifest_lines.append(f"{digest}  {relpath}")

    manifest_path = os.path.join(artifacts_dir, "_promoted-sha256.txt")
    try:
        _atomic_write_text(manifest_path, "\n".join(manifest_lines) + "\n" if manifest_lines else "")
    except OSError as e:
        print(f"error: cannot write sha256 manifest: {e}", file=sys.stderr)
        sys.exit(2)

    print(f"promoted {len(promoted_files)} file(s); manifest: {manifest_path}")


def main() -> None:
    p = argparse.ArgumentParser(
        description="Wave 9 pre-promote: copy artifacts to docs/specs/, write stub, archive, GC, manifest."
    )
    p.add_argument("--plan-dir", required=True, help="Path to active plan directory")
    p.add_argument("--docs-specs", default="docs/specs", help="Target docs/specs/ path (default: docs/specs)")
    p.add_argument("--mode", required=True, choices=["full", "incremental"],
                   help="Promotion mode: full or incremental")
    p.add_argument("--affected-artifacts", default=None,
                   help="Comma-separated filenames to promote (incremental mode)")
    p.add_argument("--affected-fcodes", default=None,
                   help="Comma-separated F### codes to promote (incremental mode)")
    args = p.parse_args()
    promote(args)


if __name__ == "__main__":
    main()
