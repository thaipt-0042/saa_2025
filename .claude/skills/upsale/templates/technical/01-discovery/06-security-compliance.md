# Security & Compliance Surface — {PROJECT_NAME}
**Use context:** {internal|hybrid|customer-facing}

<!-- CVE lookup uses the OSV.dev API (https://api.osv.dev/v1/querybatch) as the
     authoritative source for advisory IDs. Cite exact `path:line` from a lockfile/manifest.
     If OSV is unreachable, mark entries `needs-network-verify` and use the fallback shape.
     NEVER invent CVE/GHSA IDs — every ID MUST come from an OSV response. -->

## Known-bad version flags

<!-- Source: OSV.dev /v1/querybatch. Severity from OSV CVSS when present. -->

- **{ecosystem}:** `{package}@{version}` → {CVE-XXXX-NNNN | GHSA-xxxx-xxxx-xxxx} [{severity}] — {one-line summary from OSV} (`{path:line}`)
- **{ecosystem}:** `{package}@{version}` → `possible-concern — manual verification needed (osv-api unreachable)` `needs-network-verify` (`{path:line}`)

## Outdated dependencies — major-version drift

<!-- Top direct dependencies per ecosystem (10–20 total). Each entry:
     <ecosystem>: <package>: <current> → ≈<latest-major> (<major|minor>-drift, <path:line>)
     Tag `needs-network-verify` if the "latest" claim needs network confirmation. -->

- **{ecosystem}:** `{package}`: {current} → ≈{latest-major} ({major|minor}-drift, `{path:line}`)
- **{ecosystem}:** `{package}`: {current} → ≈{latest-major} (`needs-network-verify`, `{path:line}`)

## Runtime / framework EOL

- {Runtime/framework} {version} → {EOL summary} (cite manifest `{path:line}`)

## Unscannable ecosystems

- **{ecosystem}:** manifest detected at `{path}`, CVE/outdated evaluation requires external scan.

## Dependency-vulnerability tooling presence

- {`.github/dependabot.yml` | `renovate.json` | `.snyk` | `npm audit` in CI | `pip-audit` | `cargo audit` | `govulncheck` | `trivy` | `grype` | `osv-scanner`} — `{path:line}`
- Or: `no vulnerability tooling configured`

## Secret-management posture

- `.env` files committed: {yes / no} — paths: `{path:line}` (NEVER quote values)
- Env-loading libraries: {dotenv | python-dotenv | viper | godotenv} (`{path:line}`)
- Secret-manager references: {AWS Secrets Manager | GCP Secret Manager | Vault | Doppler | 1Password} (`{path:line}`)

## License manifest

- `LICENSE` presence: {yes / no} — `{path}`
- Top-dep licenses (when discoverable): `{package} → {license}` (`{lockfile-path:line}` or `package.json#license`)

## Supply-chain hygiene

- Unpinned/loose ranges: {N} occurrences in `{lockfile-path}` (cite a few `path:line`)
- Git-ref / tarball / local-path installs: {N} occurrences (cite `path:line`)
- Lifecycle scripts (`postinstall` / `preinstall` / `install`) in third-party deps: {N} (cite `path:line`)
- Pre-release versions in production manifests: `{package}@{version}` (`{path:line}`)

<!-- Total length under 300 lines. Snapshot only — no narration. -->
