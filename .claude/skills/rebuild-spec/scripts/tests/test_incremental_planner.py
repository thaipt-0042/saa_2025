"""Tests for incremental_planner.py — cascade engine, fallback table, planner logic."""
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

import pytest

_TESTS_DIR = Path(__file__).resolve().parent
_SCRIPTS_DIR = _TESTS_DIR.parent
if str(_SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(_SCRIPTS_DIR))

from incremental_planner import (
    CORE_ARTIFACT_TO_WAVE_SUBJECT,
    WAVE_ORDER,
    _build_payload,
    _cascade,
    _classify_files,
    _detect_oob,
    _parse_scout_inventory,
    _resolve_fcodes,
)

FIXTURES_DIR = _TESTS_DIR / "fixtures"
INCREMENTAL_FIXTURES = FIXTURES_DIR / "incremental"
PLANNER_SCRIPT = _SCRIPTS_DIR / "incremental_planner.py"
PYTHON = sys.executable


def _init_git_repo(d: Path, initial_sha: str | None = None) -> str:
    """Create a git repo with one commit; return HEAD SHA."""
    subprocess.run(["git", "init", str(d)], capture_output=True, check=True)
    subprocess.run(["git", "-C", str(d), "config", "user.email", "test@test.com"], capture_output=True, check=True)
    subprocess.run(["git", "-C", str(d), "config", "user.name", "Test"], capture_output=True, check=True)
    (d / "init.txt").write_text("init")
    subprocess.run(["git", "-C", str(d), "add", "."], capture_output=True, check=True)
    subprocess.run(["git", "-C", str(d), "commit", "-m", "init"], capture_output=True, check=True)
    r = subprocess.run(["git", "-C", str(d), "rev-parse", "HEAD"], capture_output=True, text=True, check=True)
    return r.stdout.strip()


def _seed_planner_env(tmp: Path) -> dict:
    """Create the full planner input environment. Returns paths dict."""
    plan_dir = tmp / "plans" / "test-plan"
    artifacts = plan_dir / "artifacts"
    docs_specs = tmp / "docs" / "specs"
    features_dir = docs_specs / "features" / "F001_Auth"

    artifacts.mkdir(parents=True)
    docs_specs.mkdir(parents=True)
    features_dir.mkdir(parents=True)

    # Scout report
    shutil.copy(INCREMENTAL_FIXTURES / "synthetic-scout-report.md", artifacts / "scout-report.md")
    # Canonical fcodes
    canonical = {
        "generated_at": "2026-05-19T08:00:00Z",
        "plan": "test-plan",
        "features": [
            {"fcode": "F001", "slug": "F001_Auth", "name": "Auth", "priority": "P0", "type": "ui", "related": {}},
            {"fcode": "F005", "slug": "F005_Pay", "name": "Pay", "priority": "P1", "type": "ui", "related": {}},
        ],
    }
    (artifacts / "_canonical-fcodes.json").write_text(json.dumps(canonical))
    # Also in docs/specs for prereq check
    (docs_specs / "_canonical-fcodes.json").write_text(json.dumps(canonical))
    # Reverse index
    shutil.copy(INCREMENTAL_FIXTURES / "synthetic-reverse-index.json", docs_specs / "_source-to-fcode.json")
    # Core artifact stubs
    for name in ["route-list.md", "data-model.md", "background-logic.md"]:
        (docs_specs / name).write_text(f"# {name}\nstub content\n")
    # Feature spec
    (features_dir / "spec.md").write_text("# F001 Auth spec\n")

    return {
        "plan_dir": str(plan_dir),
        "docs_specs": str(docs_specs),
        "scout_report": str(artifacts / "scout-report.md"),
        "out": str(artifacts / ".incremental-plan.json"),
    }


