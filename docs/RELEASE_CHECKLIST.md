# Release acceptance checklist

Published v1.0.0 Executive Edition, 26 November 2026, 09:48:40 UTC. The tag resolves to 9118f9d. See [status](STATUS.md) for exact-commit evidence and [historical acceptance results](RELEASE_HISTORY.md) for earlier runs.

| Gate | Current evidence or remaining action |
| --- | --- |
| Planned gameplay | All planned increments implemented; P15 accepted for initial public release; post-launch objectives below |
| Typecheck, locked dependencies and build | Passed on release commit 9118f9d |
| Unit/integration and E2E | 173 and 47 passed on release commit 9118f9d |
| Campaign, sandbox, replay and finance | Automated legal-command regression suite passed; historical detailed balance results retained |
| Portable and hosted offline | Both smoke checks passed; owner confirms continuation, offline reopening and save export/restore |
| Companion library | 22-section source verification passed; owner confirms reading/export and approves manuscript retention |
| Human usability | Owner confirms all seven functional checks; see [human acceptance](HUMAN_ACCEPTANCE.md) |
| Autopilot | Automated checks and owner functional campaign passed; extended real-device performance/battery assessment deferred by owner approval |
| Audio and accessibility | Owner confirmed sound and accepted ambience/reward experience; comprehensive keyboard, contrast and screen-reader assessment deferred by owner approval |
| Achievements | Manual and automated awards implemented; exhaustive reachability audit deferred by owner approval |
| Documentation | EA-001 and security evidence recorded; maintain links and rendered views as documentation evolves |
| Artwork | SVG assets committed; cover metadata checked and existing artwork owner-approved under EA-001 |
| Publication | EA-001 approves existing history, MIT software and reserved literary/brand rights; artifact cleanup verified; public visibility authorised and verified; retained history and rights unchanged |
| Hosted security | Local policy passed on main 154eb4e and PR #32; live deployment probe passed on immutable main 58a7e41 deployment; canonical production address passed on release commit 9118f9d (run 45786892026); separate immutable final URL not probed |
| Governance | [Owner-confirmed settings](ADMINISTRATIVE_CONFIGURATION.md); active ruleset independently verified; public security settings confirmed by owner/screenshots |
| Final release | [Published v1.0.0](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/releases/tag/v1.0.0); correct tag, uploaded asset digest and owner acceptance verified |

## Post-launch objectives

- Comprehensive accessibility (keyboard, contrast and screen reader).
- Extended physical-device Autopilot performance and battery assessment.
- Exhaustive achievement reachability.

Owner accepted these limitations on 26 November 2026 in the PR #33 merge decision. They are not claims of completed testing. CodeQL alerts #1–3 were reviewed and owner-confirmed dismissed individually as false positives; see [security assurance](SECURITY_ASSURANCE.md).

Use [publication review](PUBLICATION_REVIEW.md) for scope and rights decisions. A green workflow does not establish privacy clearance or manual acceptance. Update this checklist with evidence, not inferred completion.
