# Current project status

This is the maintained status record, not a live CI feed. Evidence is dated and attached to exact commits. The authoritative software version is [package.json](../package.json); current workflow outcomes are in [GitHub Actions](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/actions/workflows/ci.yml). Update this document when a material release decision or acceptance result changes, not for every routine run.

## Baseline recorded 26 November 2026

| Area | State |
| --- | --- |
| Software baseline | v0.20.0, Executive Autopilot; all planned gameplay increments implemented |
| Production source | Main at verified literature/branding merge cc51fe0; security PR #28 in preparation |
| Hosted edition | Cloudflare Pages is configured and has been used for owner playtesting; see [deployment](DEPLOYMENT.md) |
| Portable edition | Self-contained HTML build, independently verified offline |
| Executive Library | Integrated, full 22-section reader; owner accepts retention of the manuscript |
| Corporate literature and identity | Owner accepts overall game and repository direction; literature/branding merged |
| Public source release | Not yet authorised; EA-001 selects MIT software, reserved literary/brand rights, retained history and existing artwork |
| Release readiness | Security/automated privacy assessment verified on 20e05c1; final exact-head/main verification, cleanup, settings and human acceptance remain in the [release checklist](RELEASE_CHECKLIST.md) |

## Recorded verification evidence

| Commit | Scope | Result |
| --- | --- | --- |
| c38301c | Autopilot PR #26 | [Passed](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/actions/runs/45767062340), 2m 47s; Cloudflare preview passed |
| 720c174 | Autopilot merge to main | [Passed](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/actions/runs/45767711773) |
| 406bf05 | Literature and branding PR #27 | [Passed](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/actions/runs/45769589472), 173 unit/integration tests, 47 browser cases, both offline checks, companion verification and artifact upload; Cloudflare preview passed |

| cc51fe0 | Literature/branding merge | [Passed](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/actions/runs/45771225254) |
| 20e05c1 | Security PR #28 | [Simulation passed](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/actions/runs/45776938531), [dependency audits passed](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/actions/runs/45776938674), [privacy passed](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/actions/runs/45776938500); Cloudflare passed |

[EA-001](EA-001.md) records the owner decisions. PR #28 is authorised for merger after verification, not for public visibility.

These are historical evidence for those commits, not a claim that subsequent commits have passed. New documentation and code changes require verification on their own commit. No 1.0.0 tag or public-source release is claimed.

## Authority and navigation

- [Working agreement](../AGENTS.md) and [governance](GOVERNANCE.md): active development rules.
- [Architecture](ARCHITECTURE.md): current technical design.
- [Release checklist](RELEASE_CHECKLIST.md) and [publication review](PUBLICATION_REVIEW.md): outstanding gates.
- [Backlog](BACKLOG.md), [changelog](../CHANGELOG.md) and [development history](../DEVELOPMENT_HISTORY.md): historical evidence, not independent status authorities.
- [Original mandate](PROJECT_BRIEF.md): original product requirements, interpreted alongside recorded owner decisions.

The Founder and Nora's literary statements, fictional qualifications and internal certificates are satire, not project approval or technical governance.
