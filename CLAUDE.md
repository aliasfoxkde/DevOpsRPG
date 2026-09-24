# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DevOpsQuest (`devopsquest`) is a gamified DevOps learning platform: React 19 + TypeScript + Vite + Tailwind CSS v4 SPA deployed to Cloudflare Pages. Fully client-side — all game content lives in `src/data/` as static TypeScript modules, and player progress persists to `localStorage`. No backend is required for the app to work; the `worker/` directory is an optional Cloudflare Worker (KV-backed progress/leaderboard API) with its own `package.json` and `wrangler.toml`.

Full documentation lives in `docs/` (index: `docs/README.md`); architecture in `docs/architecture/ARCHITECTURE.md`.

## Commands

```bash
npm run dev          # Vite dev server at http://localhost:5173
npm run test         # Vitest (single run)
npm run test:watch   # Vitest watch mode
npx vitest run src/utils/gameUtils.test.ts    # Single test file
npx vitest run -t "test name"                 # Single test by name
npm run test:e2e     # Playwright (auto-starts dev server on :5173)
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run build        # tsc -b && vite build (typechecks as part of build)
```

Validation before claiming completion: `npm run lint && npm run typecheck && npm run test`.

Worker/deploy:

```bash
npm run dev:worker    # Wrangler dev for worker/
npm run deploy:worker # Deploy worker
npm run deploy        # Build + wrangler pages deploy (CI deploys automatically on push to main)
```

## Architecture

### Big picture

- `src/App.tsx` — all routing. Every page is a lazy-loaded route; global overlays (HUD, VictoryModal, toasts, confetti, onboarding, keyboard shortcuts) wrap the router.
- `src/contexts/GameContext.tsx` — the core of the app (~2000 lines, flagged for refactoring in `docs/planning/002-REFACTORING.md`). Holds `GameState` (character, XP/level, completed quests/topics, badges, side quests, collectibles, stats) and every state transition (quest completion, XP awards, unlocks). It persists to `localStorage` under keys from `STORAGE_KEYS` in `src/utils/gameUtils.ts` (`devopsquest_game`, with `devopsquest_backup` as fallback on load). Changes to game mechanics almost always start here.
- `src/contexts/ThemeContext.tsx` (dark/light) and `ProgressContext.tsx` (learning progress) are separate smaller contexts.
- `src/utils/gameUtils.ts` — shared game constants and formulas: `XP_THRESHOLDS` (level curve), `calculateLevel`, `GAME_BALANCE`, `STORAGE_KEYS`, scoring/animation constants. Import tuning values from here rather than hardcoding.

### Data model (src/data/)

`src/data/technologies.ts` is the source of truth: 47 W3Schools technologies grouped into 5 ordered phases (world map "realms"). Everything else derives from or complements it:

- `quests.ts` — generates `Quest`s (battle/boss) from technology topics and defines `realms` (phases → world map areas with `requiredLevel` gating).
- Other files define content systems: badges, equipment, skills, sidequests, milestones, collectibles, minigame configs, incident scenarios, career paths, certifications, seasonal events, PvP, guilds, storylines.
- `w3schools-content.ts` — pre-scraped learning content (regenerate with `npm run scrape`, which runs `scripts/scrape-w3schools.js`).

### Components

- `src/components/ui/` — shared UI kit (Button, Card, Badge, Modal, ProgressBar, XPBar, HUD, Quiz, etc.) exported via `index.ts`.
- `src/components/minigames/` and `games/` — standalone mini-games (CommandTyper, MemoryMatch, QuizDash, IncidentSimulator, TerminalSimulator, etc.).
- `src/components/layout/` — Layout/Navbar shell.
- Pages live in `src/pages/`, one per route.

### Path alias

`@/` maps to `src/` (configured in both `vite.config.ts` and `tsconfig.json`).

### Testing

- Unit/component tests are co-located with source as `*.test.ts(x)`, run by Vitest with `globals: true` in a jsdom environment; setup in `src/test/setup.ts`.
- E2E tests live in `e2e/` (Playwright, 3 browser projects; the dev server is started automatically via `webServer`).
- Coverage excludes `src/components/layout/**` and `src/main.tsx`.

## Conventions

- **Minimal changes**: only change what the task requires; don't refactor opportunistically. Keep existing behavior backward-compatible.
- TypeScript `strict` mode with `noUnusedLocals`/`noUnusedParameters` — no unused imports or params.
- Tests must pass before claiming completion (per `.github/copilot-instructions.md`).
- Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`); scopes by system, e.g. `feat(quests): ...`.
- Branch from and PR to `main` (the default branch; production deploys automatically on push to `main` via `.github/workflows/ci.yml`).
- UI: Tailwind classes consistent with existing components, accessible (aria-labels, focus states), and working in both light and dark themes.
