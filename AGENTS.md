# Repository working agreement

Read docs/PROJECT_BRIEF.md, docs/ARCHITECTURE.md and docs/BACKLOG.md before changing code. The master brief is the authoritative product scope. Do not silently remove requirements or declare a partial release complete.

- Work in small, coherent increments; keep unrelated projects untouched.
- Keep the simulation deterministic and independent of React, browser APIs and real AI services.
- All durable gameplay state belongs in a versioned, serializable save. Persist seed state and pending effects.
- Add regression tests for new rules and validate typecheck, unit/integration tests, build and E2E before claiming an increment verified.
- Record actual verification results, outstanding bugs and next steps in the backlog. Never claim tests ran when they did not.
- Maintain keyboard accessibility, reduced motion and responsive layouts.
- Commit logical changes with descriptive messages. Preserve compatibility or document migration for saved games.
- No paid APIs, secret keys or live model inference. Do not introduce a licence without owner approval.
