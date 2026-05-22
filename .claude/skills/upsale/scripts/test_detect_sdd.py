"""Tests for upsale Step 1 SDD detection script."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

import pytest

SCRIPT = Path(__file__).resolve().parent / "detect_sdd.py"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _run(repo_root: Path, output_path: Path) -> subprocess.CompletedProcess:
    return subprocess.run(
        [sys.executable, str(SCRIPT),
         "--repo-root", str(repo_root),
         "--output-path", str(output_path)],
        capture_output=True, text=True, check=False,
    )


def _read_json(p: Path) -> dict:
    return json.loads(p.read_text(encoding="utf-8"))


# ---------------------------------------------------------------------------
# Library-level tests
# ---------------------------------------------------------------------------

from detect_sdd_lib import (  # noqa: E402
    Signal,
    classify,
    primary_signals,
    resolve_specs_root,
    secondary_categories,
    secondary_signals,
)


def test_no_signals_returns_false(tmp_path: Path) -> None:
    (tmp_path / "README.md").write_text("hello")
    assert primary_signals(tmp_path) == []
    assert secondary_signals(tmp_path) == []
    assert classify([], []) is False
    assert resolve_specs_root(tmp_path) == ""


def test_primary_specs_dir_with_md_fires(tmp_path: Path) -> None:
    (tmp_path / "specs").mkdir()
    (tmp_path / "specs" / "feature-list.md").write_text("# FeatureList")
    hits = primary_signals(tmp_path)
    assert any(s.kind == "specs-dir" and s.path == "specs/" for s in hits)
    assert classify(hits, []) is True
    assert resolve_specs_root(tmp_path) == "specs/"


def test_primary_dotspecify_dir_with_any_file_fires(tmp_path: Path) -> None:
    (tmp_path / ".specify").mkdir()
    (tmp_path / ".specify" / "config.toml").write_text("")
    hits = primary_signals(tmp_path)
    assert any(s.path == ".specify/" for s in hits)
    assert classify(hits, []) is True


def test_primary_root_spec_file_fires(tmp_path: Path) -> None:
    (tmp_path / "SPECIFICATION.md").write_text("...")
    hits = primary_signals(tmp_path)
    assert any(s.kind == "spec-file" and s.path == "SPECIFICATION.md" for s in hits)
    assert classify(hits, []) is True


def test_one_secondary_only_returns_false(tmp_path: Path) -> None:
    # Just spec-kit prefix filename under docs/ -> only secondary category #1 fires.
    docs = tmp_path / "docs"
    docs.mkdir()
    (docs / "feature-billing.md").write_text("# Billing")
    secondary = secondary_signals(tmp_path)
    assert secondary_categories(secondary) == 1
    assert classify([], secondary) is False


def test_two_distinct_secondary_categories_fires(tmp_path: Path) -> None:
    docs = tmp_path / "docs"
    docs.mkdir()
    # Category 1: spec-kit filename prefix.
    (docs / "feature-foo.md").write_text("# Foo")
    # Category 2: spec-artifact heading keyword.
    (docs / "design.md").write_text("# UserStories\nbody")
    secondary = secondary_signals(tmp_path)
    assert secondary_categories(secondary) >= 2
    assert classify([], secondary) is True


def test_heading_keyword_found_in_h2_after_h1_title(tmp_path: Path) -> None:
    # Regression: previously _heading_keyword_signals broke out of the line
    # loop after the FIRST `#` line regardless of match, so standard markdown
    # (H1 title + H2 section) was silently skipped.
    docs = tmp_path / "docs"
    docs.mkdir()
    (docs / "spec.md").write_text("# Spec Document\n\n## FeatureList\n\nbody")
    secondary = secondary_signals(tmp_path)
    hits = [s for s in secondary if s.path == "docs/spec.md"]
    assert hits, "expected heading-keyword signal from H2 after H1"
    assert hits[0].kind == "feature-list"


def test_tooling_marker_in_claude_md_fires_third_category(tmp_path: Path) -> None:
    (tmp_path / "CLAUDE.md").write_text("Run /sk:rebuild-spec on the repo.")
    secondary = secondary_signals(tmp_path)
    tooling_hit = [s for s in secondary if s.path.startswith("CLAUDE.md:")]
    assert tooling_hit, "expected tooling-marker signal from CLAUDE.md"


def test_plan_dir_signal_requires_phase_and_keyword_bar(tmp_path: Path) -> None:
    pd = tmp_path / "plans" / "260101-sample"
    pd.mkdir(parents=True)
    (pd / "phase-01.md").write_text("...")
    # Below the keyword bar: only 1 distinct -> NO signal.
    (pd / "plan.md").write_text("# Plan\nThis touches the FeatureList.")
    assert not [s for s in secondary_signals(tmp_path) if s.path.startswith("plans/")]

    # Above bar: 2 distinct keywords -> signal fires.
    (pd / "plan.md").write_text("# Plan\nTouches FeatureList and UserStories.")
    fired = [s for s in secondary_signals(tmp_path) if s.path.startswith("plans/")]
    assert fired


def test_specs_root_priority_specs_over_docs_specs(tmp_path: Path) -> None:
    (tmp_path / "specs").mkdir()
    (tmp_path / "specs" / "x.md").write_text("# x")
    (tmp_path / "docs" / "specs").mkdir(parents=True)
    (tmp_path / "docs" / "specs" / "y.md").write_text("# y")
    assert resolve_specs_root(tmp_path) == "specs/"


def test_specs_root_empty_when_no_signals(tmp_path: Path) -> None:
    assert resolve_specs_root(tmp_path) == ""


def test_prune_dirs_not_descended(tmp_path: Path) -> None:
    nm = tmp_path / "node_modules" / "specs"
    nm.mkdir(parents=True)
    (nm / "spec.md").write_text("# x")
    # No specs/ at root, only inside node_modules -> nothing.
    assert primary_signals(tmp_path) == []


# ---------------------------------------------------------------------------
# CLI-level tests
# ---------------------------------------------------------------------------

def test_cli_writes_valid_json_and_status_done(tmp_path: Path) -> None:
    (tmp_path / "specs").mkdir()
    (tmp_path / "specs" / "feature-list.md").write_text("# FeatureList")
    output = tmp_path / "out" / "sdd.json"

    res = _run(tmp_path, output)
    assert res.returncode == 0, res.stderr
    assert "Status: DONE" in res.stdout
    assert "done: step-1" in res.stdout

    payload = _read_json(output)
    assert payload["isSDD"] is True
    assert payload["specsRoot"] == "specs/"
    assert isinstance(payload["signals"], list) and payload["signals"]


def test_cli_idempotency_skips_when_output_exists(tmp_path: Path) -> None:
    (tmp_path / "specs").mkdir()
    (tmp_path / "specs" / "x.md").write_text("# x")
    output = tmp_path / "sdd.json"
    output.write_text('{"isSDD": false, "signals": [], "specsRoot": ""}')

    res = _run(tmp_path, output)
    assert res.returncode == 0
    assert "skip: step-1" in res.stdout
    # File unchanged.
    assert _read_json(output)["isSDD"] is False


def test_cli_writes_false_when_no_signals(tmp_path: Path) -> None:
    (tmp_path / "README.md").write_text("nothing here")
    output = tmp_path / "sdd.json"

    res = _run(tmp_path, output)
    assert res.returncode == 0
    payload = _read_json(output)
    assert payload["isSDD"] is False
    assert payload["specsRoot"] == ""
    assert payload["signals"] == []


def test_signal_to_dict_shape() -> None:
    s = Signal(kind="specs-dir", path="specs/", weight=3)
    assert s.to_dict() == {"kind": "specs-dir", "path": "specs/", "weight": 3}