class TestParseScoutInventory:
    def test_parses_fixture(self):
        inv = _parse_scout_inventory(INCREMENTAL_FIXTURES / "synthetic-scout-report.md")
        assert inv["api/app/Http/Controllers/AuthController.php"] == "route"
        assert inv["api/app/Models/User.php"] == "model"
        assert inv["web/src/pages/Login.vue"] == "screen"
        assert inv["api/app/Jobs/SendEmail.php"] == "background"
        assert inv["api/app/Policies/SurveyPolicy.php"] == "permission"
        assert inv["api/config/app.php"] == "config"
        assert inv["api/app/Helpers/StringHelper.php"] == "other"

    def test_missing_file_returns_empty(self, tmp_path):
        assert _parse_scout_inventory(tmp_path / "nope.md") == {}


class TestClassifyFiles:
    def test_classifies_by_inventory(self):
        inv = {"src/route.php": "route", "src/model.py": "model"}
        diff = [("M", "src/route.php", None), ("M", "src/model.py", None)]
        classified, unowned = _classify_files(diff, inv)
        assert "route" in classified
        assert "model" in classified
        assert unowned == []

    def test_new_file_not_in_inventory(self):
        diff = [("A", "src/new.py", None)]
        classified, unowned = _classify_files(diff, {})
        assert "src/new.py" in unowned

    def test_rename_uses_new_path(self):
        inv = {"new/file.ts": "screen"}
        diff = [("R", "old/file.ts", "new/file.ts")]
        classified, unowned = _classify_files(diff, inv)
        assert "screen" in classified


class TestCascade:
    def test_route_triggers_full_chain(self):
        waves, chain = _cascade({"route"})
        assert "Wave1: route-list" in waves
        assert "Wave5: feature-list" in waves
        assert len(waves) == 6

    def test_model_triggers_full_chain(self):
        waves, _ = _cascade({"model"})
        assert "Wave1: data-model" in waves
        assert "Wave5: feature-list" in waves

    def test_screen_triggers_from_w2(self):
        waves, _ = _cascade({"screen"})
        assert "Wave2: screen-list + screen-flow" in waves
        assert "Wave1: route-list" not in waves

    def test_background_triggers_from_w2bg(self):
        waves, _ = _cascade({"background"})
        assert "Wave2: background-logic" in waves
        assert "Wave2: screen-list + screen-flow" not in waves

    def test_permission_triggers_from_w3(self):
        waves, _ = _cascade({"permission"})
        assert "Wave3: permissions" in waves
        assert "Wave2: background-logic" not in waves

    def test_config_returns_full_sentinel(self):
        waves, chain = _cascade({"config"})
        assert waves == []
        assert "FULL" in chain

    def test_other_only_returns_empty(self):
        waves, chain = _cascade({"other"})
        assert waves == []
        assert chain is None

    def test_mixed_types_union(self):
        waves, _ = _cascade({"route", "permission"})
        assert "Wave1: route-list" in waves
        assert "Wave3: permissions" in waves

    def test_order_matches_wave_order(self):
        waves, _ = _cascade({"route", "screen"})
        indices = [WAVE_ORDER.index(w) for w in waves]
        assert indices == sorted(indices)


class TestResolveFcodes:
    def test_w5_reran_returns_all_canonical(self, tmp_path):
        canonical = {
            "features": [
                {"fcode": "F001", "slug": "F001_Auth"},
                {"fcode": "F005", "slug": "F005_Pay"},
            ]
        }
        cp = tmp_path / "_canonical-fcodes.json"
        cp.write_text(json.dumps(canonical))
        result = _resolve_fcodes({}, [], True, cp)
        assert result == ["F001", "F005"]

    def test_w5_not_reran_uses_reverse_index(self, tmp_path):
        ri = {"index": {"src/auth.php": ["F001"], "src/pay.php": ["F005"]}}
        result = _resolve_fcodes(ri, ["src/auth.php"], False, tmp_path / "nope.json")
        assert result == ["F001"]

    def test_empty_paths_returns_empty(self, tmp_path):
        ri = {"index": {"src/auth.php": ["F001"]}}
        result = _resolve_fcodes(ri, [], False, tmp_path / "nope.json")
        assert result == []


