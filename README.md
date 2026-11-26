# Corporate Simulator 2026™
## The Pursuit of Strategic Nothingness

You are CEO of NOTHING™, a corporation devoted to appearing productive while avoiding measurable value. Delivering tomorrow's nothing, today.

**Status:** playable 0.17.4 candidate. The intended release is a basic, functional public-source project, not a fully polished commercial game. The hosted edition is an optional convenience; local and portable builds remain first-class.

## Run locally

Requires Node.js 22.12+ and npm.

```sh
npm ci
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
npx playwright install chromium webkit
npm run test:e2e
```

GitHub Actions runs these quality gates on Ubuntu 24.04. The [first successful foundation run](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/actions/runs/45738801621) passed TypeScript, seven unit/integration cases, production build and both desktop/mobile browser cases. A verified dependency lockfile is committed; CI uses npm ci. The 0.2.0 department increment adds nine unit tests and desktop/mobile departmental E2E coverage; department CI passed in run 45739290421. The employee increment adds nine unit tests and a desktop/mobile browser scenario; employee CI passed in run 45739687827. The meeting increment adds ten unit tests and a desktop/mobile scenario; meeting CI passed in run 45739968402. The communications increment adds nine unit tests and a desktop/mobile scenario; communications CI passed in run 45740556589. Transformation adds ten unit tests and a desktop/mobile scenario; transformation CI passed in run 45741039232. Finance adds eleven unit tests and a desktop/mobile scenario; finance CI passed in run 45741496382. OS adds eight unit tests and a desktop/mobile scenario; OS CI passed in run 45742030933. Agent orchestration adds ten unit tests and a desktop/mobile scenario; agent orchestration CI passed in run 45742438242. Incident catalogue adds eight unit tests and a desktop/mobile scenario; incident CI passed in run 45743104484. Campaign adds ten unit tests and a desktop/mobile scenario; campaign CI passed in run 45743521884. The boss adds ten unit tests and a desktop/mobile scenario; new CI results are pending.

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

### Enterprise experience

The executive intelligence dashboard compares perceived and actual productivity, shows real recent cash observations and governance risks, and provides an interactive organisational chart with live staff allocations. The grouped desktop workspace navigation and compact mobile jump menu access every system. The global notification centre announces stage advancement, incidents, achievements and the final confrontation or ending. Audio is silent by default: opt in through Audio settings for original synthesized contextual cues and optional looping corporate hold music. Volume and reduced-motion preferences persist separately from the game. The OS and achievement animations respect reduced motion. No additional dependencies or external media are required. Save schema remains V13.

### Release verification

The release branch includes full legal-command campaign playthroughs, deterministic command replay, daily save validation and financial reconciliation. These are acceptance gates rather than a claim of success before CI. See docs/RELEASE_CHECKLIST.md for the remaining manual and automated checks.

Balance candidate: subscriber servicing incurs a daily fictional operating expense based on pricing and difficulty; later campaign stages carry higher overhead and reduced capital injections. Very low morale reduces daily shareholder confidence growth. The release suite attempts complete standard, relaxed and ruthless campaigns plus 100-day sandbox runs across three seeds; all results must be verified in CI.

## Private playable build

Successful CI runs upload a self-contained HTML playtest with desktop/mobile screenshots and the playtest guide. Download the corporate-simulator-playtest artifact from the Actions run, extract it and open the HTML file in a desktop browser. No Node installation is required for this portable build. Local generation: npm ci, npm run build:playtest, npx playwright install chromium, npm run test:playtest. See docs/PLAYTEST_GUIDE.md. The repository is currently private; public visibility is planned after a release review. A hosted playable edition is available at https://corporate-simulator-2026.pages.dev.

### One-click onboarding and web app

A fresh session starts at the title screen with instant Play now, optional guided game, configurable new game and Continue for an existing save. Reloading an active session resumes directly. The title screen includes validated JSON backup export and confirmation-based import; lifetime achievement and scenario profiles merge. The production build generates an installable manifest, PNG icons and a versioned service worker that precaches the bundled static app. Offline operation requires the initial hosted cache to complete. Portable HTML remains supported without a service worker. Cloudflare Pages configuration and deployment steps are in docs/DEPLOYMENT.md; the current hosted edition is available on Cloudflare Pages.

### Focused executive office

