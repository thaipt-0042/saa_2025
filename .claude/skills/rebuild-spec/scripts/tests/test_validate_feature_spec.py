"""Integration tests for validate_feature_spec.py.
Runs script as subprocess with --spec <path>, parses stdout JSON,
asserts specific rule_ids present/absent per fixture.
Coverage per phase-05 test matrix.
"""
import json
import subprocess
import sys
from pathlib import Path

import pytest

FIXTURES = Path(__file__).resolve().parent / "fixtures"
SCRIPTS_DIR = Path(__file__).resolve().parents[1]
REPO_ROOT = Path(__file__).resolve().parents[5]
SCRIPT = SCRIPTS_DIR / "validate_feature_spec.py"


def _run(spec_path: Path) -> tuple[int, dict]:
    """Run the spec validator against a single spec and return (exit_code, json)."""
    result = subprocess.run(
        [sys.executable, str(SCRIPT),
         "--spec", str(spec_path),
         "--project-root", str(REPO_ROOT)],
        capture_output=True,
        text=True,
        timeout=30,
    )
    output = json.loads(result.stdout)
    return result.returncode, output


def _issues(data: dict) -> list[dict]:
    """Flatten all issues across all spec entries."""
    all_issues = []
    for entry in data.get("specs", {}).values():
        all_issues.extend(entry.get("issues", []))
    return all_issues


def _rule_ids(data: dict) -> list[str]:
    return [i["rule_id"] for i in _issues(data)]


def _critical_rule_ids(data: dict) -> list[str]:
    return [i["rule_id"] for i in _issues(data) if i["severity"] == "critical"]


# ---------------------------------------------------------------------------
# spec-pass.md: well-formed spec — no critical issues expected
# ---------------------------------------------------------------------------

class TestSpecPass:
    def test_exit_code_zero(self):
        code, _ = _run(FIXTURES / "specs" / "spec-pass.md")
        assert code == 0

    def test_no_critical_issues(self):
        _, data = _run(FIXTURES / "specs" / "spec-pass.md")
        criticals = _critical_rule_ids(data)
        assert criticals == [], f"unexpected critical issues: {criticals}"

    def test_output_has_specs_key(self):
        _, data = _run(FIXTURES / "specs" / "spec-pass.md")
        assert "specs" in data


# ---------------------------------------------------------------------------
# spec-missing-h2.md: ## Business Workflow omitted
# ---------------------------------------------------------------------------

class TestSpecMissingH2:
    def test_exit_code_one(self):
        code, _ = _run(FIXTURES / "specs" / "spec-missing-h2.md")
        assert code == 1

    def test_required_sections_rule_id_present(self):
        _, data = _run(FIXTURES / "specs" / "spec-missing-h2.md")
        assert "FeatureSpec.required_sections" in _critical_rule_ids(data)

    def test_issue_is_critical(self):
        _, data = _run(FIXTURES / "specs" / "spec-missing-h2.md")
        matching = [i for i in _issues(data) if i["rule_id"] == "FeatureSpec.required_sections"]
        assert all(i["severity"] == "critical" for i in matching)


# ---------------------------------------------------------------------------
# spec-deprecated-heading.md: top-level ## Requirements present
# ---------------------------------------------------------------------------

class TestSpecDeprecatedHeading:
    def test_exit_code_one(self):
        code, _ = _run(FIXTURES / "specs" / "spec-deprecated-heading.md")
        assert code == 1

    def test_deprecated_headings_rule_id_present(self):
        _, data = _run(FIXTURES / "specs" / "spec-deprecated-heading.md")
        assert "FeatureSpec.deprecated_headings" in _critical_rule_ids(data)

    def test_issue_is_critical(self):
        _, data = _run(FIXTURES / "specs" / "spec-deprecated-heading.md")
        matching = [i for i in _issues(data) if i["rule_id"] == "FeatureSpec.deprecated_headings"]
        assert all(i["severity"] == "critical" for i in matching)


# ---------------------------------------------------------------------------
# spec-placeholder.md: contains {ROUTE_PATH} literal
# ---------------------------------------------------------------------------

