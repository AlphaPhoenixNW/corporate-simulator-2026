# Corporate Simulator 2026™
## The Pursuit of Strategic Nothingness

You are CEO of NOTHING™, a corporation devoted to appearing productive while avoiding measurable value. Delivering tomorrow's nothing, today.

**Status:** 0.8.0 enterprise OS development build; the full game is not yet complete.

## Run locally

Requires Node.js 22.12+ and npm.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. No paid APIs, accounts or model inference are needed. Saves are kept in this browser's local storage.

## Current gameplay

Each turn is a working day. Use two executive actions per day, resolve corporate events, manage cash and keep actual productivity below 70. Liquidity at zero or board confidence at zero also ends the simulation. Daily revenue and expenses are reconciled automatically. Start a new simulation with a chosen seed for reproducibility.

The current foundation contains seven executive actions, thirty-six branching events, ten bounded scores plus liquidity, executive bonuses, a transaction ledger, delayed consequences and local saves. The department dashboard includes all ten departments, progressive day-based establishment, daily budgets and payroll, headcount, influence, competence, morale, resource requests, governance/operations focus, incidents and objective progress. Version 1–7 saves migrate automatically to version 8. Employees have seeded names and IDs, ten archetypes, skill, ambition, morale, political aptitude, individual salaries and persistent personnel records. Recruit through departments; review, promote, discipline, reassign and make employees redundant through the personnel directory. Employees can form alliances and rivalries, request promotion, submit complaints, resign and complete useful work. It is limited to the Bedroom Startup stage; subsequent systems are tracked in the backlog.

## Quality gates

```sh
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

GitHub Actions runs these quality gates on Ubuntu 24.04. The [first successful foundation run](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/actions/runs/45738801621) passed TypeScript, seven unit/integration cases, production build and both desktop/mobile browser cases. A dependency lockfile still needs to be generated and committed. The 0.2.0 department increment adds nine unit tests and desktop/mobile departmental E2E coverage; department CI passed in run 45739290421. The employee increment adds nine unit tests and a desktop/mobile browser scenario; employee CI passed in run 45739687827. The meeting increment adds ten unit tests and a desktop/mobile scenario; meeting CI passed in run 45739968402. The communications increment adds nine unit tests and a desktop/mobile scenario; communications CI passed in run 45740556589. Transformation adds ten unit tests and a desktop/mobile scenario; transformation CI passed in run 45741039232. Finance adds eleven unit tests and a desktop/mobile scenario; finance CI passed in run 45741496382. OS adds eight unit tests and a desktop/mobile scenario; new CI results are pending.

## Development reference

- [Full executive mandate](docs/PROJECT_BRIEF.md)
- [Architecture and release gates](docs/ARCHITECTURE.md)
- [Development backlog](docs/BACKLOG.md)
- [Working agreement](AGENTS.md)

### Meeting governance

Schedule eight meeting types with named attendees for today or the next seven working days. Meetings consume employee time, generate attendance fees, lower operational output, create documents and may schedule follow-ups. Cancel reservations to recover calendar capacity. The calendar supports up to eight meetings per day, eight hours per employee and four follow-up generations. Meeting history records actual attendance, cost and outcomes.

### Corporate communications

Publish ten communication formats at the executive publishing desk. Contextual bulletins and employee posts arrive automatically at day close. Align™ records impressions, reactions, congratulations, comments, influencers, viral posts and scandals. A targeted apology consumes capacity and cash to resolve a scandal and reduce regulatory exposure. Employee reviews, strategic announcements and consultancy actions generate linked contextual records. All prose uses local deterministic templates, never external services.

### Transformation portfolio

Commission nine transformation programmes with named leads, sponsor departments and prerequisite certifications. Launch and daily consultancy fees count against an authorised spending ceiling; additional allocation is not prepaid. Work advances at day close, subject to employee availability, scope expansion and accidental usefulness risk. Each of three milestones requires a held steering committee and executive sign-off. Pause, resume, replace a lead or cancel; cancellation preserves sunk expenditure. Committee attendance fees remain separate corporate expenses. Programme budgets and risk are provisional pending wider balancing.

### Advanced corporate finance

Predictive Savings Monetisation™ bills a daily subscription plus a percentage of hypothetical avoided costs. Recruit subscribers, choose pricing, manage churn, draw credit and repay principal, and acquire three fictional companies with recurring operating flows and usefulness risk. Investor sentiment drives an indicative private share price; public listing arrives in the campaign. Each accelerated 20-working-day quarter closes a cash-reconciled earnings report. Operating cash flows are separate from financing and investing. Legacy saves start financial reporting at their current cash and day, without fabricating historical accounts. Rates, fees and balancing are provisional.

### NOTHING™ OS Enterprise Edition

Activate the fictional OS for £1,200, explore its enterprise desktop, live corporate consoles, settings, diagnostics, licence and compliance applications. Compute profiles set daily simulated token demand and costs. A strategic shutdown immediately reduces projected demand to zero and expires the current entitlement; every subsequent boot requires a £2,500 restart licence. Boot/shutdown animations support reduced motion. The corporate simulator remains accessible while the OS is offline. No actual model inference is performed. The next increment introduces configurable multi-agent orchestration; current tokens are a baseline infrastructure simulation.
