# Release acceptance checklist

Candidate: 0.15.0. Do not tag 1.0.0 until acceptance evidence is recorded.

| Gate | Required evidence | State |
| --- | --- | --- |
| TypeScript and production build | Green CI on exact release commit | Passed on initial candidate; recheck lock commit |
| Unit, integration and desktop/mobile browser tests | Green CI, no skipped tests | 133 unit and 28 browser cases passed; recheck lock commit |
| Standard campaign | Fresh seed, legal commands, seven stages, contained employee, certified ending | Passed: seed 2026, day 43, £484,815, actual 2 |
| Relaxed campaign | Same with alternate seed and difficulty | Passed: seed 42, day 43, £547,648, actual 1 |
| Ruthless campaign | Legal-command playthrough and tuning | Pending |
| Determinism and save integrity | Replay equality, daily save round trips, cash reconciliation | Passed initial candidate |
| Sandbox longevity and achievements | Multi-seed long-run tests, check rule reachability | Pending |
| Dependency lock | Commit generated package-lock.json and run npm ci | Lock recovered from successful CI; npm ci recheck pending |
| Desktop and mobile visual inspection | Actual rendered screenshots, overflow, readable typography | Pending |
| Accessibility | Keyboard and focus navigation, screen reader review, reduced motion, contrast | Pending |
| Audio | Human listening and mute/volume checks | Pending |
| Documentation | Run instructions, gameplay guide, known limitations and release notes | Pending |

No paid external services required. Browser-local saves and profiles remain separate. Existing manual tests must not be represented as completed without evidence.

Initial evidence: [CI run 45745508045](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/actions/runs/45745508045), commit `9662d5444d017832f93776d23d6063a2ab34d940`. Both playthroughs reached certified victory with the antagonist contained. Standard: 123 commands, 181 subscribers, 37 achievements, minimum cash £71,946. Relaxed: 130 commands, 192 subscribers, 34 achievements, minimum cash £109,790. Both finished at zero employee morale; difficulty and morale balance remain under review.

### Balance candidate B

Initial successful playthroughs showed large liquidity surpluses and zero morale. This candidate charges subscriber account servicing (£14/£20/£28 per client-day depending on pricing, multiplied by difficulty), increases stage overhead, reduces later financing grants and reduces the daily shareholder confidence change by two when morale is below 20. The legal-command driver now values wellbeing and tests ruthless seed 73 plus sandbox seeds 7, 42 and 2026 to day 101. The earlier results are a baseline, not evidence for the revised rules. New CI evidence is required before release.
