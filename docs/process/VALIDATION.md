# Validation Criteria - DevOpsQuest

**Last Updated**: 2026-09-24
**Status**: Active — gates are enforced in CI (`.gitforce.yml`, mirrored by `.github/workflows/ci.yml`)

---

## Automated Gates (all must pass before merge/release)

| Gate            | Command                 | Standard                                                                                         |
| --------------- | ----------------------- | ------------------------------------------------------------------------------------------------ |
| Lint            | `npm run lint`          | typescript-eslint `strictTypeChecked`, 0 warnings allowed                                        |
| Format          | `npm run format:check`  | Prettier (repo-wide, single style)                                                               |
| Dead code       | `npm run knip`          | 0 unused exports / files / dependencies                                                          |
| Typecheck       | `npm run typecheck`     | `tsc --noEmit` × 3 projects (app, tooling, worker), strict                                       |
| Unit/component  | `npm run test`          | Vitest, all green; coverage ratchet in `vite.config.ts`                                          |
| Worker tests    | `npm run test:worker`   | Vitest over the KV API router                                                                    |
| E2E             | `npm run test:e2e`      | Playwright, chromium/firefox/webkit                                                              |
| Secrets/pattern | `npm run audit:secrets` | Aegis production profile; fails only on findings not in the baseline                             |
| Accessibility   | `npm run audit:a11y`    | axe-core over every route × both themes; AA **and** AAA violations fail the run (`--aaa-strict`) |
| Build           | `npm run build`         | `tsc -b && vite build` must succeed                                                              |

Release validation additionally byte-verifies the deployed site against `dist/`
(see `docs/CHANGELOG.md` release entries for the procedure).

---

## Functional Requirements (manual spot-check per release)

- [ ] Character creation flow offers the four classes and persists the choice
- [ ] Quest completion awards XP; level-ups fire at `XP_THRESHOLDS` boundaries
- [ ] Topic completion marks the quest chain and updates world-map realm progress
- [ ] Achievements unlock and persist (`devopsquest_game`, fallback `devopsquest_backup`)
- [ ] Daily reward streak increments once per calendar day
- [ ] Theme (`light` / `dark` / `system`) applies immediately and persists
- [ ] PWA installs; offline mode serves cached shell (production builds only —
      the service worker is intentionally disabled in dev)
- [ ] Worker API: `GET/POST /api/progress`, `GET /api/leaderboard`, `GET /api/health`
      respond per contract (see `worker/src/index.test.ts`)

## Performance Requirements

- [ ] First Contentful Paint < 1.5s (production build, throttled)
- [ ] Time to Interactive < 3s
- [ ] Routes are lazy-loaded (check the network tab, one chunk per page)

## Security Requirements

- [ ] No credentials in client-side code (Aegis baseline gate)
- [ ] Progress payloads sanitized on import (`src/utils/dataExport.ts`)
- [ ] Worker CORS echoes only `ALLOWED_ORIGINS`

## Accessibility Requirements

- [ ] WCAG 2.1 AA: 0 critical/serious violations on every route, both themes
      (`npm run audit:a11y`)
- [ ] WCAG 2.1 AAA: 0 critical/serious violations on every route, both themes
      (`npm run audit:a11y -- --aaa-strict` — achieved 2026-09-24, see CHANGELOG)
- [ ] Keyboard navigation: skip link, focus states, Escape closes modals,
      `?` opens the shortcut help overlay

---

## Coverage Ratchet

Thresholds live in `vite.config.ts` (`test.coverage.thresholds`) and only move up.
Current measurement procedure: `npx vitest run --maxWorkers=1 --coverage`
(single worker — parallel v8 coverage runs have been observed to drop test files).
Numbers and history: `docs/planning/003-QUALITY_PLAN.md`.

---

## Visual Checkpoints (per release, both themes)

- Homepage: hero, class selection entry point, HUD (level/XP/gold), quick game
- Quest Journal: filter/search, current-quest card, world map realms with
  `requiredLevel` gates
- Battle Arena: quiz flow, HP bars, victory modal + XP award
- Store/Marketplace: gold balances update on purchase, equipment equips
- Settings: every toggle mutates persisted state (sound, narration, theme)
