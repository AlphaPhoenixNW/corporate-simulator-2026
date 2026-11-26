# Repository administrative configuration

Initial private configuration and public launch follow-up recorded 26 November 2026. Settings below are owner-confirmed through screenshots and final confirmation unless stated otherwise; not independently verified through privileged APIs.

| Control | Recorded state |
| --- | --- |
| Main Branch Protection ruleset | Active, independently verified after public visibility; four rules target default branch; no bypass actors |
| Pull requests | Required; zero required approving reviews; conversations resolved; latest base required |
| Required checks | verify, Audit all, Audit production (GitHub Actions); Cloudflare Pages (Cloudflare Workers and Pages) |
| History protection | Restrict deletions, block force pushes; no linear-history or signed-commit mandate |
| Dependency graph | Enabled |
| Dependabot alerts and security updates | Enabled |
| Malware alerts | Enabled (owner confirmation) |
| Automatic dependency submission and automatic triage | Disabled; lockfile-based npm graph |
| Grouped security updates | Leave disabled; custom version-update configuration in dependabot.yml |
| Actions allow policy | Owner and selected actions, GitHub-created actions allowed; other Marketplace creators not allowed; no custom exceptions |
| Full-length SHA requirement | Enabled (owner confirmation) |
| Default workflow token | Read repository contents and packages; no Actions PR creation or approval |
| Private fork workflows (historical private setting) | Disabled before public transition |
| Other repository Actions access | Not accessible |
| Default retention | 30 days (owner confirmation); new playable artifacts explicitly seven days |

The repository is public. Ruleset enforcement verified through GitHub API. Private vulnerability reporting, CodeQL and secret scanning confirmed by screenshots; push protection, no automatic dismissal rules, all outside contributor workflow approvals and unchanged read-only workflow defaults owner-confirmed. Initial CodeQL run passed for Actions, JavaScript/TypeScript and Python; three alerts individually reviewed and owner-confirmed dismissed as false positives. Private alert inventory and privileged settings remain inaccessible to the connector. No paid plan upgrade authorised. CodeQL is not an additional mandatory merge gate at launch; review results and scope before changing the ruleset.

Dependabot initial version scans completed on main 154eb4e. Optional version PRs #29 and #30 passed; #31 failed verification. Do not infer approval to merge them from security-update configuration. Keep release baseline stable and review updates independently.

See [governance](GOVERNANCE.md), [security assurance](SECURITY_ASSURANCE.md) and [publication review](PUBLICATION_REVIEW.md).
