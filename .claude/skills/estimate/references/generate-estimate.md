# Generate Estimate — Workflow Reference

Estimate development effort based on Function List and project data source. Must be ran after generating function list.

## Purpose

Estimate function development effort by analyzing Function List, Screen Flow, and project data.
Output should include CSV and Markdown files (saved under `outputs/`) but **NOT printed** in chat.

---

## Data Provider

All queries use the **configured data provider** (default: `clio_query` MCP tool via Clio Knowledge Graph).
See `SKILL.md` → Data Provider section for setup and configuration.

---

## Workflow

### Step 0: Check for Project Configuration

**Check for config file in the current directory:**
1. **Look for `.estimate.yml`** — if exists, read and extract `project_id`
2. **If not found, look for `.clio.yml`** — if exists, read and extract `project_id`
3. **If neither exists:** Ask user for `project_id`

---

### Step 1: Load Context

1. Read files from `outputs/` using the `project_id`:
   - `function_list_{project_id}_*.csv`

2. Summarize the project domain and flow briefly (100 words or less).

---

### Step 2: Query Project Data Source

Perform 8 queries using the data provider tool (default: `clio_query`) sequentially:

**Query 1 — Technology Stack**
`query`: `"Technology stack, programming language, framework, frontend, backend, database"`
Extract: frameworks, database, API style, tooling. Reason about how tech stack affects development speed.

**Query 2 — Architecture Patterns**
`query`: `"Architecture patterns, design patterns, layered architecture, microservices"`
Extract: architectural style, separation layers, reusability. Reason about complexity & maintainability.

**Query 3 — Testing Strategy**
`query`: `"Testing requirements, test coverage, unit testing, integration testing, QA"`
Extract: testing phases, coverage level, QA effort. Reason about testing overhead multiplier.

**Query 4 — Reusable Components**
`query`: `"Reusable components, shared utilities, common functions, Springer extensions"`
Extract: utilities and shared patterns. Reason about reusability multipliers.

**Query 5 — Team Structure & Personnel**
`query`: `"Team members, developers, personnel, team size, roles, responsibilities"`
Extract: team size, role distribution, available resources. Reason about team capacity.

**Query 6 — Skill Levels & Experience**
`query`: `"Developer level, experience, seniority, junior, senior, expert, skill level"`
Extract: team experience level, skill distribution. Reason about velocity multipliers.

**Query 7 — Project Timeline & Effort**
`query`: `"Project duration, timeline, man-month, MM, effort estimation, schedule, deadline"`
Extract: total project duration, man-months allocated, deadlines. Reason about time constraints.

**Query 8 — Historical Project Data**
`query`: `"Previous projects, historical data, past estimates, actual effort, velocity, completed tasks"`
Extract: historical velocity, estimate accuracy. Reason about realistic velocity calibration.

---

### Step 3: Function Complexity Estimation

For each function in the CSV:

| Category | Base Effort (h) | Notes |
|-----------|----------------|-------|
| UI | Simple 2-4 / Medium 4-8 / Complex 8-16 | By field count & interactivity |
| CRUD | Read 2-3 / Create/Update 3-5 / Delete 2-4 | |
| API | Simple 2-4 / Medium 4-8 / Complex 8-16 | |
| Validation | Simple 1-2 / Medium 2-4 / Complex 4-8 | |
| Business Logic | Simple 2-6 / Medium 6-12 / Complex 12-24 | |

**Apply Multipliers:**
1. Dependency x (1.0-1.3)
2. Screen Complexity x (1.0-1.3)
3. Technical Complexity x (1.0-1.4)
4. Reusability x (0.5-1.0)
5. Testing x (1.0-1.5)
6. Team Experience x (0.7-1.3) — Sr/Expert teams faster, Jr teams slower
7. Team Size & Capacity x (0.8-1.2)
8. Historical Velocity x (0.8-1.2)

**Risk Buffers:**
+15% unclear req / +20% new tech / +25% perf/security critical.

Convert hours to story points (1-13 scale).
Assess confidence (High/Med/Low) & skill (Jr/Mid/Sr/Expert).

---

### Step 4: File Outputs (Batch Processing)

**CRITICAL: Process and Write in Batches**

Process functions in batches (~40 functions per batch) and write to files **immediately after each batch**.

**Output Files:**

**1.** `outputs/estimation_data_{project_id}.csv`
Columns: Function ID, Function Name, Screen, Category, Base Effort (h), Adjusted Effort (h), Story Points, Confidence, Skill Level, Assigned Team Member, Risks, Notes

**2.** `outputs/estimation_summary_{project_id}.md`
- Totals, breakdown by category/screen, confidence distribution, high-risk items, recommendations
- **Team & Resource Analysis**: team size, skill distribution, available MM, capacity analysis
- **Timeline Analysis**: project duration, man-months allocated, velocity projection
- **Historical Comparison**: compare with past project velocity if available

**Progress Output:**
```
Project data queried
Batch 1/n processed (40 functions) -> CSV updated
Batch 2/n processed (40 functions) -> CSV updated
...
Summary report generated
```

**Final output (5 lines max):**
```
Estimation Complete (Project: {project_id})
estimation_data_{project_id}.csv
estimation_summary_{project_id}.md
```

**Do not create or execute any Python scripts during this process.**

---

## Estimation Reasoning Guidelines

- Always consider dependencies + reusability + testing multipliers
- Calibrate estimates by function type (UI/CRUD/API/Logic)
- For each function: identify risks, confidence, skill needed
- For batch/background jobs: add complexity for scheduling & monitoring
- **Team capacity**: adjust estimates based on available MM and team size
- **Skill calibration**: Jr developers = 1.2-1.3x effort, Sr/Expert = 0.7-0.9x effort
- **Historical data**: if past velocity available, use it to calibrate story point conversion
- **Timeline pressure**: tight deadlines may require overtime or scope adjustment
- **Resource allocation**: consider parallel work capability vs. sequential dependencies
