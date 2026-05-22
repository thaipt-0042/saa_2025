"""Tests for scripts/promote_drafts.py."""
import hashlib
import os
import shutil
import subprocess
import sys
from pathlib import Path

import pytest

SCRIPTS_DIR = Path(__file__).resolve().parents[1]
SCRIPT = SCRIPTS_DIR / "promote_drafts.py"
FIXTURES = Path(__file__).resolve().parent / "fixtures" / "promote_drafts"
# promote_drafts.py resolves paths against os.getcwd(); use repo root as cwd
REPO_ROOT = Path(__file__).resolve().parents[5]

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


_PROMOTE_TMP = REPO_ROOT / f"_test_promote_tmp_{os.getpid()}"


@pytest.fixture(autouse=True, scope="module")
def _cleanup_promote_tmp():
    """Remove the PID-scoped temp dir after the module finishes."""
    yield
    if _PROMOTE_TMP.exists():
        shutil.rmtree(_PROMOTE_TMP, ignore_errors=True)


def _run(args: list[str], cwd: Path) -> subprocess.CompletedProcess:
    return subprocess.run(
        [sys.executable, str(SCRIPT)] + args,
        capture_output=True,
        text=True,
        timeout=30,
        cwd=str(cwd),
    )


def _copy_fixture_plan(tmp_path: Path) -> tuple[Path, Path]:
    """Copy fixture plan-dir under REPO_ROOT/tmp_path subtree, create docs_specs target.

    We place everything under a subdir of REPO_ROOT so all paths pass the
    path-traversal guard (which checks against os.getcwd() == REPO_ROOT).
    """
    # Use a stable subdir name derived from tmp_path to avoid collisions
    subdir = Path(str(tmp_path).replace("/", "_").lstrip("_"))
    work = _PROMOTE_TMP / subdir.name
    if work.exists():
        shutil.rmtree(work)
    work.mkdir(parents=True)
    plan_dir = work / "plan"
    shutil.copytree(str(FIXTURES / "plan-dir"), str(plan_dir))
    docs_specs = work / "docs" / "specs"
    docs_specs.mkdir(parents=True)
    return plan_dir, docs_specs


class TestFullModePromotion:
    def test_exit_code_zero(self, tmp_path):
        plan_dir, docs_specs = _copy_fixture_plan(tmp_path)
        result = _run(
            [
                "--plan-dir", str(plan_dir),
                "--docs-specs", str(docs_specs),
                "--mode", "full",
            ],
            cwd=REPO_ROOT,
        )
        assert result.returncode == 0, result.stderr

    def test_promotes_available_artifacts(self, tmp_path):
        plan_dir, docs_specs = _copy_fixture_plan(tmp_path)
        _run(
            [
                "--plan-dir", str(plan_dir),
                "--docs-specs", str(docs_specs),
                "--mode", "full",
            ],
            cwd=REPO_ROOT,
        )
        # fixture has feature-list.md and route-list.md
        assert (docs_specs / "feature-list.md").is_file()
        assert (docs_specs / "route-list.md").is_file()

    def test_promotes_feature_specs(self, tmp_path):
        plan_dir, docs_specs = _copy_fixture_plan(tmp_path)
        _run(
            [
                "--plan-dir", str(plan_dir),
                "--docs-specs", str(docs_specs),
                "--mode", "full",
            ],
            cwd=REPO_ROOT,
        )
        assert (docs_specs / "features" / "F001_Auth" / "spec.md").is_file()
        assert (docs_specs / "features" / "F002_Profile" / "spec.md").is_file()

    def test_writes_system_overview_stub(self, tmp_path):
        plan_dir, docs_specs = _copy_fixture_plan(tmp_path)
        _run(
            [
                "--plan-dir", str(plan_dir),
                "--docs-specs", str(docs_specs),
                "--mode", "full",
            ],
            cwd=REPO_ROOT,
        )
        stub = docs_specs / "system-overview.md"
        assert stub.is_file()
        content = stub.read_text()
        assert "system-architecture.md" in content

    def test_sha256_manifest_created(self, tmp_path):
        plan_dir, docs_specs = _copy_fixture_plan(tmp_path)
        _run(
            [
                "--plan-dir", str(plan_dir),
                "--docs-specs", str(docs_specs),
                "--mode", "full",
            ],
            cwd=REPO_ROOT,
        )
        manifest = plan_dir / "artifacts" / "_promoted-sha256.txt"
        assert manifest.is_file()

    def test_sha256_manifest_non_empty(self, tmp_path):
        plan_dir, docs_specs = _copy_fixture_plan(tmp_path)
        _run(
            [
                "--plan-dir", str(plan_dir),
                "--docs-specs", str(docs_specs),
                "--mode", "full",
            ],
            cwd=REPO_ROOT,
        )
        manifest = (plan_dir / "artifacts" / "_promoted-sha256.txt").read_text()
        assert len(manifest.strip()) > 0


