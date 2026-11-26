# Hosted beta deployment

The game is a static Vite application. No backend, database, authentication, external AI or paid inference is required. Publish the dist directory, not the source tree or standalone portable HTML. The portable edition remains available for desktop offline use.

## Cloudflare Pages (proposed host)

1. Sign in to Cloudflare and open Workers & Pages. Create a Pages project connected to the private GitHub repository. Authorise only the selected repository.
2. Production branch: main. Framework preset: Vite (or None). Build command: npm run build. Output directory: dist. Set NODE_VERSION to 22.
3. Deploy after the exact main commit passes CI. Use the generated HTTPS pages.dev URL for the first invitation beta. The published URL itself is public unless access controls are configured; repository privacy is unchanged. Do not publish until the owner approves.
4. Test on the actual URL: title screen, Play now, Continue, backup export/import, manifest and icons, optional installation, offline reload after initial caching, audio and mobile Safari/Android.
5. For updates, merge verified PRs into main. The service worker uses a content-versioned cache, and a new worker activates after old controlled tabs close.

The Cloudflare Pages _headers file controls service worker/index revalidation and immutable hashed assets. No Cloudflare account or custom domain is connected in this increment. No public deployment has been made.

## Player-facing limitations

A first online visit is required to cache the hosted game. Browser support for install prompts, local storage, offline caching and file downloads varies. On iOS Safari use Share > Add to Home Screen where supported. Saves are browser/origin-local; transfer using JSON backups when changing devices or hosts. The tutorial is optional and session-local; it can be skipped or reopened. Private repository Actions artifacts are for signed-in testers; a public beta link is intended for ordinary players.
