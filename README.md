# Corporate Simulator 2026™
## The Pursuit of Strategic Nothingness

![Corporate Simulator 2026: premium enterprise satire, with a fictional executive dashboard.](docs/brand/hero.svg)

**Delivering tomorrow's nothing, today.**

Welcome to NOTHING™, an entirely fictional corporation dedicated to maximising perceived productivity while minimising the regrettable occurrence of actual business value.

You are the CEO. Establish departments, recruit employees, convene meetings, commission transformations, manage an increasingly elaborate economy and prevent an exceptionally competent employee from ruining everything.

**Current version:** see [package.json](package.json). For the recorded release baseline, acceptance and publication decisions, see [current project status](docs/STATUS.md).

## Begin your executive appointment

Requires Node.js 22.12+ and npm.

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. Start a campaign or sandbox, follow the executive brief, and settle each working day. No account, paid API or external model inference is required. Saves remain in your browser; export a backup before replacing a game or clearing browser data.

For a production build:

```sh
npm run build
npm run preview
```

For a portable offline HTML edition:

```sh
npm run build:playtest
```

Open `playtest/Corporate Simulator 2026.html`. The portable edition and hosted web app are independently verified by CI. See the [playtest guide](docs/PLAYTEST_GUIDE.md) and [deployment guide](docs/DEPLOYMENT.md).

## Executive mandate

- Advance through seven campaign stages from Bedroom Startup to Systemically Important Nothingness Provider.
- Manage ten departments, named personnel, meetings, communications, transformation programmes, subscriptions, acquisitions and fictional corporate AI.
- Navigate 150 authored incidents and 74 manual achievements; protect cash and board confidence while keeping actual productivity low.
- Explore the fictional enterprise OS, executive career portfolio and original audio (opt in through Audio settings).
- After reaching stage two, delegate independent simulated campaigns to Executive Autopilot. Its six awards and local results remain separate from manual play. A million attempts is a cumulative target, not a performance guarantee.

The simulation is deterministic and browser-local. All corporations, employment records, scores, money and qualifications within the game are fictional.

## A message from the Founder

[![The future is horizontal. Read the Founder's message.](docs/brand/founder.svg)](FOUNDER.md)

The Founder invites you to embrace Bed-Led Leadership™ and pursue nothing at scale. [Read his full statement](FOUNDER.md), or consult [Nora's account](NORA.md) for the operational record.

## Executive Library and corporate records

![The Art of Doing Nothing: From Burnout to Bed-Led Leadership.](docs/brand/library.svg)

The game includes **The Art of Doing Nothing™**, the Founder's satirical management book, with a bookmark, table of contents and offline HTML export. Reading does not advance the manual simulation.

| Corporate record | Purpose |
| --- | --- |
| [FOUNDER.md](FOUNDER.md) | The Founder's strategic vision and personal philosophy |
| [Brand strategy](docs/brand/BRAND_STRATEGY.md) | Corporate identity, visual standards and editorial governance |
| [Founder's security statement](docs/FOUNDER_SECURITY_STATEMENT.md) | Commitment to secure non-delivery (fictional stakeholder letter) |
| [Security policy](SECURITY.md) | Responsible vulnerability reporting and supported scope |
| [Security assurance](docs/SECURITY_ASSURANCE.md) | Real pre-publication checks and remediation evidence |
| [NORA.md](NORA.md) | The executive assistant's first-person development retrospective |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Corporate onboarding and practical contribution procedures |
| [CHANGELOG.md](CHANGELOG.md) | Selected verified release history |
| [Development history](DEVELOPMENT_HISTORY.md) | Detailed feature and historical verification record |
| [Project brief](docs/PROJECT_BRIEF.md) | Original executive mandate |
| [Architecture](docs/ARCHITECTURE.md) | How the simulation, browser storage, Autopilot and distribution work |
| [Current status](docs/STATUS.md) | Recorded release baseline and verification evidence |
| [Governance](docs/GOVERNANCE.md) | Actual project authority and engineering rules |
| [Backlog](docs/BACKLOG.md) | Implementation and verification evidence |
| [Release checklist](docs/RELEASE_CHECKLIST.md) | Outstanding acceptance gates |

## Quality assurance

```sh
npm run typecheck
npm test
npm run build:playtest
npx playwright install --with-deps chromium webkit
npm run test:e2e
npm run test:playtest
npm run test:webapp
node scripts/verify-companion-edition.mjs
```

CI runs the full quality gates using locked dependencies and a pinned Playwright environment. See [workflow results](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/actions/workflows/ci.yml) for current automated verification and [project status](docs/STATUS.md) for dated evidence. Automated checks and human acceptance are separate.

## Attribution and publication

The repository owner directs the project; implementation and editorial work were developed with ChatGPT/Codex assistance. Nora is the fictional executive-assistant persona used in the retrospective, not an independent human employee or an in-game service.

This is management satire, not an actual business or professional qualification. The original software and technical documentation are licensed under [MIT](LICENSE). The companion book, artwork, literary material, fictional characters and brand identity are separately reserved; see [rights and permitted use](RIGHTS.md). Third-party components retain their own licences. See [publication review](docs/PUBLICATION_REVIEW.md) for release decisions.

**Absolutely nothing. Consistently. At scale.**
