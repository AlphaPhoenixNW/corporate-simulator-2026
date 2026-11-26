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