class TestDetectOob:
    def test_mismatch_emits_warning(self, tmp_path):
        (tmp_path / "route-list.md").write_text("changed content")
        state = {"doc_shas": {"route-list.md": "0000000000000000000000000000000000000000000000000000000000000000"}}
        warnings = _detect_oob(state, tmp_path, [])
        assert any("route-list.md" in w for w in warnings)

    def test_affected_artifact_skipped(self, tmp_path):
        (tmp_path / "route-list.md").write_text("changed")
        state = {"doc_shas": {"route-list.md": "0000"}}
        warnings = _detect_oob(state, tmp_path, ["Wave1: route-list"])
        assert len(warnings) == 0

    def test_no_doc_shas_returns_empty(self, tmp_path):
        assert _detect_oob({}, tmp_path, []) == []


class TestFallbackConditions:
    """E2E tests via subprocess — one per fallback condition."""

    def test_cond1_scout_missing(self, tmp_path):
        env = _seed_planner_env(tmp_path)
        os.remove(env["scout_report"])
        r = subprocess.run(
            [PYTHON, str(PLANNER_SCRIPT), "--plan-dir", env["plan_dir"],
             "--docs-specs", env["docs_specs"], "--scout-report", str(tmp_path / "nope.md"),
             "--out", env["out"]],
            capture_output=True, text=True, cwd=str(tmp_path),
        )
        assert r.returncode == 1

    def test_cond2_canonical_missing(self, tmp_path):
        env = _seed_planner_env(tmp_path)
        os.remove(str(Path(env["docs_specs"]) / "_canonical-fcodes.json"))
        os.remove(str(Path(env["plan_dir"]) / "artifacts" / "_canonical-fcodes.json"))
        r = subprocess.run(
            [PYTHON, str(PLANNER_SCRIPT), "--plan-dir", env["plan_dir"],
             "--docs-specs", env["docs_specs"], "--out", env["out"]],
            capture_output=True, text=True, cwd=str(tmp_path),
        )
        assert r.returncode == 1

    def test_cond3_reverse_index_missing(self, tmp_path):
        env = _seed_planner_env(tmp_path)
        os.remove(str(Path(env["docs_specs"]) / "_source-to-fcode.json"))
        r = subprocess.run(
            [PYTHON, str(PLANNER_SCRIPT), "--plan-dir", env["plan_dir"],
             "--docs-specs", env["docs_specs"], "--out", env["out"]],
            capture_output=True, text=True, cwd=str(tmp_path),
        )
        assert r.returncode == 1

    def test_cond4_state_missing_fallback_full(self, tmp_path):
        env = _seed_planner_env(tmp_path)
        sha = _init_git_repo(tmp_path)
        r = subprocess.run(
            [PYTHON, str(PLANNER_SCRIPT), "--plan-dir", env["plan_dir"],
             "--docs-specs", env["docs_specs"], "--out", env["out"]],
            capture_output=True, text=True, cwd=str(tmp_path),
        )
        assert r.returncode == 0
        payload = json.loads(Path(env["out"]).read_text())
        assert payload["mode"] == "full"
        assert payload["fallback_reason"] == "state_missing"

    def test_cond5_sha_unreachable(self, tmp_path):
        """Cond5 — state references a SHA that doesn't exist in git history → mode=full, fallback=sha_unreachable."""
        env = _seed_planner_env(tmp_path)
        _init_git_repo(tmp_path)
        # All-zeros SHA will never be reachable in any real git repo
        bad_sha = "0000000000000000000000000000000000000000"
        state = {"last_rebuild_sha": bad_sha, "mode": "full", "rebuilt_at": "2026-05-20T08:00:00Z"}
        (Path(env["docs_specs"]) / ".rebuild-state.json").write_text(json.dumps(state))
        r = subprocess.run(
            [PYTHON, str(PLANNER_SCRIPT), "--plan-dir", env["plan_dir"],
             "--docs-specs", env["docs_specs"], "--out", env["out"]],
            capture_output=True, text=True, cwd=str(tmp_path),
        )
        assert r.returncode == 0
        payload = json.loads(Path(env["out"]).read_text())
        assert payload["mode"] == "full"
        assert payload["fallback_reason"] == "sha_unreachable"

    def test_cond6_threshold_exceeded(self, tmp_path):
        env = _seed_planner_env(tmp_path)
        sha = _init_git_repo(tmp_path)
        state = {"last_rebuild_sha": sha, "mode": "full", "rebuilt_at": "2026-05-19T08:00:00Z", "fcode_index_sha": "x"}
        (Path(env["docs_specs"]) / ".rebuild-state.json").write_text(json.dumps(state))
        # Add many files to exceed threshold
        for i in range(20):
            (tmp_path / f"file{i}.txt").write_text(f"content{i}")
        subprocess.run(["git", "-C", str(tmp_path), "add", "."], capture_output=True, check=True)
        subprocess.run(["git", "-C", str(tmp_path), "commit", "-m", "bulk"], capture_output=True, check=True)
        r = subprocess.run(
            [PYTHON, str(PLANNER_SCRIPT), "--plan-dir", env["plan_dir"],
             "--docs-specs", env["docs_specs"], "--out", env["out"],
             "--threshold", "0.01"],
            capture_output=True, text=True, cwd=str(tmp_path),
        )
        assert r.returncode == 0
        payload = json.loads(Path(env["out"]).read_text())
        assert payload["mode"] == "full"
        assert "threshold" in payload["fallback_reason"]

    def test_cond7_manifest_changed(self, tmp_path):
        """Cond7 — diff includes a manifest file (package.json) → mode=full, fallback=manifest_changed."""
        env = _seed_planner_env(tmp_path)
        sha = _init_git_repo(tmp_path)
        state = {"last_rebuild_sha": sha, "mode": "full", "rebuilt_at": "2026-05-20T08:00:00Z"}
        (Path(env["docs_specs"]) / ".rebuild-state.json").write_text(json.dumps(state))
        # Commit a package.json so it appears in the diff since `sha`
        (tmp_path / "package.json").write_text('{"name": "test", "version": "1.0.0"}')
        subprocess.run(["git", "-C", str(tmp_path), "add", "."], capture_output=True, check=True)
        subprocess.run(["git", "-C", str(tmp_path), "commit", "-m", "add manifest"], capture_output=True, check=True)
        r = subprocess.run(
            [PYTHON, str(PLANNER_SCRIPT), "--plan-dir", env["plan_dir"],
             "--docs-specs", env["docs_specs"], "--out", env["out"]],
            capture_output=True, text=True, cwd=str(tmp_path),
        )
        assert r.returncode == 0
        payload = json.loads(Path(env["out"]).read_text())
        assert payload["mode"] == "full"
        assert payload["fallback_reason"] == "manifest_changed"

    def test_cond8_unowned_new_source(self, tmp_path):
        """Cond8 — diff includes a new file (status A) not in scout-report inventory → mode=full, fallback=unowned_new_source."""
        env = _seed_planner_env(tmp_path)
        sha = _init_git_repo(tmp_path)
        state = {"last_rebuild_sha": sha, "mode": "full", "rebuilt_at": "2026-05-20T08:00:00Z"}
        (Path(env["docs_specs"]) / ".rebuild-state.json").write_text(json.dumps(state))
        # Commit a new source file not present in the synthetic scout-report inventory
        new_src = tmp_path / "api" / "app" / "Http" / "Controllers" / "NewController.php"
        new_src.parent.mkdir(parents=True, exist_ok=True)
        new_src.write_text("<?php class NewController {}")
        subprocess.run(["git", "-C", str(tmp_path), "add", "."], capture_output=True, check=True)
        subprocess.run(["git", "-C", str(tmp_path), "commit", "-m", "add new controller"], capture_output=True, check=True)
        r = subprocess.run(
            [PYTHON, str(PLANNER_SCRIPT), "--plan-dir", env["plan_dir"],
             "--docs-specs", env["docs_specs"], "--out", env["out"]],
            capture_output=True, text=True, cwd=str(tmp_path),
        )
        assert r.returncode == 0
        payload = json.loads(Path(env["out"]).read_text())
        assert payload["mode"] == "full"
        assert "unowned_new_source" in payload["fallback_reason"]

    def test_cond9_full_flag(self, tmp_path):
        env = _seed_planner_env(tmp_path)
        _init_git_repo(tmp_path)
        r = subprocess.run(
            [PYTHON, str(PLANNER_SCRIPT), "--plan-dir", env["plan_dir"],
             "--docs-specs", env["docs_specs"], "--out", env["out"], "--full"],
            capture_output=True, text=True, cwd=str(tmp_path),
        )
        assert r.returncode == 0
        payload = json.loads(Path(env["out"]).read_text())
        assert payload["mode"] == "full"
        assert "explicit" in payload["fallback_reason"]


