# Permissions

**Project**: {PROJECT_NAME}
**Generated**: {DATE}
**Analysis Scope**: {SCOPE}

**Code Format**: All codes MUST follow `PERM###_NameSlug` format (e.g., PERM001_ViewReports, PERM002_EditUsers)

**Permission Types**:
- `route-guard` - Route-level authorization middleware
- `screen-permission` - UI element visibility/enabled rules
- `action-permission` - Button/action execution rules
- `data-permission` - Field-level access control
- `role-based` - Role-based access control rules
- `resource-ownership` - Owner/resource relationship checks
- `field-permission` - Column/field visibility rules
- `api-scope` - API scope/token permission

**Note**: Feature mapping is managed in FeatureList.md. This document contains permission items without direct feature references.

## Authorization System Type

**System Type**: {AUTH_SYSTEM_TYPE}

Identify the primary authorization system used:

| System Type | Description | Indicators |
|-------------|-------------|------------|
| `rbac` | Role-Based Access Control | Roles (admin, user, manager), role assignments, permission roles |
| `abac` | Attribute-Based Access Control | Policies, attributes (department, owner, status), dynamic rules |
| `acl` | Access Control List | Explicit user permissions, permission matrices |
| `ownership` | Resource Ownership | owner_id, created_by, can_edit rules |
| `hybrid` | Mixed (RBAC + Ownership) | Roles combined with ownership checks |
| `other` | Custom/Other | Custom permission logic |

**Identified Roles**:
- {ROLE_1}
- {ROLE_2}
- {ROLE_3}

## Permissions Index

| Code | Name | Type | Enforced At |
|------|------|------|-------------|
| {PERM001_CODE} | {PERM001_NAME} | {TYPE} | {ENFORCED_AT} |
| {PERM002_CODE} | {PERM002_NAME} | {TYPE} | {ENFORCED_AT} |
| {PERM003_CODE} | {PERM003_NAME} | {TYPE} | {ENFORCED_AT} |

---

## {PERM001_CODE}: {PERM001_NAME}

**Type**: {TYPE}
**Enforced At**: {ENFORCED_AT}

### Description

{DESCRIPTION}

### Related Routes

- ({ROUTE_METHOD}) {ROUTE_PATH}

### Related Screens

- {SCREEN_CODE | SCR###/REG###} - {SCREEN_NAME}

### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| {ROLE_1} | {✓/✗} | {CONDITIONS} |
| {ROLE_2} | {✓/✗} | - |

### Related Modules

- {MODULE_1}
- {MODULE_2}

---

## {PERM002_CODE}: {PERM002_NAME}

**Type**: {TYPE}
**Enforced At**: {ENFORCED_AT}

### Description

{DESCRIPTION}

### Related Routes

- ({ROUTE_METHOD}) {ROUTE_PATH}

### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| {ROLE_1} | {✓/✗} | {CONDITIONS} |

### Related Modules

- {MODULE_1}

---

## {PERM003_CODE}: {PERM003_NAME}

**Type**: {TYPE}
**Enforced At**: {ENFORCED_AT}

### Description

{DESCRIPTION}

### Related Screens

- {SCREEN_CODE} - {SCREEN_NAME}

### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| {ROLE_1} | {✓/✗} | {CONDITIONS} |

---

## Summary

- **Total Permission Items**: {TOTAL_PERMISSIONS}
- **By Type**: route-guard: {N}, screen-permission: {N}, action-permission: {N}, data-permission: {N}, role-based: {N}, resource-ownership: {N}, field-permission: {N}, api-scope: {N}

---

## Cross-Reference Validation

- [x] All PERM### codes are unique
- [ ] All PERM### codes are referenced in FeatureList.md (verified in Step 8)
- [x] All related route references are valid (RT### in RouteList)
- [x] All related screen references are valid (SCR### or SCR###/REG### in ScreenList; PERM### may target a region (SCR###/REG###) for region-scoped auth gating (e.g., admin-only sidebar) — UI hiding only; server enforcement required)
- [x] All related module references are valid
- [x] No orphaned permission references

<!--
=============================================================================
APPENDIX — WORKED EXAMPLE (Reference Only; DELETE THIS HTML-COMMENT BLOCK
BEFORE SUBMITTING REAL PERMISSIONS. Fabricated codes used here —
PERM004, SCR001/REG002_MetricsPanel — must NOT appear in the generated output.)
=============================================================================

**Region-scoped PERM example**: `PERM004` targets `SCR001/REG002_MetricsPanel` (role: admin; hides region for non-admin). Server-side enforcement must not rely solely on UI hiding.

=============================================================================
-->
