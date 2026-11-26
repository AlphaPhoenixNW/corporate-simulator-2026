# Corporate Simulator 2026™
## The Pursuit of Strategic Nothingness

You are CEO of NOTHING™, a corporation devoted to appearing productive while avoiding measurable value. Delivering tomorrow's nothing, today.

**Status:** 0.1.0 development foundation; the full game is not yet complete.

## Run locally

Requires Node.js 22.12+ and npm.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. No paid APIs, accounts or model inference are needed. Saves are kept in this browser's local storage.

## Current gameplay

Each turn is a working day. Use two executive actions per day, resolve corporate events, manage cash and keep actual productivity below 70. Liquidity at zero or board confidence at zero also ends the simulation. Daily revenue and expenses are reconciled automatically. Start a new simulation with a chosen seed for reproducibility.

The current foundation contains seven actions, four branching events, ten bounded scores plus liquidity, executive bonuses, a transaction ledger, delayed consequences and local saves. It is limited to the Bedroom Startup stage; subsequent systems are tracked in the backlog.

## Quality gates

```sh
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

GitHub Actions runs these quality gates on Ubuntu 24.04. The [first successful foundation run](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/actions/runs/45738801621) passed TypeScript, seven unit/integration cases, production build and both desktop/mobile browser cases. A dependency lockfile still needs to be generated and committed.

## Development reference

- [Full executive mandate](docs/PROJECT_BRIEF.md)
- [Architecture and release gates](docs/ARCHITECTURE.md)
- [Development backlog](docs/BACKLOG.md)
- [Working agreement](AGENTS.md)
