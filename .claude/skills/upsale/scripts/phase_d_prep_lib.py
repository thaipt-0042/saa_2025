"""Pure-Python helpers for upsale Step 5c (Phase-D pre-extraction).

Authoritative implementation of `claude/skills/upsale/references/phase-d-prep.md`.
No I/O orchestration here — see `phase_d_prep.py` for the wrapper that handles
filesystem reads, atomic writes, manifest construction, and stdout.

Fence-awareness reuses `combine_lib._FENCE_OPEN_RE` so item walking matches
the same CommonMark rules as Step 5a's combine routine.
"""

from __future__ import annotations

import hashlib
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable

# Re-use the fence-tracking regex from combine_lib for consistency with Step 5a.
_FENCE_OPEN_RE = re.compile(r"^ {0,3}(`{3,}|~{3,})")
_ATX_H2_RE = re.compile(r"^ {0,3}## (?!#)")
_ATX_H3_RE = re.compile(r"^ {0,3}### (?!#)")
_ATX_H4_RE = re.compile(r"^ {0,3}#### (?!#)")
_ASPECT_ID_RE = re.compile(r"<!--\s*aspect-id:\s*([a-z0-9-]+)\s*-->")
_SLUG_VALIDATE_RE = re.compile(r"^[a-z0-9][a-z0-9\-]*$")
_ASPECT_ID_VALIDATE_RE = re.compile(r"^[a-z0-9-]+$")

VALID_USE_CONTEXTS = {"internal", "hybrid", "customer-facing"}
STACK_CONTEXT_LINES = 20


@dataclass
class Item:
    index: int
    title: str
    slug: str
    track: str  # "technical" | "business"
    body: str  # the full block from #### onwards, fence-aware
    line_no: int  # 0-based start of the #### line in combined-initial.md


@dataclass
class Manifest:
    combined_md_sha256: str
    use_context: str
    items: list[dict] = field(default_factory=list)
    evidence_degraded_warns: list[str] = field(default_factory=list)


# ---------------------------------------------------------------------------
# SHA + slug + path safety
# ---------------------------------------------------------------------------

def compute_sha256(content: bytes) -> str:
    return hashlib.sha256(content).hexdigest()


def title_to_slug(title: str) -> str:
    """Procedure step 4 — verbatim regex from apply-validations.md step 6."""
    slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    return slug or "untitled"


def validate_aspect_id(s: str) -> bool:
    """Path-traversal defence; reject anything outside ^[a-z0-9-]+$."""
    return bool(_ASPECT_ID_VALIDATE_RE.match(s))


def validate_filename_slug(slug: str) -> bool:
    """Per spec: `<slug>` matches `^[a-z0-9][a-z0-9\\-]*$`."""
    return bool(_SLUG_VALIDATE_RE.match(slug))


def assert_under_plans(path: Path, plans_root: Path) -> None:
    """Reject paths that escape plans_root via .. or null bytes."""
    s = str(path)
    if "\x00" in s or ".." in path.parts:
        raise ValueError(f"unsafe path component in {path!r}")
    # Resolve against plans_root; require it's inside.
    try:
        path.resolve().relative_to(plans_root.resolve())
    except ValueError as exc:
        raise ValueError(f"path {path} escapes plans_root {plans_root}") from exc


# ---------------------------------------------------------------------------
# Item walker (fence-aware)
# ---------------------------------------------------------------------------

def parse_items(combined_text: str) -> list[Item]:
    """Walk combined-initial.md fence-aware. Collect each `#### <title>` block
    and tag it with its enclosing `## Technical` / `## Business` parent.
    Item indices are 1-based in document order (Technical first if present).
    """
    lines = combined_text.splitlines()
    in_fence = False
    fence_char = ""
    fence_len = 0

    items: list[Item] = []
    current_track: str | None = None
    block_start: int | None = None
    block_title: str = ""

    def flush(end_line: int) -> None:
        nonlocal block_start, block_title
        if block_start is None:
            return
        body = "\n".join(lines[block_start:end_line]).rstrip("\n")
        # Trailing newline preserved by writer if needed.
        if current_track is None:
            block_start = None
            return
        items.append(Item(
            index=len(items) + 1,
            title=block_title,
            slug=title_to_slug(block_title),
            track=current_track,
            body=body,
            line_no=block_start,
        ))
        block_start = None
        block_title = ""

    for i, line in enumerate(lines):
        if in_fence:
            m = _FENCE_OPEN_RE.match(line)
            if m and m.group(1)[0] == fence_char and len(m.group(1)) >= fence_len:
                in_fence = False
            continue
        fm = _FENCE_OPEN_RE.match(line)
        if fm:
            in_fence = True
            fence_char = fm.group(1)[0]
            fence_len = len(fm.group(1))
            continue

        # Track-switch on `## Technical` / `## Business`.
        if _ATX_H2_RE.match(line):
            flush(i)
            stripped = line.lstrip(" #").strip().lower()
            if stripped.startswith("technical"):
                current_track = "technical"
            elif stripped.startswith("business"):
                current_track = "business"
            else:
                current_track = None
            continue

        if _ATX_H4_RE.match(line):
            flush(i)
            block_title = line.lstrip(" #").strip()
            block_start = i
            continue

    flush(len(lines))
    return items


# ---------------------------------------------------------------------------
# Aspect-id resolution
# ---------------------------------------------------------------------------

