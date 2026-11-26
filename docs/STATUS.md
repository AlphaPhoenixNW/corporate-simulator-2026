# Current project status

This is the maintained status record, not a live CI feed. Evidence is dated and attached to exact commits. The authoritative software version is [package.json](../package.json); current workflow outcomes are in [GitHub Actions](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/actions/workflows/ci.yml). Update this document when a material release decision or acceptance result changes, not for every routine run.

## Baseline recorded 26 November 2026

| Area | State |
| --- | --- |
| Software baseline | v0.20.0, Executive Autopilot; all planned gameplay increments implemented |
| Production source | Main at verified security merge 154eb4e (PR #28) |
| Hosted edition | Cloudflare Pages is configured and has been used for owner playtesting; see [deployment](DEPLOYMENT.md) |
| Portable edition | Self-contained HTML build, independently verified offline |
| Executive Library | Integrated, full 22-section reader; owner accepts retention of the manuscript |
| Corporate literature and identity | Owner accepts overall game and repository direction; literature/branding merged; formal motto approved 26 November 2026 |
| Public source release | Not yet authorised; EA-001 selects MIT software, reserved literary/brand rights, retained history and existing artwork |
| Release readiness | Security merge and main regression verified; artifact cleanup complete; owner confirms administrative settings, with public-only enforcement, live headers and human acceptance outstanding in the [release checklist](RELEASE_CHECKLIST.md) |

## Recorded verification evidence

| Commit | Scope | Result |
| --- | --- | --- |
| c38301c | Autopilot PR #26 | [Passed](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/actions/runs/45767062340), 2m 47s; Cloudflare preview passed |
| 720c174 | Autopilot merge to main | [Passed](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/actions/runs/45767711773) |
| 406bf05 | Literature and branding PR #27 | [Passed](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/actions/runs/45769589472), 173 unit/integration tests, 47 browser cases, both offline checks, companion verification and artifact upload; Cloudflare preview passed |
| cc51fe0 | Literature/branding merge | [Passed](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/actions/runs/45771225254) |
| 20e05c1 | Security PR #28 | [Simulation passed](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/actions/runs/45776938531), [dependency audits passed](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/actions/runs/45776938674), [privacy passed](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/actions/runs/45776938500); Cloudflare passed |

| ba80e6e | Corrected security PR #28 | [Simulation passed](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/actions/runs/45779062087), [audits passed](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/actions/runs/45779062063), [privacy passed](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/actions/runs/45779062279); Cloudflare passed |
| 154eb4e | Security merge to main | [Simulation passed](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/actions/runs/45779632860), [audits passed](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/actions/runs/45779632793); 173 unit/integration, 47 browser cases, 22 companion sections, portable and hosted offline, hosted policy, both audits zero vulnerabilities; Cloudflare passed |

[EA-001](EA-001.md) records the owner decisions. PR #28 is merged; public visibility is not authorised. See [administrative configuration](ADMINISTRATIVE_CONFIGURATION.md) for owner-confirmed settings and [publication review](PUBLICATION_REVIEW.md) for outstanding gates.

Dependabot initial npm and Actions update scans completed. As of this review, optional version PRs #29 (Vitest) and #30 (Vite) passed their checks, while #31 (React/types) failed verification. Review independently; no updates merged. Current audited main remains the release baseline.

These are historical evidence for those commits, not a claim that subsequent commits have passed. New documentation and code changes require verification on their own commit. No 1.0.0 tag or public-source release is claimed.

## Authority and navigation

- [Working agreement](../AGENTS.md) and [governance](GOVERNANCE.md): active development rules.
- [Architecture](ARCHITECTURE.md): current technical design.
- [Release checklist](RELEASE_CHECKLIST.md) and [publication review](PUBLICATION_REVIEW.md): outstanding gates.
- [Backlog](BACKLOG.md), [changelog](../CHANGELOG.md) and [development history](../DEVELOPMENT_HISTORY.md): historical evidence, not independent status authorities.
- [Original mandate](PROJECT_BRIEF.md): original product requirements, interpreted alongside recorded owner decisions.

The Founder and Nora's literary statements, fictional qualifications and internal certificates are satire, not project approval or technical governance.
