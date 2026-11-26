# Architecture

## Design decisions

- TypeScript + React + Vite, client-only. Monetary values use integer pounds; scores use bounded 0–100 values. The initial economy is deliberately provisional and will be tuned through simulation tests.
- A deterministic simulation owns the rules. Commands create new state; UI reads state and dispatches commands. No UI dependency in the engine.
- One turn = one working day. Actions consume executive capacity; the end-day transaction applies costs, revenue, employee output, scheduled effects and new events. A pending decision must be resolved before the next day.
- Seeded random state travels with saves. Versioned local storage; reject invalid or unsupported saves rather than silently reinterpret.
- Later modules: departments, people, meetings, communications, programmes, finance, events, campaign, achievements, OS and agents. Integrate through typed commands and explicit daily phase functions; keep rule order deterministic.
- Stage progression, sandbox and difficulty will share the engine. No remote services.
- Visual direction: serious enterprise suite, navy/cream/gold, responsive layout. Satire is expressed through copy and rules, not cartoon visuals.

## Quality gates

Unit tests: deterministic rules, boundaries, finance and event choices.
Integration tests: full daily lifecycle and save round trips.
E2E: start a game, act, resolve event, advance, reload; mobile and keyboard paths.
CI: install dependencies, typecheck, test, build and run browser tests. Balance and accessibility checks expand as systems arrive.

## Release gate

All 15 brief sections implemented, 150 authored branching events and 60 functional achievements, campaign and boss playable, sandbox available, verified local build and tests, accessibility and balancing pass, player documentation. A foundation is not the release.

## Department module (0.2.0)

DepartmentState stores aggregate staffing until the individual employee module replaces this with derived headcount. Daily operating allocation and payroll are expenses, not prepaid reserves. Executive department commands consume the same daily capacity as global actions. The engine settles departmental operations after base daily revenue and overhead, before scheduled effects and event selection. Department events are eligible only when the corresponding unit is active. V1 saves migrate deterministically to V2 by introducing default departments; preserve all other saved fields. The existing local storage key is retained deliberately to discover legacy saves.

## Employee module (0.3.0)

Employee IDs are monotonically allocated; identity generation hashes game seed and ID independently of daily RNG. Employees retain historical status, grade, department and personnel records. Department headcount and operational competence are synchronized from active employees; actual individual daily payroll is charged in departmental operations, replacing flat payroll. Promotions reduce effective competence and raise salary. One seeded pairwise interaction per day updates persistent relationship affinity; daily employee effects follow departmental operations. Save V3 migration generates named employees for existing staffing allocations without consuming the daily RNG or changing cash/day. Minimum staffing is one employee per active department until campaign restructuring is expanded.

## Meeting module (0.4.0)

Meeting IDs are monotonic. Bookings reserve named employees and a working day, with per-person 480-minute and eight-meeting daily limits. The day transaction settles due meetings before department and employee activity, preserving payroll and charging actual attendance fees. Attendance time scales departmental routine/progress and employee work probability. Follow-ups preserve parent IDs and are capped at four generations. Meeting outcomes and document names persist. Migration to V4 preserves all V3 identities, RNG and finances while initializing an empty calendar.

## Communication module (0.5.0)

Persistent communication IDs, contextual templates and deterministic RNG produce internal and external records. Ten format definitions supply publication costs and metric effects. Daily communications follow employee operations and update recent social posts before generating a bulletin and a named employee post. Virality and scandal flags are persistent, prevent repeat rewards, and drive corporate metrics; targeted apologies link to their source record. Executive congratulations are limited to one per post. V5 adds an empty communications archive to older saves while preserving all other state.

## Transformation module (0.6.0)

Programme type is a stable single-instance key. Commission validates sponsor, dependencies and an active named lead. Daily work accrues consultancy expenses against a ceiling, and consumes lead availability remaining after meetings. Each of three milestones enters a review state and links to an actual steering meeting; approval requires recorded attendance. Scope expansion increases the work target; competence and governance influence accidental usefulness. Programme completion applies type-specific effects. Portfolio execution follows employee operations and precedes communications. V6 adds an empty portfolio to older saves.

## Finance module (0.7.0)

All cash writes pass through record(), classifying receipts and expenses as operating by default and explicitly separating debt principal and acquisitions as financing and investing. FinanceState maintains current-period and lifetime totals independently of the truncated transaction ledger. Daily settlement adds subscriptions, hypothetical savings invoices, interest and acquisition operating flows, then updates sentiment and price and closes accelerated 20-day quarterly reports. Each close reconciles opening cash + operating result + financing + investing to closing cash. Delayed event cash effects posted after day increment belong to the next working day. Legacy saves initialize financial reporting at their existing cash balance and day. No retrospective data fabrication; prices are integer pence and private indicative valuations until campaign listing.

## OS module (0.8.0)

OSState stores the deterministic power and licence lifecycle, profiles, token and expense counters, diagnostics and audit history. The desktop is a React view; animation is presentation-only and never delays state changes or persistence. Boot consumes capacity and a licence fee; shutdown expires entitlement and resets active demand to zero. Daily settlement occurs before finance close, posting simulated inference expenses once. Offline days after first activation accumulate avoided token demand. The simulator itself does not shut down. Later agent orchestration must share the power gate and avoid double-counting infrastructure tokens. V8 initializes an offline, unlicensed OS for older saves.