def resolve_aspect_id(combined_text: str, item: Item) -> tuple[str, str | None]:
    """Walk backwards from item.line_no to the nearest `### ` rollup heading.
    Within the next 3 non-blank lines after that heading, look for the
    `<!-- aspect-id: <slug> -->` comment.

    Returns (aspect_id, fallback_marker) where fallback_marker is:
      - None when the comment was found.
      - "rollup-heading" when Fallback A (slug-from-rollup-heading) fired.
      - "unresolvable" when Fallback B (no rollup heading found) fired.
    """
    lines = combined_text.splitlines()
    # Find nearest preceding H3 (fence-aware backward walk).
    rollup_line_no: int | None = None
    in_fence = False
    fence_char = ""
    fence_len = 0
    # Forward walk up to item.line_no to track fence state correctly.
    for i in range(item.line_no):
        line = lines[i]
        if in_fence:
            m = _FENCE_OPEN_RE.match(line)
            if m and m.group(1)[0] == fence_char and len(m.group(1)) >= fence_len:
                in_fence = False
            continue
        fm = _FENCE_OPEN_RE.match(line)
        if fm:
            in_fence = True
            fence_char = fm.group(1)[0]
            fence_len = len(fm.group(1))
            continue
        if _ATX_H3_RE.match(line):
            rollup_line_no = i

    if rollup_line_no is None:
        return "", "unresolvable"

    # Look at the next 3 non-blank lines after the H3.
    scanned = 0
    for j in range(rollup_line_no + 1, min(rollup_line_no + 20, len(lines))):
        line = lines[j].strip()
        if not line:
            continue
        scanned += 1
        if scanned > 3:
            break
        m = _ASPECT_ID_RE.search(line)
        if m:
            asp = m.group(1)
            if validate_aspect_id(asp):
                return asp, None

    # Fallback A: slug-from-rollup-heading title text (before " · ").
    heading = lines[rollup_line_no].lstrip(" #").strip()
    title = heading.split(" · ", 1)[0].strip()
    derived = title_to_slug(title)
    if not validate_aspect_id(derived):
        return "", "unresolvable"
    return derived, "rollup-heading"


# ---------------------------------------------------------------------------
# Evidence loader + stack context
# ---------------------------------------------------------------------------

# Regex matching `^[0-9]+-<aspect-id>\.md$` per spec step 6.
def evidence_filename(aspect_id: str) -> re.Pattern[str]:
    return re.compile(rf"^[0-9]+-{re.escape(aspect_id)}\.md$")


def load_evidence(improvement_dir: Path, aspect_id: str) -> tuple[str, bool]:
    """Find `^[0-9]+-<aspect-id>\\.md$` under improvement_dir and return its
    body (everything after H1 + line-2 use-context marker + any leading HTML
    comments). Returns (body, found).
    """
    pat = evidence_filename(aspect_id)
    match: Path | None = None
    if improvement_dir.is_dir():
        for p in sorted(improvement_dir.iterdir()):
            if p.is_file() and pat.match(p.name):
                match = p
                break
    if match is None:
        return "", False

    try:
        text = match.read_text(encoding="utf-8")
    except OSError:
        return "", False

    # Strip leading H1 + use-context line + any leading HTML comments + blank lines.
    lines = text.splitlines()
    idx = 0
    n = len(lines)
    # Skip leading blank lines.
    while idx < n and not lines[idx].strip():
        idx += 1
    # Skip H1.
    if idx < n and re.match(r"^ {0,3}# (?!#)", lines[idx]):
        idx += 1
    # Skip blank, HTML comments, use-context marker — until we hit real content.
    use_ctx_re = re.compile(r"^\s*\*\*Use context:\*\*\s+\S")
    html_comment_re = re.compile(r"^\s*<!--.*-->\s*$")
    while idx < n:
        ln = lines[idx]
        if not ln.strip() or use_ctx_re.match(ln) or html_comment_re.match(ln):
            idx += 1
            continue
        break

    body = "\n".join(lines[idx:]).strip("\n")
    return body, True


def build_stack_context(discovery_dir: Path, filenames: Iterable[str]) -> tuple[str, list[str]]:
    """Read first STACK_CONTEXT_LINES lines of each given filename under
    discovery_dir; concatenate (newline-separated, file-separated blank line).

    Returns (stack_context, missing_paths). Missing files contribute empty
    strings AND populate the missing_paths list for warn emission.
    """
    chunks: list[str] = []
    missing: list[str] = []
    for fn in filenames:
        p = discovery_dir / fn
        if not p.is_file():
            missing.append(str(p))
            continue
        try:
            text = p.read_text(encoding="utf-8")
        except OSError:
            missing.append(str(p))
            continue
        head = "\n".join(text.splitlines()[:STACK_CONTEXT_LINES])
        chunks.append(head)
    return "\n\n".join(chunks), missing


# ---------------------------------------------------------------------------
# Item-markdown rewrite
# ---------------------------------------------------------------------------

def rewrite_h4_to_h2(item_body: str) -> str:
    """Rewrite the leading `^ {0,3}#### <title>` → `## <title>`. Preserve the
    rest verbatim. Only the first occurrence is rewritten (the item's heading).
    """
    return re.sub(r"^( {0,3})#### ", lambda m: f"{m.group(1)}## ", item_body, count=1)
