# Current project status

This is the maintained status record, not a live CI feed. Evidence is dated and attached to exact commits. The authoritative software version is [package.json](../package.json); current workflow outcomes are in [GitHub Actions](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/actions/workflows/ci.yml). Update this document when a material release decision or acceptance result changes, not for every routine run.

## Baseline recorded 26 November 2026

| Area | State |
| --- | --- |
| Software baseline | Published v1.0.0 Executive Edition; gameplay baseline retained from v0.20.0 |
| Production source | Release tag v1.0.0 at 9118f9d (PR #33 merge); exact main verification passed |
| Hosted edition | [Live production game](https://corporate-simulator-2026.pages.dev); canonical address verified on release baseline |
| Portable edition | [Official standalone HTML](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/releases/download/v1.0.0/Corporate-Simulator-2026-v1.0.0.html); verified offline; uploaded digest matches retained CI-extracted build |
| Executive Library | Integrated, full 22-section reader; owner accepts retention of the manuscript |
| Corporate literature and identity | Owner accepts overall game and repository direction; literature/branding merged; formal motto approved 26 November 2026 |
| Public source release | Public since 26 November 2026; [v1.0.0 release](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/releases/tag/v1.0.0) published 09:48:40 UTC; EA-001 rights/history decisions retained |
| Release readiness | Launch complete; owner accepted three extended testing objectives for post-launch work. See [release checklist](RELEASE_CHECKLIST.md). |

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
| 88a115b | Motto/governance PR #32 | [Simulation passed](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/actions/runs/45783744821), [audits passed](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/actions/runs/45783744993), Cloudflare passed; 87 relative links checked, zero broken; documentation only |
| 58a7e41 | Motto/governance main merge | [Simulation passed](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/actions/runs/45784544987), [audits passed](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/actions/runs/45784545089), Cloudflare passed |
| f1bb397 | Initial proposed 1.0.0 PR #33 | [Simulation passed](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/actions/runs/45784798982), [audits passed](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/actions/runs/45784798994), [live header probe passed](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/actions/runs/45784799202), [privacy inventory completed](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/actions/runs/45784799001), Cloudflare passed; new privacy pattern matches require classification |
| 54f7aa1 | Final release candidate PR #33 | [Simulation](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/actions/runs/45785503988), [audits](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/actions/runs/45785504001), [privacy](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/actions/runs/45785503968), [live header probe](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/actions/runs/45785504215) and Cloudflare passed; privacy matches classified |
| 9118f9d | v1.0.0 release merge and tag | [Simulation](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/actions/runs/45786330006), [audits](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/actions/runs/45786330082), [canonical live headers](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/actions/runs/45786892026), [CodeQL setup](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/actions/runs/45790849871) and Cloudflare passed; 173 unit/integration and 47 browser tests, 22 sections and both offline editions |

PR #32 merged at 58a7e41 with identical tree. [Main simulation](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/actions/runs/45784544987) and [audits](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/actions/runs/45784545089) both passed. Owner functional acceptance confirmed on 26 November 2026 during PR #32 (seven checks); see [human acceptance](HUMAN_ACCEPTANCE.md).

[EA-001](EA-001.md) records the owner decisions. PR #28 was merged privately; subsequent explicit owner authority and release publication are recorded in [publication review](PUBLICATION_REVIEW.md). See [administrative configuration](ADMINISTRATIVE_CONFIGURATION.md) for owner-confirmed settings and [publication review](PUBLICATION_REVIEW.md) for completed launch decisions and remaining objectives.

Dependabot initial npm and Actions update scans completed. As of this review, optional version PRs #29 (Vitest) and #30 (Vite) passed their checks, while #31 (React/types) failed verification. Review independently; no updates merged. Current audited main remains the release baseline.

These are historical evidence for those commits, not a claim that subsequent commits have passed. New documentation and code changes require verification on their own commit. The published tag resolves to 9118f9df9e8f3e069def85db276c6a3dc887c15d. GitHub reports the release HTML as uploaded, 904490 bytes, SHA-256 `7047d21177d4c4aac4030a6a2335fe2b71d273ad18764db64bf0a7bc35725bed`, matching the locally retained exact CI-extracted HTML from artifact 15100856518. This is a comparison against GitHub's reported asset digest, not a fresh download of the published asset. The tag and asset are not changed by documentation maintenance.

## Authority and navigation

- [Working agreement](../AGENTS.md) and [governance](GOVERNANCE.md): active development rules.
- [Architecture](ARCHITECTURE.md): current technical design.
- [Release checklist](RELEASE_CHECKLIST.md) and [publication review](PUBLICATION_REVIEW.md): launch acceptance and follow-up objectives.
- [Backlog](BACKLOG.md), [changelog](../CHANGELOG.md) and [development history](../DEVELOPMENT_HISTORY.md): historical evidence, not independent status authorities.
- [Original mandate](PROJECT_BRIEF.md): original product requirements, interpreted alongside recorded owner decisions.

The Founder and Nora's literary statements, fictional qualifications and internal certificates are satire, not project approval or technical governance.
