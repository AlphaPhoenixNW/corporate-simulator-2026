# Repository administrative configuration

Recorded 26 November 2026, after PR #28 merged. Settings below are owner-confirmed through screenshots and final confirmation unless stated otherwise; not independently verified through privileged APIs.

| Control | Recorded state |
| --- | --- |
| Main Branch Protection ruleset | Saved, four branch rules targeting default branch; not enforced on current private plan |
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
| Private fork workflows | Disabled |
| Other repository Actions access | Not accessible |
| Default retention | 30 days (owner confirmation); new playable artifacts explicitly seven days |

The repository remains private. Main protection is voluntarily observed until the ruleset can enforce it. No paid plan upgrade authorised. Verify active enforcement immediately after any authorised public visibility change; enable private vulnerability reporting, secret scanning/push protection when available, and require approval of outside contributor workflows with read-only tokens and no secrets. Do not mark these public-only items as complete before checking.

Dependabot initial version scans completed on main 154eb4e. Optional version PRs #29 and #30 passed; #31 failed verification. Do not infer approval to merge them from security-update configuration. Keep release baseline stable and review updates independently.

See [governance](GOVERNANCE.md), [security assurance](SECURITY_ASSURANCE.md) and [publication review](PUBLICATION_REVIEW.md).
