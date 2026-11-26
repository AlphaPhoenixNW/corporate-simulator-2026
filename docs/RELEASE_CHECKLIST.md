# Release acceptance checklist

Candidate: 0.15.0. Do not tag 1.0.0 until acceptance evidence is recorded.

| Gate | Required evidence | State |
| --- | --- | --- |
| TypeScript and production build | Green CI on exact release commit | Passed balance candidate B |
| Unit, integration and desktop/mobile browser tests | Green CI, no skipped tests | 139 unit and 28 browser cases passed |
| Standard campaign | Fresh seed, legal commands, seven stages, contained employee, certified ending | Passed B: seed 2026, day 42, £325,030, actual 1 |
| Relaxed campaign | Same with alternate seed and difficulty | Passed B: seed 42, day 42, £412,273, actual 0 |
| Ruthless campaign | Legal-command playthrough and tuning | Passed B: seed 73, day 43, £279,678, actual 0 |
| Determinism and save integrity | Replay equality, daily save round trips, cash reconciliation | Passed balance candidate B |
| Sandbox longevity and achievements | Multi-seed long-run tests, check rule reachability | Three 100-day runs passed; exhaustive award reachability not yet verified |
| Dependency lock | Commit generated package-lock.json and run npm ci | Passed locked installs and balance candidate B |
| Desktop and mobile visual inspection | Actual rendered screenshots, overflow, readable typography | Pending |
| Accessibility | Keyboard and focus navigation, screen reader review, reduced motion, contrast | Pending |
| Audio | Human listening and mute/volume checks | Pending |
| Documentation | Run instructions, gameplay guide, known limitations and release notes | Pending |

No paid external services required. Browser-local saves and profiles remain separate. Existing manual tests must not be represented as completed without evidence.

Initial evidence: [CI run 45745508045](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/actions/runs/45745508045), commit `9662d5444d017832f93776d23d6063a2ab34d940`. Both playthroughs reached certified victory with the antagonist contained. Standard: 123 commands, 181 subscribers, 37 achievements, minimum cash £71,946. Relaxed: 130 commands, 192 subscribers, 34 achievements, minimum cash £109,790. Both finished at zero employee morale; difficulty and morale balance remain under review.

### Balance candidate B

Initial successful playthroughs showed large liquidity surpluses and zero morale. This candidate charges subscriber account servicing (£14/£20/£28 per client-day depending on pricing, multiplied by difficulty), increases stage overhead, reduces later financing grants and reduces the daily shareholder confidence change by two when morale is below 20. The legal-command driver now values wellbeing and tests ruthless seed 73 plus sandbox seeds 7, 42 and 2026 to day 101. The earlier results are a baseline, not evidence for the revised rules. Candidate B passed all automated gates in [run 45746084184](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/actions/runs/45746084184) at commit 38478f6. Merged PR #14. Standard final morale 30, relaxed 46, ruthless 36. The three sandbox runs survived 100 days; cash remained positive. Economic challenge still requires human playtesting.

### Private playtest packaging

Portable HTML build, offline Chromium smoke checks at desktop and mobile sizes, save reload, no external network requests, screenshots and a downloadable CI artifact are pending verification. See PLAYTEST_GUIDE.md. Human visual, screen reader and audio review remain open. No public deployment or release tag has been authorised.

## Onboarding and distribution candidate

Portable 0.15.0 release candidate passed CI run 45746747228 on main. 0.16.0 adds a title screen, guided gameplay, backup transfers, manifest, service worker and deployment preparation. Verify the exact new commit, portable build and offline production preview. Human testing of installation on actual devices, audio, accessibility and player experience remains open; no public host connected.
