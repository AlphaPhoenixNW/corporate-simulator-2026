# Corporate Simulator 2026™
## The Pursuit of Strategic Nothingness

You are CEO of NOTHING™, a corporation devoted to appearing productive while avoiding measurable value. Delivering tomorrow's nothing, today.

**Status:** 0.13.0 achievement development build; the full game is not yet complete.

## Run locally

Requires Node.js 22.12+ and npm.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. No paid APIs, accounts or model inference are needed. Saves are kept in this browser's local storage.

## Current gameplay

Each turn is a working day. Use two to four executive actions per day, resolve corporate events, manage cash and keep actual productivity below your difficulty threshold. Liquidity at zero or board confidence at zero also ends the simulation. Daily revenue and expenses are reconciled automatically. Start a new simulation with a chosen seed for reproducibility.

The current foundation contains seven executive actions, 150 branching events, ten bounded scores plus liquidity, executive bonuses, a transaction ledger, delayed consequences and local saves. The department dashboard includes all ten departments, progressive day-based establishment, daily budgets and payroll, headcount, influence, competence, morale, resource requests, governance/operations focus, incidents and objective progress. Version 1–12 saves migrate automatically to version 13. Employees have seeded names and IDs, ten archetypes, skill, ambition, morale, political aptitude, individual salaries and persistent personnel records. Recruit through departments; review, promote, discipline, reassign and make employees redundant through the personnel directory. Employees can form alliances and rivalries, request promotion, submit complaints, resign and complete useful work. All seven campaign stages are implemented with milestone requirements, funding, department unlocks and public listing. The final employee confrontation is implemented.

## Quality gates

```sh
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

GitHub Actions runs these quality gates on Ubuntu 24.04. The [first successful foundation run](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/actions/runs/45738801621) passed TypeScript, seven unit/integration cases, production build and both desktop/mobile browser cases. A dependency lockfile still needs to be generated and committed. The 0.2.0 department increment adds nine unit tests and desktop/mobile departmental E2E coverage; department CI passed in run 45739290421. The employee increment adds nine unit tests and a desktop/mobile browser scenario; employee CI passed in run 45739687827. The meeting increment adds ten unit tests and a desktop/mobile scenario; meeting CI passed in run 45739968402. The communications increment adds nine unit tests and a desktop/mobile scenario; communications CI passed in run 45740556589. Transformation adds ten unit tests and a desktop/mobile scenario; transformation CI passed in run 45741039232. Finance adds eleven unit tests and a desktop/mobile scenario; finance CI passed in run 45741496382. OS adds eight unit tests and a desktop/mobile scenario; OS CI passed in run 45742030933. Agent orchestration adds ten unit tests and a desktop/mobile scenario; agent orchestration CI passed in run 45742438242. Incident catalogue adds eight unit tests and a desktop/mobile scenario; incident CI passed in run 45743104484. Campaign adds ten unit tests and a desktop/mobile scenario; campaign CI passed in run 45743521884. The boss adds ten unit tests and a desktop/mobile scenario; new CI results are pending.

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

Activate the fictional OS for £1,200, explore its enterprise desktop, live corporate consoles, settings, diagnostics, licence and compliance applications. Compute profiles set daily simulated token demand and costs. A strategic shutdown immediately reduces projected demand to zero and expires the current entitlement; every subsequent boot requires a £2,500 restart licence. Boot/shutdown animations support reduced motion. The corporate simulator remains accessible while the OS is offline. No actual model inference is performed. OS tokens represent baseline infrastructure; agent tokens are tracked and billed separately.

### Agentic AI enablement

Enable six local simulated agents, choose one of three fictional models, configure a workflow objective, budget, governance mode and executive adoption. Workflows pass each role's output to the next, generating auditable execution traces and operational emails. Strict governance blocks unverified claims and useful recommendations; permissive governance risks both. Daily budgets limit complete workflows, and shutdown suspends all demand without discarding configuration. Inference expenses settle separately from OS baseline costs. No real AI service is called.

### Corporate incident catalogue

150 individually authored incidents across twelve thematic categories, each with two choices and meaningful metric/cash effects. Contextual triggers depend on operating systems, employees, customers, meetings, programmes, regulatory exposure and active departments. Twelve follow-up stories require a matching prior decision and at least two working days. Unseen eligible incidents and due narrative continuations take priority; standalone events recycle only when the eligible pool is exhausted. The decision archive records choices and pending delayed effects without spoiling future outcomes. Older saves preserve encountered IDs but do not invent historical choices.

### Campaign and sandbox

Advance through seven corporate stages by meeting simultaneous performance, time, cash and system-specific requirements. Each promotion requires executive capacity and grants capital classified as financing. Corporate overhead grows and daily capacity increases at stages three and five. Public listing begins at stage six. Three difficulty settings adjust starting cash, operating overhead and actual-productivity failure thresholds. Reach stages three and five to unlock alternative starting scenarios in a separate browser profile. Sandbox removes stage gates and victory, retaining ordinary failure conditions and day-based department unlocks. Final certification requires containment of the exceptionally competent employee. Existing saves start at stage one and keep already active departments and all existing progress.

### The competent employee

Final-stage campaigns encounter a persistent exceptionally competent engineer (skill 100). The board requires retention until containment. Promote them using the employee system, arrange and hold a steering committee with their attendance, reassign them to a governance department, enrol them in two days of mandatory training and appoint them to the dedicated Enterprise Operational Non-Delivery Transformation. Three funded governance days complete containment. Meetings and training/leadership consume real employee time; unoccupied time can generate actual productivity. The dedicated confrontation programme is additional to the nine general portfolio programmes. Final victory requires containment plus the existing campaign gates. Old completed campaigns retain their original endings; active final-stage saves activate the encounter on their next successful action or day close.

### Strategic recognition framework

74 functional achievements across eight categories track actual simulation outcomes, including executive inactivity, employee management, meeting recursion, communications, programme milestones, finance, simulated AI and campaign victories or failures. Awards are evaluated after accepted commands and persisted per simulation. A separate local lifetime collection retains first earned days across replacement saves. Filter by category or unlock status; new awards trigger a dismissible animated recognition notification respecting reduced motion. V13 preserves legacy saves but does not fabricate historical command counts. Existing observable conditions can earn awards on the next successful command.
