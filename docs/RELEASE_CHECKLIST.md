# Release acceptance checklist

Candidate: 0.15.0. Do not tag 1.0.0 until acceptance evidence is recorded.

| Gate | Required evidence | State |
| --- | --- | --- |
| TypeScript and production build | Green CI on exact release commit | Pending |
| Unit, integration and desktop/mobile browser tests | Green CI, no skipped tests | Pending |
| Standard campaign | Fresh seed, legal commands, seven stages, contained employee, certified ending | Pending |
| Relaxed campaign | Same with alternate seed and difficulty | Pending |
| Ruthless campaign | Legal-command playthrough and tuning | Pending |
| Determinism and save integrity | Replay equality, daily save round trips, cash reconciliation | Pending |
| Sandbox longevity and achievements | Multi-seed long-run tests, check rule reachability | Pending |
| Dependency lock | Commit generated package-lock.json and run npm ci | Pending |
| Desktop and mobile visual inspection | Actual rendered screenshots, overflow, readable typography | Pending |
| Accessibility | Keyboard and focus navigation, screen reader review, reduced motion, contrast | Pending |
| Audio | Human listening and mute/volume checks | Pending |
| Documentation | Run instructions, gameplay guide, known limitations and release notes | Pending |

No paid external services required. Browser-local saves and profiles remain separate. Existing manual tests must not be represented as completed without evidence.
