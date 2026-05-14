---
failed: 0
warnings: 0
result: PASS
---
# Review Report — Rebuild-Spec Artifacts

**Reviewer**: Staff Engineer (automated)
**Date**: {DATE}
**Scope**: All {N} core artifacts + {M} feature specs

---

## Summary

| Metric | Value |
|--------|-------|
| Artifacts reviewed | {N} core + {M} feature specs |
| Critical issues | {failed} |
| Warnings | {warnings} |
| Result | **{PASS\|FAIL}** |

---

## Critical Issues

<!-- List each critical issue as a subsection:
### C{N}: {Title} — {FIXED|OPEN}
- **Severity**: critical
- **Location**: `{artifact}:{line}`
- **Description**: ...
- **Fix**: ...

If none: write "_(none)_" -->

---

## Warnings

<!-- List each warning as a subsection:
### W{N}: {Title} — {FIXED|OPEN}
- **Severity**: warning
- **Location**: `{artifact}:{line}`
- **Description**: ...
- **Fix**: ...

If none: write "_(none)_" -->

---

## Passed Checks

### Cross-Reference Integrity
<!-- Checklist of cross-ref checks, e.g.:
- [x] All US### codes referenced by exactly 1 F### — 0 orphans
- [x] All SCR### codes appear in screen-flow.md — 0 missing
-->

### Format Compliance
<!-- Checklist of format checks, e.g.:
- [x] All codes follow correct format: F###_NameSlug, US###_NameSlug, ...
- [x] No placeholder text `{PLACEHOLDER}` in any artifact
-->

### Feature Spec Quality
<!-- Checklist of spec quality checks -->

---

## Metrics

| Metric | Value |
|--------|-------|
| Feature Specs | {M} |
| User Stories | {US_COUNT} |
| Screens | {SCR_COUNT} |
| Background Logic Items | {BL_COUNT} |
| Permissions | {PERM_COUNT} |
| Backend Route Rows | {ROUTE_COUNT} |
| Frontend Pages | {PAGE_COUNT} |
| Data Model Entities | {ENTITY_COUNT} |