## Agent orchestration (0.9.0)

AgentState tracks configuration, monotonic run IDs, lifetime counters and the latest 60 reports. At day close, enabled workflows execute only with the OS online and a budget sufficient for all six roles. Adoption bounds the number of full runs; model choice defines token multiplier, cost and seeded risk. Each role consumes the preceding role's output; governance blocks release in strict mode but all six roles still execute and incur simulated costs. Agent inference is charged separately from baseline OS inference before finance closes. Shutdown immediately clears active agent demand; configuration persists for paid restart. V9 initializes a disabled orchestration system for older saves.

## Incident catalogue (0.10.0)

Existing event IDs are preserved; 108 authored additions live in incidentCatalogue.ts. Event selection is a pure seeded pool operation: filter department and system prerequisites, minimum day and previous choice plus elapsed time, then prefer eligible unseen continuations, other unseen events, and finally repeatable standalone events. Decisions append to a validated chronological archive, while legacy resolved IDs remain compatible. Delayed effects continue through the existing settlement queue. V10 adds an empty choice archive to older saves; no historical choice is inferred. The UI reveals immediate effects and pending dates but not future story outcomes.

## Campaign module (0.11.0)

CampaignState stores mode, difficulty, scenario, sequential stage history and entry day. Pure requirements evaluate live state; advance consumes one executive capacity and credits financing cash through record(). Department unlocks combine day and stage; capacity and overhead derive from stage. Difficulty affects starting capital, baseline overhead, regulatory pressure and strategic failure limit. Sandbox retains base capacity and ordinary failure endings while removing stage requirements. A local profile stores maximum campaign stage independently of save replacement to unlock scenario configurations. V11 migrates older saves to stage one without discarding existing departments or progress. Final certification is provisional until the boss module.

## Competent employee confrontation (0.12.0)

BossState stores a sequential encounter at stage seven, with a stable employee ID and a linked steering meeting. Spawn hires an exceptionally competent engineer or designates an existing engineering employee if headcount is full. Board retention prevents ordinary redundancy and resignation until containment. Promotion/reassignment reuse employee commands; committee reuses meeting scheduling and actual attendance. Daily settlement after meetings consumes remaining time for two mandatory training days and three dedicated programme governance days; unused time creates usefulness pressure. Downstream department, employee and regular programme simulation receives the updated availability. The dedicated programme expenses enter the operating ledger. Containment is required for final certification. V12 migrates older saves without rewriting completed endings.

## Achievements (0.13.0)

The engine evaluates 74 pure predicates after successful commands and ending checks. AchievementState keeps monotonic unlock records, accepted executive-action counts and idle-day streaks. Rejected commands do not change counters. No award applies a metric or cash effect. V13 initializes empty recognition state for older saves; existing observable conditions can be recognised on later accepted commands. UI merges per-save awards into a separate local-storage lifetime profile, retaining the first earned day for each ID. Reduced-motion-aware notification and filterable collection are presentation concerns.

## Enterprise experience (0.14.0)

Presentation-only helpers derive cash chart observations, organisational reporting groups and state-transition notifications. The notification centre never mutates game state. Audio uses a local Web Audio synthesizer with original note sequences, separate gain, gesture-based activation and cleanup on unmount. Preferences persist independently of V13 game saves. Audio defaults off; reduced motion respects both the player setting and system media query. The grouped navigation retains existing section IDs and mobile selection focuses its destination. No new dependencies or game-state mutations.

## Release validation (0.15.0)

The test campaign driver starts from newGame and calls dispatch only, without modifying simulated state. It records command history and validates serialized saves after every accepted day close. Deterministic replay uses the same command sequence. Save validation additionally reconciles current-period cash and rejects unknown ledger categories; older migrations preserve existing balances. Dependency lock recovery is a temporary CI step, to be removed after the exact generated lock is committed.

## Onboarding and web app (0.16.0)

Title state is presentation-only; active sessions resume on reload using session storage. New games do not overwrite an existing save without explicit replacement; imports validate a versioned backup envelope or migrated raw save, then merge lifetime achievements and unlocked scenarios. The six-step induction observes accepted commands; it does not alter rules or state. The production builder generates PNG icons, manifest and content-hashed precache worker from dist files. A worker serves only known same-origin assets and the app root, preserving an offline shell while avoiding external requests. Portable packaging strips manifest/icon references and never registers a worker under file://. Save schema stays V13.

## Focused workspace navigation (0.17.0)

The hash resolver maps legacy anchors (workspace, decisions, pending-decision, board-notification) to the executive office and routes other recognised IDs to their dedicated workspace. Exactly one workspace wrapper is visible; hidden panels preserve local selection state, ongoing presentation effects and achievement tracking. All simulation state and command dispatch remain shared; day settlement, cash, capacity, incidents and notices are global. Navigation and guidance are presentation-only. The rule-based recommendation observes existing eligibility and gate functions and never mutates the engine unless the player explicitly executes an action. No stage or save schema changes. The full navigation still exposes existing capabilities; progressively introducing them is separate work.
