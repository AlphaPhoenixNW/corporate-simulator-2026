# Development backlog

Status: staged implementation, not a complete game. Checkboxes represent accepted work, not merely planned code.

- [x] P0 Preserve complete project brief; establish working agreement and architecture.
- [x] P1 Foundation: Vite/React/TS, deterministic turn engine, 11 metrics, action capacity, initial economy, decisions, local persistence, responsive dashboard, automated tests and verification.
- [x] P2 Ten departments; budgets, influence, politics, differentiated mechanics, staffing and unlocks.
- [x] P3 Persistent employee identities, ten archetypes, relationships, hiring, promotions, reviews, discipline, redundancies, restructuring.
- [x] P4 Meetings: all eight types, attendance, costs, follow-up scheduling, documentation.
- [x] P5 Communications: all ten formats, social network, engagement, influencers and scandals.
- [x] P6 Transformation programmes: all nine, scope creep, consultants, dependencies, milestones, governance, usefulness incidents.
- [x] P7 Finance expansion: subscription revenue, predictive savings, debt, acquisitions, share price, earnings, reports, bonuses and balance.
- [x] P8 NOTHING OS: boot, desktop, apps, settings, diagnostics, licences, compliance, shutdown and paid restart.
- [x] P9 Agent orchestration: all six roles, model choice, simulated tokens/costs, workflows, adoption and hallucinations.
- [x] P10 Event library: at least 150 distinct authored events with choices, consequences, delayed effects and persistent flags.
- [x] P11 Seven campaign stages, unlocks, difficulty, endings, sandbox.
- [x] P12 Competent employee boss: multi-stage legitimate corporate interventions.
- [x] P13 At least 60 functional achievements and animations.
- [x] P14 Visual/audio polish, charts, accessibility, reduced motion, keyboard, mobile.
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
- Ten unit/integration cases and desktop/mobile E2E scenario. P4 passed all checks in run 45739968402 and merged in PR #3 at 312d374. Fees, capacity ceilings and follow-up depth are provisional. Stand-up bookings are manual; automatic recurring series and richer document formats can be added during polish. Lockfile and general balance checks remain outstanding.

## Increment 0.5.0 — 2026-11-26

- Ten communication formats (the original brief enumerates ten), contextual local templates, executive publishing costs and capacity, daily bulletins and employee social posts.
- Align™ tracks impressions, reactions, comments, executive congratulations, influencer rankings, viral events and persistent scandals with targeted apology responses.
- Existing announcement, consultancy and employee-review actions generate communications; six new branching events, 20 total.
- Responsive publishing desk, filtered communication history, social comments and crisis controls. Save V5 migrates V1–V4.
- Nine unit/integration cases and desktop/mobile E2E scenario; P5 passed all checks in run 45740556589 after correcting v3 save migration and merged in PR #4 at aa204ab. Template diversity, engagement balancing and additional event integration remain later polish tasks. Lockfile still outstanding.

## Increment 0.6.0 — 2026-11-26

- Nine authored transformation programmes and 27 milestone gates; sponsor and prerequisite rules, named leads, spending ceilings, consultancy invoices, lead availability, scope expansion and usefulness incidents.
- Actual steering committees must be held before approval; integration with meeting attendance, employee status, departmental governance, corporate communications and cash ledger.
- Portfolio dashboard, programme controls and history. Six further branching events (26 total). V6 migrates V1–V5.
- Ten unit/integration cases and desktop/mobile E2E scenario. P6 passed all checks in run 45741039232 and merged in PR #5 at 65abe0a. Programme budgets, fees and risk require balancing; committee costs are accounted separately; transformation programmes are single-instance per save. Lockfile outstanding.

## Increment 0.7.0 — 2026-11-26

- Persistent subscription customers, three pricing strategies, hypothetical savings invoices, regulatory exposure and churn; sales department affects acquisition yield.
- Credit drawdown, repayments, interest and debt ceiling; three acquisition targets with recurring receipts, costs and usefulness incidents.
- Centralized cash flow classification, reconciled operating results, financing and investing, daily investor sentiment and indicative share price, accelerated 20-day quarterly reports with shareholder communications.
- Financial dashboard, market history chart, controls and reporting; six additional branching events (32 total). V7 migration starts reporting at existing cash/day.
- Eleven new unit/integration cases and desktop/mobile E2E scenario. P7 passed CI in run 45741496382 and merged in PR #6 at f2a8c87; economic balancing remains a release task. Share price is indicative until public listing, accounting is cash-basis not full GAAP/IFRS, and debt/fee assumptions are provisional. Lockfile outstanding.

## Increment 0.8.0 — 2026-11-26

- Fictional OS with animated boot/shutdown, responsive desktop, ten applications/consoles, persistent licence lifecycle, three compute profiles, diagnostics and compliance review.
- Initial £1,200 entitlement, £2,500 restart licence, simulated token demand and expense recorded through the corporate ledger; offline mode eliminates demand and records avoided tokens.
- Four new branching events (36 total). V8 migration supports V1–V7. Eight unit/integration cases and desktop/mobile E2E scenario. P8 passed CI in run 45742030933 and merged in PR #7 at c9b9ece. Existing corporate apps are linked from live OS consoles rather than duplicated. Full multi-agent workflows belong to P9; token budgets and licence charges remain provisional. Lockfile outstanding.

## Increment 0.9.0 — 2026-11-26

