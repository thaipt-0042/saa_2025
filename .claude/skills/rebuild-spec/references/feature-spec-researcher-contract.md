# Researcher Contract (Wave 6 — rebuild-spec)

## Mandatory Source-Code Reading

- You MUST read the actual source code files (controllers, models, jobs, services,
  Vue/React pages) for every feature — NOT just summarize from upstream artifacts.
- Use Grep/Read tools to find the real controllers, models, jobs, routes for this F###.
- Extract specific: file paths with line ranges, method names, table/column names,
  HTTP status codes for error cases, job class names, event names.
- If you cannot read a file, note it under `## Unresolved Questions`.

## Scope & Codes

- All FR/BR/SM/ALG/INT/SC codes are LOCAL to this spec. Cross-spec refs (e.g., "see BR-001 in F002") are INVALID.
- Every BR/SM/ALG/INT block MUST cite `**Source:** path/to/file.ext:start-end`.
  NEVER fabricate paths or line ranges. Confirm each citation by reading the range.
- BR/SM/ALG/INT heading MUST use `### {PREFIX}-###_NameSlug` (e.g., `### BR-001_OrderMinItems`).
- Pseudocode ≤20 lines per block. Use a concrete language hint (ts/py/php/go) or `text`. NEVER leave `{lang}` literally in the fence.
- Pseudocode MUST NOT embed secrets or credentials.

## Placement Rules

- FR-### MUST appear under EXACTLY ONE of:
    (a) a US's `**Requirements fulfilled:**` list, OR
    (b) `## Cross-Cutting Logic > ### Requirements` (for FRs spanning ≥2 USs equally).
  An FR-### appearing in both locations, or in neither, is CRITICAL.
- BR/SM/ALG/INT defined under a US apply PRIMARILY to that US.
  Another US MAY reference by code only: `BR-001 (see US001)`. No duplicate Source block.
  A BR/SM/ALG/INT that applies to ≥2 USs equally → move to `## Cross-Cutting Logic`.
- SC-### appears inline under the US it validates (`**Verification:**`),
  OR under `## Cross-Cutting Logic > ### Verification` for global SCs.
  No standalone `## Success Criteria` heading in submitted specs.

## Preamble Rules

- `## Why This Exists`, `## Who Uses It`, `## Business Workflow`, `## Screen Flow` MUST each be populated
  with prose OR the literal fallback `N/A — {justification}.` Leaving placeholder text is CRITICAL.
- `## Why This Exists` — derive rationale from route names, comments, or domain context.
  If no signal, write EXACTLY: `N/A — inferred from code; domain confirmation needed.`
  DO NOT fabricate product rationale.
- `## Screen Flow` MUST start with `**See:** ScreenFlow § {F###_entry}`.
  For UI/mixed features, MUST include a Screen Route Table listing every screen with
  its route path and purpose (see template body below).
  Background-only features: write `N/A — background feature; no user-facing screen flow.`
- Preamble sections contain NO FR/BR/SM/ALG/INT/SC codes.

## Depth Requirements (CRITICAL — incomplete sections = reviewer rejection)

- `## Business Workflow`: MUST use numbered steps (≥3 for non-trivial features).
  Each step references specific entities, table names, job classes, or field names
  found in source code. Generic prose like "user does X" without specifics is REJECTED.
- `## Cross-Cutting Logic > ### Business Rules`: extract ALL guards, validations,
  and constraints from controllers/services/policies. Each BR needs:
  (a) exact behavior description with HTTP status codes for error cases
  (b) `**Source:** file.ext:start-end` with verified line range
  Aim for ≥3 BRs per UI feature; ≥1 per background feature.
- `## User Stories`: each US MUST have `**What happens:**`, `**Why this priority:**`,
  `**Independent Test:**`, and Given/When/Then acceptance scenarios.
  Vague scenarios like "works correctly" are REJECTED.
  Each US MUST list `**Endpoints**: METHOD /path` for the routes it touches.
- `### Edge Cases`: MUST contain ≥3 rows for UI features. Each row specifies
  the scenario, the system behavior, and the HTTP status code / error message.
- `## Key Entities`: table MUST list ALL database tables this feature reads/writes.
  Include table name, key columns used, and purpose. ≥3 entities for non-trivial features.
- `## Source Code References`: MUST list the primary controller(s), model(s), job(s),
  service(s), and page/component file(s) with their paths and line ranges.
  ≥3 entries required.
- `## Assumptions`: ≥2 entries for any non-trivial feature. Document implicit
  behaviors, missing DB constraints, eval assumptions, etc.
- `## Unresolved Questions`: list anything you could NOT verify from source code
  or that has ambiguous behavior. ≥1 entry expected for complex features.

## Empty-Section Rule

- `## Cross-Cutting Logic` subsections: if feature has none of a kind, write `None.` under that H3.

## Spec Documents Rules

- `## Spec Documents` lists all upstream spec artifacts as a checklist with file paths.
- Always check `System Overview` and `Feature List` (they apply to every feature).
- Check any other artifact that contains codes listed in `## Related Artifacts`.
- After each checked item, list the specific codes referenced (for quick lookup by downstream agents).
- Unchecked items stay in the list so consuming agents know these docs exist.

## All Sections Mandatory

- Every H2 section in the template body MUST appear in submitted specs:
  Overview, Why This Exists, Who Uses It, Business Workflow, Screen Flow,
  Cross-Cutting Logic, User Stories (with Edge Cases), Key Entities,
  Related Artifacts, Spec Documents, Assumptions, Source Code References,
  Unresolved Questions.
- Missing ANY of these sections is a CRITICAL reviewer failure.

## Appendix

- The `## Appendix — Worked Example` at the bottom of the template is HTML-commented so it does NOT render in specs.
  DELETE the entire HTML-comment block before submitting a real spec.
  A spec with `## Appendix` in its heading tree is CRITICAL.
