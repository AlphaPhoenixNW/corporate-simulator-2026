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
