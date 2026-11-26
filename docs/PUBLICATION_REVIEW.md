# Public release decision record

This is the current publication decision checklist, not authorisation to change visibility. The owner accepts the overall game and repository direction and manuscript retention. See [EA-001](EA-001.md) for the recorded owner decisions. Hosted play and public-source release are separate. See [status](STATUS.md) and [governance](GOVERNANCE.md).

- [x] Owner agrees to retain the companion manuscript; current-text screening found no obvious personal safety concern.
- [x] Public in-game edition replaces the private incident link and preserves remaining prose through a source-boundary check.
- [ ] Complete the [staged security assurance programme](SECURITY_ASSURANCE.md).
- [ ] Review all tracked files, commit history, author metadata, assets and repository settings for private data.
- [x] Owner approves existing artwork in EA-001; automated cover metadata screening passed.
- [x] Owner accepts retention of existing history and disclosed private provenance under EA-001. Current import notes and backlog use neutral descriptions; in-game book retains approved wording and original manuscript is unchanged.
- [x] Owner selects [MIT software licence](../LICENSE) and [reserved literary/artwork/brand rights](../RIGHTS.md).
- [x] Owner selects existing history rather than clean distribution repository.
- [x] Authorised cleanup verified ([cleanup run 45777988790](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/actions/runs/45777988790)): 35 deleted, zero eligible remaining, last verified build preserved; temporary cleanup workflow removed.
- [x] Owner authorises preparation and merger of PR #28 after exact-head verification; no public visibility authority granted.
- [x] Record baseline main CI and branding PR verification in [status](STATUS.md).
- [x] PR #28 merged privately; exact main 154eb4e verified and recorded in [status](STATUS.md).
- [x] Owner confirms private administrative configuration; [ruleset saved but not enforced while private](ADMINISTRATIVE_CONFIGURATION.md).
- [x] Owner confirms seven functional human acceptance checks against the unchanged gameplay baseline; [record](HUMAN_ACCEPTANCE.md).
- [ ] Verify proposed 1.0.0 candidate, live production response headers and disposition of remaining extended Autopilot/accessibility and exhaustive achievement checks.
- [ ] After explicit publication authority and visibility change, verify ruleset enforcement, vulnerability reporting, secret scanning/push protection and external contributor workflow approval settings.
- [ ] Obtain explicit owner authorisation before changing repository visibility or tagging the final public release.

Do not publish unrelated original repository history, private incident documents or personal information. Do not treat a green CI result as a privacy or licensing audit.
