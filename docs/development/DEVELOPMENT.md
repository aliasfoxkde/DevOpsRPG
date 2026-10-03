# Development Guide - DevOpsQuest

**Last Updated**: 2026-10-03
**Validation gates and commands of record**: `docs/process/VALIDATION.md` (this guide
links to them; it does not restate every script).

---

## Getting Started

### 1. Clone and Install

```bash
git clone https://github.com/aliasfoxkde/DevOpsRPG.git
cd DevOpsRPG
npm install
npm ci --prefix worker   # only needed to run the worker's tests
```

### 2. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` (Vite default port).

### 3. Run the Tests

```bash
npm run test            # unit + component (fast local loop)
npm run test:e2e        # Playwright, 3 browsers (needs `npx playwright install`)
npm run validate        # every CI gate except e2e, one command
```

---

## Tech Stack

| Technology        | Purpose                                                                     |
| ----------------- | --------------------------------------------------------------------------- |
| Vite 8            | Build tool and dev server                                                   |
| React 19          | UI framework (strict TypeScript)                                            |
| Tailwind CSS v4   | Styling (via `@tailwindcss/vite`)                                           |
| React Router v7   | Client-side routing                                                         |
| Vitest            | Unit/component testing + coverage ratchet                                   |
| Playwright        | E2E testing (chromium/firefox/webkit)                                       |
| Cloudflare Pages  | App deployment (auto on push to `main`)                                     |
| Cloudflare Worker | Optional KV-backed progress/leaderboard API (`worker/`, own `package.json`) |

---

## Key Patterns

### Components

- `src/components/ui/` — shared kit (Button, Card, Modal, Quiz, HUD, …), exported
  via `index.ts`
- `src/components/minigames/`, `src/components/games/` — standalone mini-games
- Functional components with hooks; co-located `*.test.tsx`

### Pages and routing

- One page per route in `src/pages/`; every route is lazy-loaded in `src/App.tsx`
- Global overlays (HUD, toasts, victory modal, keyboard shortcuts) wrap the router

### Static data

- `src/data/` holds all game content as typed TypeScript modules
- `src/data/technologies.ts` is the source of truth (24 technologies, 7 phase
  categories → 6 world-map realms);
  quests, badges, and the world map derive from it
- Learning content is pre-scraped into `src/data/w3schools-content.ts`
  (generated — refresh with `npm run scrape`; excluded from Prettier)

### State management

- `src/contexts/GameContext.tsx` + `src/contexts/game/` modules — all game state
  and transitions; persists to `localStorage` (`devopsquest_game`, fallback
  `devopsquest_backup`)
- `ThemeContext` (dark/light/system) and `ProgressContext` are separate
- Shared formulas/constants live in `src/utils/gameUtils.ts` — import tuning
  values from there instead of hardcoding

---

## Adding New Technologies

1. Add the technology to `src/data/technologies.ts` (it joins a phase → world-map
   realm automatically)
2. Add its topics and quiz content — quests generate from topics in
   `src/data/quests.ts`
3. Learning content comes from the scrape pipeline (`npm run scrape`) into
   `src/data/w3schools-content.ts`

---

## Testing Strategy

- **Unit/component**: Vitest + Testing Library, co-located as `*.test.tsx`,
  jsdom environment (`src/test/setup.ts`)
- **Worker**: separate Vitest suite in `worker/` (`npm run test:worker`)
- **E2E**: Playwright specs in `e2e/`, three browser projects
- **Coverage ratchet**: thresholds in `vite.config.ts` (97/91.5/98.5/98), only
  move up, enforced by `npm run test:coverage` in CI — see ADR
  `docs/decisions/0004-coverage-ratchet-policy.md` and
  `docs/planning/003-QUALITY_PLAN.md` for measurement procedure

---

## Code Style

- ESLint `strictTypeChecked`, zero warnings allowed (`npm run lint`)
- Prettier, repo-wide single style (`npm run format:check`)
- TypeScript strict with `noUnusedLocals`/`noUnusedParameters`
- Conventional Commits; CI runs the full ladder on every push/PR
