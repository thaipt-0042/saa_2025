# Background Logic

**Project**: {PROJECT_NAME}
**Generated**: {DATE}
**Analysis Scope**: {SCOPE}

**Code Format**: All codes MUST follow `BL###_NameSlug` format (e.g., BL001_ScheduledReport, BL002_EventListener)

**Background Logic Types** (canonical 10 — language-neutral):
- `scheduled-job` — Cron-like scheduled tasks
- `queue-worker` — Background job workers (async queue consumers)
- `event-listener` — Event-driven handlers
- `observer` — Model lifecycle hooks (created/updated/deleted)
- `mail` — Email sending logic
- `notification` — In-app / push notification logic
- `middleware` — Request/response processing chain (non-auth)
- `custom-command` — CLI commands
- `integration` — Third-party integrations (external API clients)
- `webhook` — Incoming/outgoing webhook handlers

**Note**: Auth/permission middleware is NOT included — see Permissions.md

**Note**: Feature and UserStory mapping is managed in FeatureList.md and UserStories.md. This document contains background logic items without direct feature/story references.

---

## Cardinality Contract

Rules enforced by Wave 2b researcher and Wave 7a reviewer. Violations are critical.

- **Rule C1 — 1 BL per inventory entry**: Mode A stacks (folder convention): 1 file = 1 BL. Mode B stacks (annotation/decorator): 1 decorator hit = 1 BL (multiple hits in same file → multiple BL items). Aggregation is a critical violation.
- **Rule C2 — Source fields mandatory, single-valued**: Every BL item MUST include `**Source File**` (one relative path) and `**Source Symbol**` (one symbol — class name for Mode A; `ClassName::method` or `module::function` for Mode B). Multi-symbol forms forbidden in either field — split on `,`, `;`, or whitespace-bounded conjunction (` and `, ` & `, ` + `) and produce separate BL items. `/` is NOT a delimiter here (collides with composite-ref `SCR###/REG###` and path-shaped symbols); `+`/`&` require surrounding whitespace so language tokens like Swift `MyClass+Extension` and reference operators inside symbol names are not aggregated. Both fields must match the scout inventory entry 1-to-1.
- **Rule C3 — Unmatched BL warning**: A BL item whose Source File does not appear in the scout `## Background Logic Source Inventory` → warning; researcher must provide justification in Description (may be a legitimate `[SIGNAL_INFERRED]` case). Unmatched BL with no justification → critical.

---

## Inclusion/Exclusion Matrix (scout-side filter)

> **Precedence:** Applies at Wave 0 scout inventory only. Once an entry reaches `## Background Logic Source Inventory`, **Rule C1 dominates unconditionally** — researcher emits one BL per inventory entry. Scout MUST drop excluded files (e.g., abstract bases in `app/Mail/`) upfront; researcher does not filter post-inventory.

| Include | Exclude |
|---------|---------|
| All files/symbols in scout `## Background Logic Source Inventory` | Abstract base classes, traits, interfaces |
| `[SIGNAL_INFERRED]`-tagged inventory entries (with justification) | Vendor overrides and third-party library subclasses |
| | `*Test.php`, `*Spec.rb`, `test_*.py`, `*.test.ts` and all test files |
| | Files < 10 LOC (scaffolding/stubs) |
| | Auth/ACL/OAuth/JWT middleware (→ Permissions.md) |

**Scout responsibility:** Wave 0 must apply these filters before emitting `## Background Logic Source Inventory`. See `references/pipeline.md` Wave 0 step (5).

---

## Anti-Patterns: Aggregation Forbidden

Aggregating multiple source files into a single BL item violates Rule C1 and will be flagged critical by the reviewer.

- ❌ `BL050_EmailNotifications` — Description: "Covers all 25 Mail classes (WelcomeMail, InvoiceMail, ...)"
- ✅ `BL050_SendWelcomeMail` (Source File: `app/Mail/WelcomeMail.php`) + `BL051_SendInvoiceMail` (Source File: `app/Mail/InvoiceMail.php`) + ...

- ❌ `BL080_AuditLogWorkers` — Description: "Umbrella for 12 audit log job variants"
- ✅ One BL per Job class with individual Source File + Source Symbol fields

- ❌ `BL090_AuditEvents` — Source Symbol: `AuditService::onCreated, AuditService::onUpdated, AuditService::onDeleted` (comma-list forbidden)
- ✅ One BL per symbol: `BL090_AuditOnCreated` / `BL091_AuditOnUpdated` / `BL092_AuditOnDeleted`

---

## Background Logic Index

| Code | Name | Type | Trigger |
|------|------|------|---------|
| {BL001_CODE} | {BL001_NAME} | {TYPE} | {TRIGGER} |
| {BL002_CODE} | {BL002_NAME} | {TYPE} | {TRIGGER} |
| {BL003_CODE} | {BL003_NAME} | {TYPE} | {TRIGGER} |

---

## {BL001_CODE}: {BL001_NAME}

**Type**: {TYPE}
**Trigger**: {TRIGGER}
**Source File**: {relative/path/to/SourceFile.ext}
**Source Symbol**: {ClassName | ClassName::methodName | module::function}

### Description

{DESCRIPTION}

### Related Modules

- {MODULE_1}
- {MODULE_2}

### Related Routes

- ({ROUTE_METHOD}) {ROUTE_PATH}

### Related Data Models

- {MODEL_ENTITY}

---

## {BL002_CODE}: {BL002_NAME}

**Type**: {TYPE}
**Trigger**: {TRIGGER}
**Source File**: {relative/path/to/SourceFile.ext}
**Source Symbol**: {ClassName | ClassName::methodName | module::function}

### Description

{DESCRIPTION}

### Related Modules

- {MODULE_1}

### Related Routes

- ({ROUTE_METHOD}) {ROUTE_PATH}

### Related Data Models

- {MODEL_ENTITY}

---

## {BL003_CODE}: {BL003_NAME}

**Type**: {TYPE}
**Trigger**: {TRIGGER}
**Source File**: {relative/path/to/SourceFile.ext}
**Source Symbol**: {ClassName | ClassName::methodName | module::function}

### Description

{DESCRIPTION}

### Related Modules

- {MODULE_1}

### Related Routes

- ({ROUTE_METHOD}) {ROUTE_PATH}

---

## Summary

- **Total Background Logic Items**: {TOTAL_BACKGROUND_LOGIC}
- **By Type**: custom-command: {N}, event-listener: {N}, integration: {N}, mail: {N}, middleware: {N}, notification: {N}, observer: {N}, queue-worker: {N}, scheduled-job: {N}, webhook: {N}

---

## Cross-Reference Validation

- [x] All BL### codes are unique
- [x] All BL### codes are referenced in UserStories.md (type=system)
- [x] All BL### codes are referenced in FeatureList.md
- [x] All related route references are valid (ROUTE### in RouteList)
- [x] All related data model references are valid (MODEL### in DataModel)
- [x] No orphaned background logic references
- [x] All BL items have Source File + Source Symbol fields (Rule C2)
- [x] All Source File paths match scout Background Logic Source Inventory entries (Rule C2/C3)
