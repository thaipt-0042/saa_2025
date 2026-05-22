# Improvement Aspect — Security & Dependencies

**Track:** technical · **Aspect:** 06 of 14 · **Slug:** `security-and-dependencies`
**Read first:** `references/technical/02-improvement.md` — Shared rules, Ownership map, Entry format, and Value rubric apply unconditionally.
**Output:** `plans/upsale/technical/02-improvement/06-security-and-dependencies.md`
**Template:** `templates/technical/02-improvement/06-security-and-dependencies.md`

## Goal
Enumerate security, dependency-hygiene, and tech-debt / modernization improvement opportunities: exposed secrets, outdated dependencies with known CVEs, auth/authz gaps, input validation holes, injection risks, missing security headers, supply-chain vulnerabilities; outdated packages, unused dependencies, license conflicts, supply-chain risk, missing lockfiles, pinning strategy, known-vulnerable transitive deps; legacy framework versions, deprecated APIs in use, outdated patterns, migration paths to current ecosystem standards, EOL runtime upgrades, removed-in-next-major deprecations.

Every entry MUST emit `Category: security-and-dependencies` per the shared Entry format. The three sub-topics above (security / dependency-hygiene / tech-debt-modernization) are scope hints for the aspect, not Category values — encode the specific concern in `Observation:` instead.
