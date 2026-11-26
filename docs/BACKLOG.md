# Development backlog

Status: staged implementation, not a complete game. Checkboxes represent accepted work, not merely planned code.

- [x] P0 Preserve complete project brief; establish working agreement and architecture.
- [ ] P1 Foundation: Vite/React/TS, deterministic turn engine, 11 metrics, action capacity, initial economy, decisions, local persistence, responsive dashboard, automated tests and verification.
- [x] P2 Ten departments; budgets, influence, politics, differentiated mechanics, staffing and unlocks.
- [x] P3 Persistent employee identities, ten archetypes, relationships, hiring, promotions, reviews, discipline, redundancies, restructuring.
- [ ] P4 Meetings: all eight types, attendance, costs, follow-up scheduling, documentation.
- [ ] P5 Communications: all nine formats, social network, engagement, influencers and scandals.
- [ ] P6 Transformation programmes: all nine, scope creep, consultants, dependencies, milestones, governance, usefulness incidents.
- [ ] P7 Finance expansion: subscription revenue, predictive savings, debt, acquisitions, share price, earnings, reports, bonuses and balance.
- [ ] P8 NOTHING OS: boot, desktop, apps, settings, diagnostics, licences, compliance, shutdown and paid restart.
- [ ] P9 Agent orchestration: all six roles, model choice, simulated tokens/costs, workflows, adoption and hallucinations.
- [ ] P10 Event library: at least 150 distinct authored events with choices, consequences, delayed effects and persistent flags.
- [ ] P11 Seven campaign stages, unlocks, difficulty, endings, sandbox.
- [ ] P12 Competent employee boss: multi-stage legitimate corporate interventions.
- [ ] P13 At least 60 functional achievements and animations.
- [ ] P14 Visual/audio polish, charts, accessibility, reduced motion, keyboard, mobile.
- [ ] P15 Balance, regression, E2E, documentation, release readiness.

## Working practice

Implement in dependency order, update this file after each increment with evidence, and do not mark a milestone complete until its quality gates pass. All original requirements remain in PROJECT_BRIEF.md.

## Increment 0.1.0 — 2026-11-26

Implemented and committed:
- Vite, React and TypeScript application configuration.
- Seeded command-driven engine, two daily action slots, ten bounded scores plus cash, financial ledger, bonuses, three failure states.
- Seven actions; four branching events, two with delayed effects; deterministic event selection.
- Validated versioned local save, reset and custom seed.
- Responsive navy/cream/gold executive dashboard, accessible labels, keyboard focus, reduced-motion control.
- Seven Vitest cases and Playwright scenario configured for desktop and mobile Chromium.
- GitHub Actions workflow for typecheck, unit tests, production build and E2E.

**Verification:** GitHub Actions run 45738801621 on commit dcf0836 passed dependency installation, typecheck, all seven unit/integration tests, production build, Chromium installation and desktop/mobile E2E. Fixed nullable test fixture typing (97c3fef) and pinned Ubuntu 24.04 for Playwright compatibility (dcf0836). P1 remains open for lockfile and initial balancing/UX checks. P2 can proceed on this verified baseline. Do not mark the full game complete.

## Increment 0.2.0 — 2026-11-26

- All ten department definitions, individual objectives, daily budgets, headcount and payroll, influence competition, morale, competence, governance/operations focus, resource requests, unique incidents and daily reports.
- Three departments start active; others unlock by working day and require executive capacity and an establishment fee. These day gates are provisional until the campaign system arrives.
- Ten new department-specific branching events, filtered by active departments; now 14 events total.
- Budget allocation, headcount management and focus controls integrated with cash, capacity, metrics and persistence.
- Save schema v2, with backward-compatible migration of v1.
- Responsive department dashboard; nine new unit/integration tests and one new E2E scenario on desktop/mobile.
- Verification: PR #1 passed all CI gates (run 45739290421) and merged to main at 21032f8. P2 accepted.  Individual employees and richer relationships/restructuring belong to P3, campaign unlocks to P11, and economy tuning to P7/P15. Dependency lockfile remains outstanding.

## Increment 0.3.0 — 2026-11-26

- Seeded persistent employee identities, ten archetypes, skills, ambitions, individual salaries, morale, politics, and career history.
- Named recruitment via department actions; individual reviews, promotions, disciplinary proceedings, redundancy with severance, and reassignment. Department headcount and competence derive from active staff; individual salaries replace flat payroll.
- Daily employee simulation: useful work, promotion requests, complaints, resignations, archetype-specific effects and persistent pairwise alliances/rivalries.
- Personnel directory, filtering and accessible individual controls; V1/V2 to V3 save migration.
- Nine new unit/integration cases and one desktop/mobile E2E scenario. P3 passed all checks in run 45739687827 and merged in PR #2 at dbbef8b. Salaries, limits and probability tuning provisional; richer relationship dynamics and employee-specific authored events will expand during later milestones. Minimum one active employee per department is retained to preserve operational integrity.

## Increment 0.4.0 — 2026-11-26

- Eight meeting types, scheduling and cancellation, named attendees, calendar capacity, meeting fees, person-minutes, and attendance history.
- Meetings run at day close and reduce individual and departmental operational time, employee morale and actual productivity while increasing perceived productivity and bureaucracy.
- Procedural outcomes, conflicting recommendations, document records and automatic follow-up chains.
- Responsive governance calendar and history; save schema V4 with V1–V3 migration.
- Ten unit/integration cases and desktop/mobile E2E scenario. P4 pending CI. Fees, capacity ceilings and follow-up depth are provisional. Stand-up bookings are manual; automatic recurring series and richer document formats can be added during polish. Lockfile and general balance checks remain outstanding.
