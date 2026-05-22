# F001_Auth — Authentication

**Priority**: P0
**Type**: ui
**Generated**: 2026-05-18

## Overview

Authentication allows registered users to sign in.

## Why This Exists

Users must prove identity.

## Who Uses It

- **Registered User** — signs in

## Business Workflow

1. User submits credentials.
2. Validate.
3. Issue token.

## Screen Flow

**See:** ScreenFlow § F001_Auth

## Cross-Cutting Logic

### Requirements

None.

### Business Rules

None.

### State Machines

See SM-001 below.

### SM-001_LoginFlow

The login state machine governs session transitions but the diagram fence has
been forgotten — this is the failure case that sm_mermaid must still catch.

### Algorithms

None.

### External Integrations

None.

### Verification

None.

## User Stories

### US001_Login — User logs in (Priority: P0)

**What happens:** Valid credentials return token.
**Why this priority:** Core entry point.
**Independent Test:** POST /login returns 200.

### Edge Cases

| Scenario | Behavior |
|----------|----------|
| Empty password | HTTP 422 |

## Key Entities

| Entity | Table | Purpose |
|--------|-------|---------|
| User | users | Credential lookup |

## Related Artifacts

- Screens: SCR001_LoginForm

## Spec Documents

- [x] [System Overview](docs/specs/system-overview.md)

## Assumptions

- bcrypt hashing.

## Source Code References

| Symbol | Path | Purpose |
|--------|------|---------|
| LoginController | `app/Http/Controllers/LoginController.php:1-80` | Validation |

## Unresolved Questions

None.
