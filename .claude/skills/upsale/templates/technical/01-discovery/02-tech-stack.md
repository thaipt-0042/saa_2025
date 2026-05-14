# Tech Stack — {PROJECT_NAME}
**Use context:** {internal|hybrid|customer-facing}

- **Frameworks:** {web/UI/backend/ORM} — `{path:line}` per detected framework
- **Major libraries (up to 50 by weight/usage; cap = 50):**
  - `{package}@{version}` — `{path:line}`
  - … (up to 50 entries, ordered by import frequency / direct-dep priority)
- **Build tooling:** {webpack | vite | turbo | cargo | go build | gradle | …} (`{path:line}`)
- **Package manager + lockfile status:**
  - {ecosystem} — manifest `{path}`, lockfile `{path}`
  - {ecosystem} — manifest `{path}`, lockfile `{path}` or `(no lockfile)`
- **Database(s) / caches / queues / search / object storage:**
  - {service} — referenced in `{path:line}`
- **Runtime EOL judgement:**
  - Node {N} → EOL {YYYY-MM} → {SUPPORTED | UNSUPPORTED} (cite `package.json#engines`, `.nvmrc`)
  - Python {N.N} → EOL {YYYY-MM} → {SUPPORTED | UNSUPPORTED} (cite `pyproject.toml`, `.python-version`)
  - {…}

<!-- Total length under 400 lines (cap raised to fit up-to-50 library list). Snapshot only — no narration. -->