class TestSpecPlaceholder:
    def test_exit_code_one(self):
        code, _ = _run(FIXTURES / "specs" / "spec-placeholder.md")
        assert code == 1

    def test_no_placeholder_rule_id_present(self):
        _, data = _run(FIXTURES / "specs" / "spec-placeholder.md")
        assert "Universal.no_placeholder" in _critical_rule_ids(data)

    def test_issue_is_critical(self):
        _, data = _run(FIXTURES / "specs" / "spec-placeholder.md")
        matching = [i for i in _issues(data) if i["rule_id"] == "Universal.no_placeholder"]
        assert all(i["severity"] == "critical" for i in matching)

    def test_message_mentions_placeholder(self):
        _, data = _run(FIXTURES / "specs" / "spec-placeholder.md")
        matching = [i for i in _issues(data) if i["rule_id"] == "Universal.no_placeholder"]
        assert any("ROUTE_PATH" in i["message"] for i in matching)


# ---------------------------------------------------------------------------
# spec-placeholder-evasion.md: placeholder wrapped in <!-- a --> {X} <!-- b -->
# Regression for stage-3 finding F1 (comment net-depth evasion).
# Old per-line net-depth logic suppressed this; new strip_html_comments detects.
# ---------------------------------------------------------------------------

class TestSpecPlaceholderEvasion:
    def test_exit_code_one(self):
        code, _ = _run(FIXTURES / "specs" / "spec-placeholder-evasion.md")
        assert code == 1

    def test_no_placeholder_rule_id_present(self):
        _, data = _run(FIXTURES / "specs" / "spec-placeholder-evasion.md")
        assert "Universal.no_placeholder" in _critical_rule_ids(data)


# ---------------------------------------------------------------------------
# spec-sm-fence-far.md: SM-001 heading + 50+ lines of intro before mermaid fence.
# Regression for stage-3 finding S1 (legacy 50-line window false positive).
# ---------------------------------------------------------------------------

class TestSpecSmFenceFar:
    def test_exit_code_zero(self):
        code, _ = _run(FIXTURES / "specs" / "spec-sm-fence-far.md")
        assert code == 0

    def test_sm_mermaid_not_flagged(self):
        _, data = _run(FIXTURES / "specs" / "spec-sm-fence-far.md")
        assert "FeatureSpec.sm_mermaid" not in _critical_rule_ids(data)


# ---------------------------------------------------------------------------
# spec-sm-no-fence.md: SM-001 heading but no mermaid fence anywhere.
# Regression: sm_mermaid must still fire when the fence is genuinely missing.
# ---------------------------------------------------------------------------

class TestSpecSmNoFence:
    def test_exit_code_one(self):
        code, _ = _run(FIXTURES / "specs" / "spec-sm-no-fence.md")
        assert code == 1

    def test_sm_mermaid_rule_id_present(self):
        _, data = _run(FIXTURES / "specs" / "spec-sm-no-fence.md")
        assert "FeatureSpec.sm_mermaid" in _critical_rule_ids(data)


# ---------------------------------------------------------------------------
# F2 guard parity: --plan-dir at a file and --spec at a directory both exit 2.
# ---------------------------------------------------------------------------

class TestInputGuards:
    def test_plan_dir_is_file_exits_two(self, tmp_path):
        bogus = tmp_path / "not-a-dir.txt"
        bogus.write_text("x")
        result = subprocess.run(
            [sys.executable, str(SCRIPT),
             "--plan-dir", str(bogus),
             "--project-root", str(tmp_path)],
            capture_output=True, text=True, timeout=30,
        )
        assert result.returncode == 2
        assert "not a directory" in result.stderr.lower()

    def test_spec_is_directory_exits_two(self, tmp_path):
        result = subprocess.run(
            [sys.executable, str(SCRIPT),
             "--spec", str(tmp_path),
             "--project-root", str(tmp_path)],
            capture_output=True, text=True, timeout=30,
        )
        assert result.returncode == 2
        assert "not a file" in result.stderr.lower()
