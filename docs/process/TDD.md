# Test Architecture - DevOpsQuest

**Last Updated**: 2026-10-03
**Coverage policy**: ratchet, not a fixed target — thresholds live in
`vite.config.ts` (97% statements / 91.5% branch / 98.5% functions / 98% lines),
only move up, and are enforced by `npm run test:coverage` in CI. See ADR
`docs/decisions/0004-coverage-ratchet-policy.md` and
`docs/planning/003-QUALITY_PLAN.md` for history and measurement procedure.

(The 2026-06-22 version of this file described an 80%-target, `msw`-based,
`tests/`-tree plan with auth flows; none of that was ever built.)

---

## Testing Philosophy

1. **Test behavior, not implementation** — user-facing functionality first
2. **Unit tests for pure logic** — game modules (`src/contexts/game/`),
   utilities, data integrity
3. **Component tests for behavior** — React Testing Library, co-located
4. **E2E for critical paths** — real flows over the dev server in 3 browsers

---

## Tools

- **Vitest** (globals, jsdom) — unit + component, co-located as `*.test.ts(x)`
  next to the source; setup in `src/test/setup.ts`
- **@testing-library/react + user-event** — component behavior
- **Playwright** — E2E specs in `e2e/`, projects for chromium/firefox/webkit
- No HTTP-mocking library: there is no client-side API to mock. The worker has
  its own Vitest suite run separately (`npm run test:worker`)

## Layout

```
src/**/*.{test,spec}.{ts,tsx}   # co-located unit/component suites (setup: src/test/setup.ts)
e2e/*.spec.ts                   # Playwright E2E (dev server auto-starts, port 5299)
worker/src/index.test.ts        # KV API router suite (own package.json)
vitest.loadresilient.config.ts  # 3-project split of the same suite for shared hosts
```

---

## Critical Scenarios (current suite)

### Learning/gamification core

- [x] XP calculation and level thresholds (`XP_THRESHOLDS`, `gameUtils`)
- [x] Quest/topic completion transitions (`GameContext.actions`)
- [x] Achievement/badge unlock rules (pure modules in `game/`)
- [x] Streak and daily-reward logic
- [x] Persistence: save/load, migration, corruption fallback, quota paths
      (`gameStorage`, `useGamePersistence`)

### Theme

- [x] Dark/light/system resolution incl. OS change events and SSR default

### E2E (expand per `docs/planning/004-INTEGRITY_PLAN.md` Phase 7D)

- [x] Onboarding defaults, nav reachability, quest flow, victory modal
- [ ] Quest completion → XP → level-up → reload persistence
- [ ] Store purchase, world-map gating, settings round-trip

### PWA

- [x] Service worker production-only registration (ADR 0002)

---

## CI Integration

Every push/PR runs (both `.gitforce.yml` and `.github/workflows/ci.yml`):
lint → format → knip → typecheck (3 projects) → unit tests **with the coverage
ratchet** → worker tests → e2e → axe a11y (AA+AAA strict, 29 routes × 2
themes) → aegis baseline scan → build → deploy (GitHub; local `npm run deploy`
for GitForge). Local equivalent: `npm run validate` + `npm run test:e2e`.

---

## Coverage Reporting

`npm run test:coverage` (v8) emits terminal summary plus `coverage/` HTML/JSON.
Measurement constraints of record (measured, see 003 §6.8): valid coverage
comes from a single vitest invocation; sharded runs cannot merge validly on
vitest 4.1.9. On a loaded host use the load-resilient invocation documented in
`docs/process/VALIDATION.md`.
