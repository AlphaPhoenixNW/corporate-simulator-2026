# Release acceptance checklist

Current gameplay baseline: v0.20.0; proposed release version 1.0.0 (not yet tagged). Owner accepts the overall game and repository direction. This is not a final public-source release decision. See [status](STATUS.md) for recorded exact-commit evidence and [historical acceptance results](RELEASE_HISTORY.md) for earlier runs.

| Gate | Current evidence or remaining action |
| --- | --- |
| Planned gameplay | All planned increments implemented; P15 release readiness remains open |
| Typecheck, locked dependencies and build | Passed on main 154eb4e; recheck final release commit |
| Unit/integration and E2E | 173 and 47 passed on main 154eb4e; recheck exact final release commit |
| Campaign, sandbox, replay and finance | Automated legal-command regression suite passed; historical detailed balance results retained |
| Portable and hosted offline | Both smoke checks passed; owner confirms continuation, offline reopening and save export/restore |
| Companion library | 22-section source verification passed; owner confirms reading/export and approves manuscript retention |
| Human usability | Owner confirms all seven functional checks; see [human acceptance](HUMAN_ACCEPTANCE.md) |
| Autopilot | Automated checks and owner functional campaign passed; extended real-device performance/battery assessment not recorded |
| Audio and accessibility | Owner confirmed sound and accepted ambience/reward experience; comprehensive physical-device, keyboard, contrast and screen-reader review not fully recorded |
| Achievements | Manual and automated awards implemented; exhaustive reachability audit not recorded |
| Documentation | EA-001 and security evidence recorded; verify final links and rendered GitHub views |
| Artwork | SVG assets committed; cover metadata checked and existing artwork owner-approved under EA-001 |
| Publication | EA-001 approves existing history, MIT software and reserved literary/brand rights; artifact cleanup verified; owner settings configured while private; public enforcement and explicit approval pending |
| Hosted security | Local policy passed on main 154eb4e and PR #32; live deployment probe passed on immutable main 58a7e41 deployment; canonical address and final release deployment remain pending |
| Governance | [Owner-confirmed settings](ADMINISTRATIVE_CONFIGURATION.md); public-only controls pending |
| Final release | Verify exact final main commit, record owner acceptance and tag only after approval |

Use [publication review](PUBLICATION_REVIEW.md) for scope and rights decisions. A green workflow does not establish privacy clearance or manual acceptance. Update this checklist with evidence, not inferred completion.
