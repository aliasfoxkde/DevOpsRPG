# ADR-0002: Service worker registration is production-only

- **Status:** Accepted
- **Date:** 2026-09-23
- **Deciders:** Repository owners

## Context

`src/main.tsx` registers `/sw.js`, which caches the built SPA shell for offline use.
While registration was unconditional, the Vite dev server's module graph and the
service worker's cached shell fought over navigation requests: a stale worker served
an old `index.html` over the dev server, which manifests as a dev server that
"stops updating" or hijacks navigation mid-session (HMR reloads land on the cached
shell instead of the current modules).

## Decision

Register the service worker only when `import.meta.env.PROD` is true:

```ts
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
}
```

## Consequences

- Development always runs against the live module graph; no cache-vs-HMR race.
- Offline support, cache pruning and the `skipWaiting`/`clients.claim` lifecycle
  only need to be reasoned about for the deployed Pages artifact.
- Any future change to caching strategy must consider that production clients may
  hold the previous shell until the worker updates; deploys should keep the
  `index.html` entry stable or bump the cache version in `sw.js`.
