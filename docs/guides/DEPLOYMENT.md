# Deployment Guide - DevOpsQuest

**Last Updated**: 2026-10-03

---

## Local Development

```bash
npm install          # app dependencies
npm run dev          # Vite dev server at http://localhost:5173
npm run validate     # every CI gate except e2e (see docs/process/VALIDATION.md)
```

---

## Cloudflare Pages (the app)

### Deploy

```bash
npm run deploy
```

This runs `npm run build` (`tsc -b && vite build` — the typechecking build) and
then `npx wrangler pages deploy dist --project-name devopsquest`. Credentials come
from the environment (`CLOUDFLARE_ACCOUNT_ID` / `CLOUDFLARE_API_TOKEN`); wrangler
updates the existing `devopsquest` Pages project.

### CI/CD deploys

- **GitHub Actions** (`.github/workflows/ci.yml`) deploys production on push to
  `main` and preview per PR, gated on the full job ladder, skipping gracefully
  with a warning when `CLOUDFLARE_API_TOKEN` is not set as a repo secret.
- **GitForge** (`.gitforce.yml`, primary CI) runs the same gates but has no
  deploy stage — production deploys happen from a machine with credentials
  (`npm run deploy`).

### Verifying a deploy

Byte-compare production against the local build — Vite content-hashes assets,
so a matching name means matching bytes:

```bash
curl -s https://devopsquest.pages.dev/ | grep -o 'index-[A-Za-z0-9_-]*\.js'
ls dist/assets/ | grep '^index-.*\.js$'
curl -s "https://devopsquest.pages.dev/assets/<hash>.js" | cmp - "dist/assets/<hash>.js"
```

(A transient CDN-edge diff in the seconds right after a deploy has been
observed; re-verify before investigating.)

---

## Optional Worker API (`worker/`)

`worker/` is an optional Cloudflare Worker (`devopsquest-api`) exposing a
KV-backed progress/leaderboard API. The app never requires it — all game state
lives in `localStorage` (see `docs/architecture/ARCHITECTURE.md`).

**Deploy disposition of record (unchanged since v0.1.3):** the worker is
**deliberately not deployed**. `worker/wrangler.toml` still carries the
placeholder `id = "your-kv-namespace-id"`, no `devopsquest` KV namespace (or D1
database) has been provisioned in the account, and `/api/leaderboard` returns
"D1 database is not configured" without one. Provisioning a namespace is new
account infrastructure; until someone creates it and fills in the id, the
worker ships tested (`npm run test:worker`, 18 tests) but dormant.

To activate it:

1. Create a KV namespace and put its id in `worker/wrangler.toml`
   (`[[kv_namespaces]] binding = "PROGRESS"`)
2. Optionally uncomment the `[[d1_databases]]` block for the leaderboard store
3. `npm run dev:worker` to smoke-test locally, `npm run deploy:worker` to deploy

---

## Environment Variables

- **App (Pages)**: none — fully client-side, no runtime configuration.
- **Deploys**: `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` from the
  shell env (or GitHub repo secrets for the Actions deploy job).
- **Worker local dev** (`npm run dev:worker`): a `.dev.vars` file in `worker/`
  if you add bindings that need local secrets. There is no OAuth anywhere in
  this project — the worker has no auth code and reads no OAuth variables.