class TestIncrementalModePromotion:
    def test_exit_code_zero(self, tmp_path):
        plan_dir, docs_specs = _copy_fixture_plan(tmp_path)
        result = _run(
            [
                "--plan-dir", str(plan_dir),
                "--docs-specs", str(docs_specs),
                "--mode", "incremental",
                "--affected-artifacts", "feature-list.md",
                "--affected-fcodes", "F001_Auth",
            ],
            cwd=REPO_ROOT,
        )
        assert result.returncode == 0, result.stderr

    def test_promotes_only_specified_artifact(self, tmp_path):
        plan_dir, docs_specs = _copy_fixture_plan(tmp_path)
        _run(
            [
                "--plan-dir", str(plan_dir),
                "--docs-specs", str(docs_specs),
                "--mode", "incremental",
                "--affected-artifacts", "feature-list.md",
                "--affected-fcodes", "",
            ],
            cwd=REPO_ROOT,
        )
        assert (docs_specs / "feature-list.md").is_file()
        # route-list was not in affected-artifacts
        assert not (docs_specs / "route-list.md").is_file()

    def test_promotes_only_specified_fcode(self, tmp_path):
        plan_dir, docs_specs = _copy_fixture_plan(tmp_path)
        _run(
            [
                "--plan-dir", str(plan_dir),
                "--docs-specs", str(docs_specs),
                "--mode", "incremental",
                "--affected-artifacts", "",
                "--affected-fcodes", "F001_Auth",
            ],
            cwd=REPO_ROOT,
        )
        assert (docs_specs / "features" / "F001_Auth" / "spec.md").is_file()
        assert not (docs_specs / "features" / "F002_Profile" / "spec.md").is_file()


class TestStubLiteral:
    def test_stub_contains_redirect_text(self, tmp_path):
        plan_dir, docs_specs = _copy_fixture_plan(tmp_path)
        _run(
            [
                "--plan-dir", str(plan_dir),
                "--docs-specs", str(docs_specs),
                "--mode", "full",
            ],
            cwd=REPO_ROOT,
        )
        stub = (docs_specs / "system-overview.md").read_text()
        assert "Canonical system architecture" in stub

    def test_stub_links_to_system_architecture(self, tmp_path):
        plan_dir, docs_specs = _copy_fixture_plan(tmp_path)
        _run(
            [
                "--plan-dir", str(plan_dir),
                "--docs-specs", str(docs_specs),
                "--mode", "full",
            ],
            cwd=REPO_ROOT,
        )
        stub = (docs_specs / "system-overview.md").read_text()
        assert "system-architecture.md" in stub


class TestArchiveGc:
    def test_keeps_at_most_5_archive_dirs(self, tmp_path):
        plan_dir, docs_specs = _copy_fixture_plan(tmp_path)
        # Pre-populate 6 old archive dirs
        archive_root = docs_specs / ".review-archive"
        archive_root.mkdir(parents=True)
        for i in range(6):
            tag = f"2026-01-0{i+1}T00-00-00Z"
            (archive_root / tag).mkdir()

        _run(
            [
                "--plan-dir", str(plan_dir),
                "--docs-specs", str(docs_specs),
                "--mode", "full",
            ],
            cwd=REPO_ROOT,
        )
        remaining = [
            d for d in archive_root.iterdir() if d.is_dir()
        ]
        assert len(remaining) <= 5


class TestSha256ManifestDeterminism:
    def test_manifest_deterministic_on_rerun(self, tmp_path):
        plan_dir, docs_specs = _copy_fixture_plan(tmp_path)
        common_args = [
            "--plan-dir", str(plan_dir),
            "--docs-specs", str(docs_specs),
            "--mode", "full",
        ]
        _run(common_args, cwd=REPO_ROOT)
        manifest1 = (plan_dir / "artifacts" / "_promoted-sha256.txt").read_text()
        _run(common_args, cwd=REPO_ROOT)
        manifest2 = (plan_dir / "artifacts" / "_promoted-sha256.txt").read_text()
        # Same files → same digests (content unchanged)
        lines1 = sorted(manifest1.strip().splitlines())
        lines2 = sorted(manifest2.strip().splitlines())
        assert lines1 == lines2
