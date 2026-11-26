# Pre-publication security assurance

Operation Strategic Risk Elimination is the name for real, staged engineering work. The repository remains private; no completed security clearance is claimed.

## Stage 1: dependencies

Baseline v0.20.0, main merge cc51fe0.

| Locked dependency | Advisory | Minimum fix for this advisory | Applicability |
| --- | --- | --- | --- |
| Vite 7.1.5 | [GHSA-p4f5-76q4-ffq7](https://github.com/vitejs/vite/security/advisories/GHSA-p4f5-76q4-ffq7) | 7.3.8 | Network-exposed development server, not static hosting |
| Vitest 3.2.4 | [GHSA-5xrq-8626-4rwp](https://github.com/vitest-dev/vitest/security/advisories/GHSA-5xrq-8626-4rwp) | 3.2.5 | UI/API configuration; project uses vitest run |
| Playwright 1.55.0 | [GHSA-7mvr-c777-76hp](https://github.com/advisories/GHSA-7mvr-c777-76hp) | 1.55.1 | Certain macOS browser installation scripts |

Verified advisory ranges on 26 November 2026. Minimum fixes do not establish that the full resulting dependency graph is safe. The separate advisory for @vitest/browser is not established as applicable to installed packages.

- [x] Record advisory ranges and architecture applicability.
- [x] Add full-tree and production-only npm audits.
- [x] Capture and review baseline audit findings, including transitives: [run 45771585165](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/actions/runs/45771585165) reported zero production vulnerabilities and six full-tree findings (one moderate, three high, two critical).
- [ ] Select compatible patched dependencies, regenerate the lockfile with npm and align the Playwright container.
- [ ] Re-audit and run all regression gates; document residual risks.

Candidate versions: Vite 7.3.8, Vitest 4.1.12, Playwright 1.65.1. The audit suggested Vitest 3.2.7, but it retains Tinypool and an affected mocker version. Vitest 4 removes Tinypool ([migration guide](https://v4.vitest.dev/guide/migration.html)) and 4.1.12 includes the [mocker security fix](https://github.com/vitest-dev/vitest/security/advisories/GHSA-qxg6-89mg-rqv8). The matching Playwright Noble image is available. A temporary read-only CI job generates the lockfile using npm and audits the candidate; only the resulting reviewed manifests will be committed. No dependency upgrades yet. A failing audit is a finding to address, not a reason to bypass the check.

## Stage 2: infrastructure

- [ ] Review CI least privilege, checkout credentials, immutable references and artifact exposure.
- [ ] Review browser security headers and test workers, audio and offline behavior.
- [ ] Establish vulnerability reporting and confirm a private reporting channel.

## Stage 3: privacy

Preliminary review found noreply addresses for 118 reachable commits on the then-current branch. Targeted source and PR/comment screening found no matching credentials or personal email addresses in examined material; not a complete scan.

- [ ] Scan complete reachable history and refs for secrets and personal information; review logs, PRs and artifacts.
- [ ] Review artwork and metadata and resolve private source references.
- [ ] Review repository settings and choose safe publication history or clean distribution repository.

## Stage 4: final acceptance

- [ ] Record exact-commit security and regression evidence.
- [ ] Resolve licensing and remaining human acceptance.
- [ ] Obtain explicit owner authorisation for publication.

See [publication review](PUBLICATION_REVIEW.md), [release checklist](RELEASE_CHECKLIST.md) and [governance](GOVERNANCE.md). The [Founder's stakeholder letter](FOUNDER_SECURITY_STATEMENT.md) is fiction, not verification evidence.