The first workspace shows the immediate goal, live campaign requirements, a rule-based suggested next action, cash, available executive capacity and the most important risk scores. Dedicated workspaces replace the previous giant scrolling page. Desktop navigation and mobile Office / Company / Finance / Campaign shortcuts plus the All workspaces selector open one active view at a time. Day control and pending decisions remain global. Hash routes support browser history, deep links and reload. Settings and saves are grouped in a collapsed panel. Existing engine commands and save schema are unchanged. Advanced systems are still reachable through the full navigation; progressive introduction is planned separately. The companion book is accessible from the game; the original editorial files remain separate from the public bundle.

### Progressive workspace discovery

Campaign starts with Office, Campaign, Departments and Finance. People and records are introduced on subsequent days; communications, transformation and technology are suggested at relevant expansion stages. Previously used systems and earned awards remain discoverable. Show all workspaces reveals every applicable screen immediately and is remembered locally; sandbox shows the full navigation by default. Each management workspace has a dismissible first-visit briefing explaining its purpose, first step and risk. New introductions appear in the office after real game transitions. These are navigation recommendations, not new simulation restrictions. Briefing dismissals and the new-workspace notification queue are session-local. Existing save format is unchanged.

### Executive Library (0.17.2 candidate)

The title screen and workspace rail open a separate companion-book reader containing all twelve chapters, six appendices and opening/closing sections. Reading does not start or advance a game. A section bookmark is stored locally, with contents navigation, larger type and a complete offline HTML download. The book is embedded in the game bundle, so both portable and installed web editions remain offline-capable. The public candidate preserves original prose with a revised publisher's note and navigation line; private source records are excluded. The owner approved publication and v0.17.2 was merged and deployed. Repository-wide publication review is a separate task.

### Audio troubleshooting (0.17.3 candidate)

Enable sound & music directly from the title or workspace rail. The status indicates whether the audio engine is running, awaiting a gesture or muted. Test sound plays a local fanfare. Existing settings retain music and master volume control. Browser tests inspect an actual generated signal, including targeted WebKit emulation; hardware audibility is a separate playtest check.

### Low-fatigue ambience (0.17.4 candidate)

The short hold-music motif is replaced with original, locally synthesised sustained harmonies. Sixteen slowly crossfading chords span 128 seconds; no repeating lead melody or external media. The existing reward cues and audio preferences are retained. Audio remains opt-in; music can be disabled independently of effects. Listening fatigue requires human assessment. The eventual public repository will support source, portable HTML and hosted play; public visibility is not changed by this increment.

### Executive reward experience (0.18.0 candidate)

The accepted original ambient score is unchanged. Music and reward/action effects have independent toggles and volumes, with an overall mute control; previous volume preferences migrate to both channels. New cues distinguish bonuses, expansion and positive cash events. Each accepted command displays a non-modal decision receipt with contextual prose and actual cash, compensation, capacity and metric deltas. Seven everyday executive actions each have three rotating flavour lines. No simulation rules or save schema changes. The candidate is deliberately modest; public repository licensing and publication review remain separate.

### Executive Career Portfolio (0.19.0 candidate)

A separate Executive CV workspace is introduced on working day two (or immediately through Show all workspaces). The living fictional résumé derives career appointments, recorded decisions, retained meetings, current business indicators and internal fictional qualifications from the current game state. It does not award achievements, change the simulation, or fabricate missing history. Download a self-contained HTML CV, or use the browser's print-to-PDF option. Existing saves work without migration.

### Hosted return-navigation fix (0.19.1 candidate)

Cloudflare Pages canonicalises `/index.html` to `/`. A cached followed redirect can fail a subsequent browser navigation with `ERR_FAILED`. The service worker now precaches the canonical root, normalises redirected navigation responses, reloads assets during installation and falls back to the network if cache lookup fails. A versioned app-shell cache replaces the old one without clearing local saves. Hosted smoke tests emulate Pages redirects and verify new-tab return, referral queries, redirected-cache recovery and offline navigation. Existing affected browsers may open `/recover` on the same host to bypass the old navigation handler; close other game tabs first. No Cloudflare account or simulation changes.

### Executive Autopilot (0.20.0 candidate)

After reaching campaign stage two, open Executive Autopilot from the title screen or management rail. Watch one independent founder campaign decision by decision, or run accelerated batches of 1, 100, 1,000 or a cumulative million attempts. Actual deterministic game commands run locally in an inline worker (cooperative local fallback); no LLM, networking or paid inference. The million is a long-term target, not a benchmark claim. Certified, failed and bounded attempts are recorded separately; no manual unlocks or saves are changed. Completed attempts and the current mandate persist in a separate browser-local profile; pause/close restarts the unfinished attempt. Reading the companion book leaves active automation running; returning to management pauses it. Six independent awards and a labelled CV supplement use real settled results. Use a single Autopilot tab. No new dependencies.
