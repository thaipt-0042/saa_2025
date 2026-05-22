"""Tests for incremental_planner.py --hydrate mode (Wave -1)."""
import hashlib
import json
import shutil
import sys
from pathlib import Path

import pytest

_TESTS_DIR = Path(__file__).resolve().parent
_SCRIPTS_DIR = _TESTS_DIR.parent
if str(_SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(_SCRIPTS_DIR))

from incremental_planner import _hydrate, CORE_ARTIFACT_TO_WAVE_SUBJECT

CORE_ARTIFACTS = [
    "route-list.md", "data-model.md", "screen-list.md", "screen-flow.md",
    "background-logic.md", "permissions.md", "user-stories.md", "feature-list.md",
]


def _seed_hydrate_env(tmp: Path, affected_waves: list[str], affected_fcodes: list[str]) -> tuple[Path, Path]:
    """Create plan + docs dirs, write .incremental-plan.json, seed docs/specs/."""
    plan_dir = tmp / "plans" / "test"
    artifacts = plan_dir / "artifacts"
    docs_specs = tmp / "docs" / "specs"
    features_src = docs_specs / "features"

    artifacts.mkdir(parents=True)
    docs_specs.mkdir(parents=True)

    # Core artifacts in docs/specs/
    for name in CORE_ARTIFACTS:
        (docs_specs / name).write_text(f"# {name}\ncanonical content\n")
    (docs_specs / "system-overview.md").write_text("# System Overview\nstub\n")

    # Canonical fcodes
    canonical = {
        "generated_at": "2026-05-19T08:00:00Z",
        "features": [
            {"fcode": "F001", "slug": "F001_Auth"},
            {"fcode": "F005", "slug": "F005_Pay"},
        ],
    }
    (docs_specs / "_canonical-fcodes.json").write_text(json.dumps(canonical))

    # Feature specs
    for slug in ["F001_Auth", "F005_Pay"]:
        d = features_src / slug
        d.mkdir(parents=True, exist_ok=True)
        (d / "spec.md").write_text(f"# {slug} spec\n")

    # .incremental-plan.json
    plan_data = {
        "mode": "incremental",
        "affected_waves": affected_waves,
        "affected_fcodes": affected_fcodes,
        "w5_reran": "Wave5: feature-list" in affected_waves,
        "doc_shas_snapshot": {},
    }
    (artifacts / ".incremental-plan.json").write_text(json.dumps(plan_data))

    return plan_dir, docs_specs


class TestHydrateSkipsAffectedWaves:
    def test_skips_route_list_when_affected(self, tmp_path):
        plan_dir, docs_specs = _seed_hydrate_env(
            tmp_path, ["Wave1: route-list"], [])
        _hydrate(plan_dir, docs_specs)
        artifacts = plan_dir / "artifacts"
        # route-list should NOT be copied (wave will regenerate it)
        assert not (artifacts / "route-list.md").exists()
        # data-model should BE copied (not in affected_waves)
        assert (artifacts / "data-model.md").exists()
        assert (artifacts / "data-model.md").read_text() == (docs_specs / "data-model.md").read_text()


class TestHydrateCopiesNonAffected:
    def test_copies_all_when_no_affected(self, tmp_path):
        plan_dir, docs_specs = _seed_hydrate_env(tmp_path, [], [])
        _hydrate(plan_dir, docs_specs)
        artifacts = plan_dir / "artifacts"
        for name in CORE_ARTIFACTS:
            assert (artifacts / name).exists(), f"{name} should be hydrated"
            assert (artifacts / name).read_text() == (docs_specs / name).read_text()

    def test_system_overview_always_copied(self, tmp_path):
        plan_dir, docs_specs = _seed_hydrate_env(
            tmp_path, list(CORE_ARTIFACT_TO_WAVE_SUBJECT.values()), [])
        _hydrate(plan_dir, docs_specs)
        assert (plan_dir / "artifacts" / "system-overview.md").exists()


class TestHydrateIdempotent:
    def test_rerun_produces_same_bytes(self, tmp_path):
        plan_dir, docs_specs = _seed_hydrate_env(tmp_path, [], ["F001"])
        _hydrate(plan_dir, docs_specs)
        first_shas = {}
        for f in (plan_dir / "artifacts").glob("*.md"):
            first_shas[f.name] = hashlib.sha256(f.read_bytes()).hexdigest()

        # Re-read plan to restore mode (hydrate may have modified it)
        plan_data = json.loads((plan_dir / "artifacts" / ".incremental-plan.json").read_text())
        plan_data["mode"] = "incremental"
        (plan_dir / "artifacts" / ".incremental-plan.json").write_text(json.dumps(plan_data))

        _hydrate(plan_dir, docs_specs)
        for f in (plan_dir / "artifacts").glob("*.md"):
            assert first_shas.get(f.name) == hashlib.sha256(f.read_bytes()).hexdigest()


class TestDocShasSnapshotUpdated:
    def test_snapshot_written_after_hydrate(self, tmp_path):
        plan_dir, docs_specs = _seed_hydrate_env(tmp_path, [], [])
        _hydrate(plan_dir, docs_specs)
        plan_data = json.loads((plan_dir / "artifacts" / ".incremental-plan.json").read_text())
        assert "doc_shas_snapshot" in plan_data
        assert len(plan_data["doc_shas_snapshot"]) > 0


class TestFeatureSpecHydrate:
    def test_copies_non_affected_feature_specs(self, tmp_path):
        plan_dir, docs_specs = _seed_hydrate_env(tmp_path, [], ["F001"])
        _hydrate(plan_dir, docs_specs)
        features_dst = plan_dir / "artifacts" / "features"
        # F005 not affected → should be copied
        assert (features_dst / "F005_Pay" / "spec.md").exists()
        # F001 affected → should NOT be copied
        assert not (features_dst / "F001_Auth" / "spec.md").exists()


class TestFirstRunGuard:
    def test_missing_source_auto_fallback_full(self, tmp_path):
        plan_dir, docs_specs = _seed_hydrate_env(
            tmp_path, ["Wave1: route-list"], [])
        # Remove a source artifact that should be hydrated (data-model not in affected)
        (docs_specs / "data-model.md").unlink()
        result = _hydrate(plan_dir, docs_specs)
        assert result == 0
        plan_data = json.loads((plan_dir / "artifacts" / ".incremental-plan.json").read_text())
        assert plan_data["mode"] == "full"
        assert "baseline missing" in plan_data["fallback_reason"]

    def test_all_sources_present_stays_incremental(self, tmp_path):
        plan_dir, docs_specs = _seed_hydrate_env(tmp_path, [], [])
        result = _hydrate(plan_dir, docs_specs)
        assert result == 0
        plan_data = json.loads((plan_dir / "artifacts" / ".incremental-plan.json").read_text())
        assert plan_data["mode"] == "incremental"


class TestFullModeNoOp:
    def test_full_mode_skips_hydrate(self, tmp_path):
        plan_dir, docs_specs = _seed_hydrate_env(tmp_path, [], [])
        # Overwrite mode to full
        plan_data = json.loads((plan_dir / "artifacts" / ".incremental-plan.json").read_text())
        plan_data["mode"] = "full"
        (plan_dir / "artifacts" / ".incremental-plan.json").write_text(json.dumps(plan_data))
        result = _hydrate(plan_dir, docs_specs)
        assert result == 0
        # No artifacts copied (full mode = no-op for hydrate)
        md_files = list((plan_dir / "artifacts").glob("*.md"))
        assert len(md_files) == 0
