# F001_Auth — Authentication

**Priority**: P0
**Type**: ui
**Generated**: 2026-05-18

## Overview

Authentication allows registered users to sign in with email and password.
Requests are routed through <!-- a --> {ROUTE_PATH} <!-- b
--> to the login handler.

## Why This Exists

Users must prove identity before accessing protected resources.

## Who Uses It

- **Registered User** — signs in to access the application

## Business Workflow

1. User submits email and password via POST /login.
2. LoginController validates credentials.
3. Session token is issued on match.
4. HTTP 401 returned on failure.

## Screen Flow

**See:** ScreenFlow § F001_Auth

## Cross-Cutting Logic

### Requirements

None.

### Business Rules

None.

### State Machines

None.

### Algorithms

None.

### External Integrations

None.

### Verification

None.

## User Stories

### US001_Login — User logs in (Priority: P0)

**What happens:** Registered user submits valid credentials and receives a session token.
**Why this priority:** Core entry point.
**Independent Test:** POST /login with valid credentials returns 200.

### Edge Cases

| Scenario | Behavior |
|----------|----------|
| Empty password | HTTP 422 |

## Key Entities

| Entity | Table | Key Columns | Purpose |
|--------|-------|-------------|---------|
| User | users | id, email | Credential lookup |

## Related Artifacts

- **Screens** (from ScreenList): SCR001_LoginForm

## Spec Documents

- [x] [System Overview](docs/specs/system-overview.md)

## Assumptions

- Password hashing uses bcrypt.

## Source Code References

| Symbol | Path | Purpose |
|--------|------|---------|
| LoginController | `app/Http/Controllers/LoginController.php:1-80` | Credential validation |

## Unresolved Questions

None.
