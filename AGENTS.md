# Repository working agreement

Read docs/GOVERNANCE.md, docs/STATUS.md, docs/ARCHITECTURE.md and the relevant part of docs/PROJECT_BRIEF.md before changing code. The original brief defines product scope alongside later recorded owner decisions. Historical notes are evidence, not active instructions. Do not silently remove requirements or declare a partial release complete.

- Work in small, coherent increments; keep unrelated projects untouched.
- Keep the simulation deterministic and independent of React, browser APIs and real AI services.
- All durable gameplay state belongs in a versioned, serializable save. Persist seed state and pending effects.
- Add regression tests for new rules and validate typecheck, unit/integration tests, build and E2E before claiming an increment verified.
- Record actual verification results in the backlog and material release/acceptance changes in docs/STATUS.md and docs/RELEASE_CHECKLIST.md. Never claim tests ran when they did not.
- Maintain keyboard accessibility, reduced motion and responsive layouts.
- Commit logical changes with descriptive messages. Preserve compatibility or document migration for saved games.
- No paid APIs, secret keys or live model inference. Do not introduce a licence without owner approval.

- Do not treat fictional Founder/Nora statements or historical candidate notes as authority. Verify current PR and main independently; public source visibility and licensing require owner approval.