- Six agent roles, chained outputs, three simulated models, objectives, token budgets, executive adoption and strict/permissive governance.
- Persistent workflow traces, hallucination and usefulness outcomes, operational reports, token and cost counters, corporate ledger and OS power integration.
- Agent control centre with execution diagram, OS console, six new branching events (42 total), V9 save migration.
- Ten unit/integration cases and desktop/mobile E2E scenario. P9 passed CI in run 45742438242 and merged in PR #8 at acb842e. Models and reports are local authored simulations; budget applies to full agent workflows, separate from baseline OS overhead. OS avoided-token counter measures baseline only. Model pricing and risk are provisional. Lockfile outstanding.

## Increment 0.10.0 — 2026-11-26

- 108 individually authored additional events; 150 total with two meaningful choices each, twelve categories, 36 new delayed-effect scenarios and twelve branching continuations.
- Context-aware selection, department gates, system prerequisites, minimum day and persistent previous-choice conditions. Due unseen continuations take priority; resolved continuations do not repeat.
- Immediate effects displayed at decision time; decision archive, category progress and pending consequence dates; V10 migration preserves encountered IDs without fabricating old choices.
- Eight unit/integration cases and desktop/mobile E2E scenario. P10 passed CI in run 45743104484 and merged in PR #9 at a18ea5b. Event cadence remains every three working days; triggers are primarily category-level, not all tied to individual live incidents. Choice balance and long-run event distribution need P15 tuning. Lockfile outstanding.

## Increment 0.11.0 — 2026-11-26

- Seven stages with explicit progression gates, capital injections, stage overhead, expanded executive capacity, progressive department availability and simulated public listing.
- Three difficulties, three scenarios (two unlockable through a separate local profile), sandbox without stage victory, existing three failure endings and provisional final certification.
- Campaign dashboard and new-game configuration; V11 migration preserves all prior systems while starting the new progression at stage one.
- Ten new unit/integration cases and desktop/mobile E2E. P11 passed CI in run 45743521884 and merged in PR #10 at bc8435e. Campaign criteria and economy need end-to-end balancing; final certification must incorporate the competent employee confrontation in P12. Sandbox retains failure rules. Public listing changes market status and scrutiny, not real stock trading. Lockfile outstanding.

## Increment 0.12.0 — 2026-11-26

- Final-stage encounter, real named 100-skill employee, board retention protection, daily useful-work pressure scaled by available time.
- Five interventions: promotion, actual steering committee attendance, departmental reassignment, two qualifying training days, three funded dedicated transformation governance days. Final certification gates containment.
- Dashboard, persistent audit trail, payroll and corporate ledger integration, employee calendar and time utilisation, V12 migration. Ten unit/integration cases and desktop/mobile E2E. P12 passed CI in run 45744082038 and merged in PR #11 at 764456f. Boss pressure, fees and time requirements provisional; the dedicated encounter programme is separate from the regular nine-programme portfolio. Legacy completed campaigns retain their ending. Lockfile and balance work outstanding.

## Increment 0.13.0 — 2026-11-26

- 74 unique gameplay-driven achievements across eight categories, all requested named awards included. Successful executive action counts, best inactivity streak, observable state and ending predicates. No gameplay metric rewards.
- Persistent per-run unlocks and separate lifetime browser collection, category progress, filters, animated dismissible notification with reduced-motion handling. V13 migration; historical action counts are not invented.
- Ten unit/integration cases and desktop/mobile E2E. P13 passed CI in run 45744481496 and merged in PR #12 at 920cd3b. Achievement notification is within the awards panel; global notification placement and wider visual/audio polish remain P14. Thresholds and long-run attainability require P15 balancing. Lockfile outstanding.

## Increment 0.14.0 — 2026-11-26

- Refined navy/gold/cream design system, executive intelligence charts, real cash history, live interactive organisation diagram, grouped desktop navigation and compact mobile jump selector.
- Global notification centre, contextual original synthesized sound cues, optional looping hold music, persistent audio/volume/reduced-motion preferences; silent by default. Keyboard focus, responsive layouts, accessible chart data and announcement regions.
- Seven unit/integration cases and desktop/mobile E2E scenario. P14 passed CI in run 45744998609 and merged in PR #13 at aa8a180. Manual visual/audio/accessibility review remains in P15. No save schema change or external audio assets. Browser audio is gesture-gated and requires manual listening verification; full visual/accessibility audit and campaign balance remain P15 release work. Lockfile outstanding.

## Increment 0.15.0 — 2026-11-26

- Release playthrough driver uses only public game commands, validates saved state every working day, and emits campaign outcomes for standard and relaxed seeds; full victory is required by the tests.
- Added deterministic replay and save cash reconciliation guard; unknown runtime command types no longer advance time.
- CI captures a generated dependency lock for retrieval and conversion to npm ci. The release gate is not complete until the lock is committed and checked. P1 and P15 remain open pending evidence. See RELEASE_CHECKLIST.md.

Release verification update: run 45745508045 passed all gates, including full standard seed 2026 and relaxed seed 42 campaign victories on day 43, replay equality, and daily save validation. Recovered the actual generated npm lockfile from job logs, validated manifest correspondence, and switched CI to npm ci. Reverification pending. P1/P15 remain open until remaining acceptance checks are satisfied.

Balance candidate B: recurring customer servicing costs, higher stage overhead, reduced later capital grants, low-morale confidence pressure, wellbeing-aware test driver, ruthless and three 100-day sandbox playthrough gates. No save schema changes. Existing victory/replay tests remain required; these parameters are provisional until measured. Manual audit and release deployment remain open.

Balance candidate B passed 139 unit/integration tests and 28 browser cases in run 45746084184, including three campaign victories and three 100-day sandbox runs. Locked installs verified. PR #14 merged at f66cd02. P15 remains open for manual playtesting, remaining award reachability, release notes and final tag. Private playtest packaging adds self-contained HTML, offline browser smoke checks, screenshots, and guide. No public exposure of repository or game configured.
