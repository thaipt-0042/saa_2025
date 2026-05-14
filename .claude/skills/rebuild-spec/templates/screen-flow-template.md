# Screen Flow

**Project**: {PROJECT_NAME}
**Generated**: {DATE}
**Analysis Scope**: {SCOPE}

**Code Format**: All SCR codes MUST follow `SCR###_NameSlug` format (e.g., SCR001_LoginForm, SCR002_Dashboard) | `SCR###/REG###` for region-scoped transitions

## Navigation Map

```mermaid
graph TD
    A[{START}] -->|Entry| B[{SCR001_NAME}]
    B -->|Action 1| C[{SCR002_NAME}]
    B -->|Action 2| D[{SCR003_NAME}]
    C -->|Back| B
    D -->|Back| B
```

## Screen Access Paths

| From Screen | To Screen | Action/Trigger | Conditions | Region |
|-------------|-----------|----------------|------------|--------|
| {START} | {SCR001_CODE} | Initial load | None | |
| {SCR001_CODE} | {SCR002_CODE} | {ACTION} | {CONDITION} | |
| {SCR001_CODE} | {SCR003_CODE} | {ACTION} | {CONDITION} | |
| {SCR002_CODE} | {SCR001_CODE} | Back button | None | |
| {SCR003_CODE} | {SCR001_CODE} | Back button | None | |

> Region column: fill with `SCR###/REG###` for region-scoped transitions; leave blank for whole-screen transitions.

## Screen Transitions

### {SCR001_CODE} ({SCR001_NAME})

**Entry Points**:
- Direct URL access
- From external link
- From {SCR003_CODE}

**Exit Points**:
- To {SCR002_CODE}: {REASON}
- To {SCR003_CODE}: {REASON}

**Decision Points**:
- {DECISION_1}: If {CONDITION} → {SCR002_CODE}, else → {SCR003_CODE}

---

### {SCR002_CODE} ({SCR002_NAME})

**Entry Points**:
- From {SCR001_CODE}: {ACTION}

**Exit Points**:
- To {SCR001_CODE}: Back navigation

**Decision Points**:
- None

---

### {SCR003_CODE} ({SCR003_NAME})

**Entry Points**:
- From {SCR001_CODE}: {ACTION}

**Exit Points**:
- To {SCR001_CODE}: Back navigation

**Decision Points**:
- None

---

## Region Transitions

> Region transitions are typically client-state (no URL change); document only transitions that change user-visible state within the region or cross region boundary.

| From Region | To Target | Action/Trigger | Client-State Only |
|-------------|-----------|----------------|-------------------|
| SCR001_AdminDashboard/REG001 (UserPanel) | MOD003_AddUser (modal) | Click "Add User" button | Yes |
| SCR001_AdminDashboard/REG002 (MetricsPanel) | SCR007_MetricDetail (full screen) | Click metric row | No (URL changes) |

---

## Authentication Flow

```mermaid
graph LR
    A[Public] -->|No Auth| B[{SCR001_Name}]
    A -->|Requires Auth| C[Login]
    C -->|Success| D[{SCR002_Name}]
    C -->|Fail| B
    D -->|Logout| B
```

| Screen | Authentication Required | Authorization Level |
|--------|------------------------|-------------------|
| {SCR001_CODE} | No | Public |
| {SCR002_CODE} | Yes | User |
| {SCR003_CODE} | Yes | Admin |

---

## Error Handling Flows

| Screen | Error | Handling | Scope |
|--------|-------|----------|-------|
| {SCR001_CODE} | Network Error | Show retry dialog | screen |
| {SCR002_CODE} | Auth Expired | Redirect to login | screen |
| {SCR003_CODE} | Not Found | Show 404 screen | screen |
| SCR001_AdminDashboard | Metrics load failure | Show inline error in MetricsPanel | region:REG002 |

> Scope values: `screen` (affects entire screen) | `region:REG###` (error contained within the named region).

---

## Circular Dependencies Check

- [x] No circular dependencies detected
- [x] All screens have valid entry/exit points
- [x] All navigation paths terminate