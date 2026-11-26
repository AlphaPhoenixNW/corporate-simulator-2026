# Corporate Simulator 2026™
## The Pursuit of Strategic Nothingness

You are CEO of NOTHING™, a corporation devoted to appearing productive while avoiding measurable value. Delivering tomorrow's nothing, today.

**Status:** 0.4.0 meeting development build; the full game is not yet complete.

## Run locally

Requires Node.js 22.12+ and npm.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. No paid APIs, accounts or model inference are needed. Saves are kept in this browser's local storage.

## Current gameplay

Each turn is a working day. Use two executive actions per day, resolve corporate events, manage cash and keep actual productivity below 70. Liquidity at zero or board confidence at zero also ends the simulation. Daily revenue and expenses are reconciled automatically. Start a new simulation with a chosen seed for reproducibility.

The current foundation contains seven executive actions, fourteen branching events, ten bounded scores plus liquidity, executive bonuses, a transaction ledger, delayed consequences and local saves. The department dashboard includes all ten departments, progressive day-based establishment, daily budgets and payroll, headcount, influence, competence, morale, resource requests, governance/operations focus, incidents and objective progress. Version 1–3 saves migrate automatically to version 4. Employees have seeded names and IDs, ten archetypes, skill, ambition, morale, political aptitude, individual salaries and persistent personnel records. Recruit through departments; review, promote, discipline, reassign and make employees redundant through the personnel directory. Employees can form alliances and rivalries, request promotion, submit complaints, resign and complete useful work. It is limited to the Bedroom Startup stage; subsequent systems are tracked in the backlog.

## Quality gates

```sh
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

GitHub Actions runs these quality gates on Ubuntu 24.04. The [first successful foundation run](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/actions/runs/45738801621) passed TypeScript, seven unit/integration cases, production build and both desktop/mobile browser cases. A dependency lockfile still needs to be generated and committed. The 0.2.0 department increment adds nine unit tests and desktop/mobile departmental E2E coverage; department CI passed in run 45739290421. The employee increment adds nine unit tests and a desktop/mobile browser scenario; employee CI passed in run 45739687827. The meeting increment adds ten unit tests and a desktop/mobile scenario; new CI results are pending.

## Development reference

- [Full executive mandate](docs/PROJECT_BRIEF.md)
- [Architecture and release gates](docs/ARCHITECTURE.md)
- [Development backlog](docs/BACKLOG.md)
- [Working agreement](AGENTS.md)

### Meeting governance

Schedule eight meeting types with named attendees for today or the next seven working days. Meetings consume employee time, generate attendance fees, lower operational output, create documents and may schedule follow-ups. Cancel reservations to recover calendar capacity. The calendar supports up to eight meetings per day, eight hours per employee and four follow-up generations. Meeting history records actual attendance, cost and outcomes.
