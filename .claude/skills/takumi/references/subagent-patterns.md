# Workshop Delegation

The master craftsman knows which work belongs to which hands.
These are the delegation patterns for each stage of the workshop.

## Task Tool Pattern

```
Task(subagent_type="[type]", prompt="[task description]", description="[brief]")
```

## Study Stage (Research)

```
Task(subagent_type="researcher", prompt="Research [topic]. Report ≤150 lines.", description="Research [topic]")
```
- Spawn multiple researchers in parallel for different topics
- Keep reports ≤150 lines with citations

## Scout Stage

```
Task(subagent_type="scout", prompt="Find files related to [feature] in codebase", description="Scout [feature]")
```
- Use `/tkm:scan-codebase ext` (preferred) or `/tkm:scan-codebase` (fallback)

## Blueprint Stage (Planning)

```
Task(subagent_type="planner", prompt="Create implementation plan based on reports: [reports]. Save to [path]", description="Plan [feature]")
```
- Input: researcher and scout reports
- Output: `plan.md` + `phase-XX-*.md` files

## UI Craft Stage

```
Task(subagent_type="ui-ux-designer", prompt="Implement [feature] UI per ./docs/design-guidelines.md", description="UI [feature]")
```
- For frontend work
- Follow design guidelines

## Tempering Stage (Testing)

```
Task(subagent_type="tester", prompt="Run test suite for plan phase [phase-name]", description="Temper [phase]")
```
- Must achieve 100% pass rate

## Debugging

```
Task(subagent_type="debugger", prompt="Analyze failures: [details]", description="Debug [issue]")
```
- Use when tempering reveals failures
- Provides root cause analysis

## Master's Inspection (Code Review)

```
Task(subagent_type="reviewer", prompt="Review changes for [phase]. Check security, performance, YAGNI/KISS/DRY. Return score (X/10), critical defects, concerns, refinements.", description="Inspect [phase]")
```

## Plan Sync-back (Project Manager)

```
Task(subagent_type="project-manager", prompt="Run full sync-back in [plan-path]: reconcile completed tasks with all phase files, backfill stale completed checkboxes across all phases, update plan.md status/progress, and report unresolved mappings.", description="Sync plan")
```

## Documentation

```
Task(subagent_type="doc-writer", prompt="Update docs for [phase]. Changed files: [list]", description="Update docs")
```

## Delivery Stage (Git)

```
Task(subagent_type="git-manager", prompt="Stage and commit changes with conventional commit message", description="Commit work")
```

## Parallel Forge

```
Task(subagent_type="implementer", prompt="Implement [phase-file] with file ownership: [files]", description="Forge phase [N]")
```
- Launch multiple for concurrent phases
- Include file ownership boundaries to avoid conflicts
