# Deployment and distribution

The current game is a static Vite application. The canonical [production game](https://corporate-simulator-2026.pages.dev) is live; v1.0.0 deployment 9118f9d and canonical headers verified. Hosting and source-repository visibility are separate.

## Run locally

Use Node.js 22.12+ and npm, then npm ci and npm run dev. For a production preview, npm run build and npm run preview. No application backend, database, authentication or paid inference is required.

## Cloudflare Pages

For an existing or replacement deployment, configure production branch main, build command npm run build, output directory dist and Node 22. Authorise only the intended repository. The Cloudflare dashboard and repository deployment check supply the actual URLs; do not infer a production URL from a preview URL.

Merge verified PRs into main and check the resulting main workflow and deployment. Branch preview URLs may be accessible outside the private repository depending on host access controls. Never assume repository privacy protects a deployed asset.

The production build serves only dist. The versioned service worker precaches the app shell, manifest and assets, normalises redirected navigation responses and clears old app caches. public/_headers configures revalidation, immutable hashed assets and hosted security policy (CSP, no-referrer, anti-framing and restricted permissions). Header changes also invalidate the shell cache. The CSP permits local scripts and blob workers, but rejects arbitrary inline scripts and third-party connections. The portable HTML is not served with HTTP headers. A first online visit is necessary for hosted offline access.

If a previous deployment fails on return with ERR_FAILED, try the same host with /recover (no trailing slash) while online, close other game tabs and then return to the root. Do not clear site storage as a first troubleshooting step.

## Portable HTML

Run npm run build:playtest, then open playtest/Corporate Simulator 2026.html. The portable edition includes the game and embedded library; no local server or Node installation is needed to play an already built file. The [official release](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/releases/tag/v1.0.0) provides the [standalone HTML](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/releases/download/v1.0.0/Corporate-Simulator-2026-v1.0.0.html). Actions artifacts are temporary and subject to GitHub access and retention. The separate private editorial preview is built for validation but no longer included in new downloadable CI artifacts or dist. EA-001 superseded artifact cleanup removed 35 archives and retained the last verified build; new verified playable artifacts use seven-day retention. See [security assurance](SECURITY_ASSURANCE.md).

## Player-facing limitations

Browser support for installation, local-file storage, downloads and offline caching varies. On iOS Safari use Share > Add to Home Screen where supported. Saves are local to browser/profile/origin; use JSON manual backups when changing devices or hosts. Audio requires a user gesture. Autopilot runs only while the page can execute, not on a server.

## Release verification

Check the exact main commit in [Actions](https://github.com/AlphaPhoenixNW/corporate-simulator-2026/actions/workflows/ci.yml), deployment result and actual URL. Test title, Continue, backup transfer, mobile layout, audio, return navigation and offline reload. See [release checklist](RELEASE_CHECKLIST.md) and [publication review](PUBLICATION_REVIEW.md) for launch evidence and follow-up objectives.