class TestMutuallyExclusiveFlags:
    def test_full_and_since_exit_2(self, tmp_path):
        env = _seed_planner_env(tmp_path)
        r = subprocess.run(
            [PYTHON, str(PLANNER_SCRIPT), "--plan-dir", env["plan_dir"],
             "--docs-specs", env["docs_specs"], "--full", "--since", "abc123"],
            capture_output=True, text=True, cwd=str(tmp_path),
        )
        assert r.returncode == 2


class TestFeaturesPassthrough:
    def test_features_flag_minimal_payload(self, tmp_path):
        env = _seed_planner_env(tmp_path)
        _init_git_repo(tmp_path)
        r = subprocess.run(
            [PYTHON, str(PLANNER_SCRIPT), "--plan-dir", env["plan_dir"],
             "--docs-specs", env["docs_specs"], "--out", env["out"],
             "--features", "F001,F005"],
            capture_output=True, text=True, cwd=str(tmp_path),
        )
        assert r.returncode == 0
        payload = json.loads(Path(env["out"]).read_text())
        assert payload["mode"] == "incremental"
        assert payload["affected_waves"] == []
        assert payload["affected_fcodes"] == ["F001", "F005"]
        assert payload["w5_reran"] is False


class TestDryRun:
    def test_dry_run_no_file_write(self, tmp_path):
        env = _seed_planner_env(tmp_path)
        _init_git_repo(tmp_path)
        r = subprocess.run(
            [PYTHON, str(PLANNER_SCRIPT), "--plan-dir", env["plan_dir"],
             "--docs-specs", env["docs_specs"], "--out", env["out"],
             "--features", "F001", "--dry-run"],
            capture_output=True, text=True, cwd=str(tmp_path),
        )
        assert r.returncode == 0
        assert not Path(env["out"]).exists()
        # stdout has indented JSON followed by [INFO] line; extract JSON portion
        stdout_lines = r.stdout.strip().split("\n")
        json_end = next(i for i, l in enumerate(stdout_lines) if l.startswith("[INFO]"))
        parsed = json.loads("\n".join(stdout_lines[:json_end]))
        assert parsed["mode"] == "incremental"


class TestBuildPayload:
    def test_payload_has_all_fields(self):
        p = _build_payload(
            mode="incremental", affected_waves=["Wave1: route-list"],
            affected_fcodes=["F001"], w5_reran=True, cascade_chain="route → W1",
            fallback_reason=None, fallback_to_full=False, deleted_files=[],
            doc_shas_snapshot={}, since_sha="abc", head_sha="def",
        )
        assert set(p.keys()) == {
            "mode", "affected_waves", "affected_fcodes", "w5_reran",
            "cascade_chain", "fallback_reason", "fallback_to_full",
            "deleted_files", "doc_shas_snapshot", "generated_at",
            "since_sha", "head_sha",
        }
