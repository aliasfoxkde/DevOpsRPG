# Quality & Architecture Plan — DevOpsQuest

**Created:** 2026-09-22
**Status:** ACTIVE
**Supersedes:** gaps not covered by [002-REFACTORING.md](002-REFACTORING.md) (which remains the GameContext-split reference)

---

## 1. Verified Baselines (2026-09-22)

All numbers below were measured on `main` during a full audit session — not estimated.

### 1.1 Test & Build Gates

| Gate | State | Notes |
|------|-------|-------|
| `npm run lint` | ✅ 0 errors, 0 warnings | Was 14 warnings; all resolved |
| `npm run typecheck` | ✅ clean | strict mode, noUnusedLocals/Parameters |
| `npm run test` | ✅ 187/187 (21 files) | Was running foreign suites from a stray symlink |
| `npm run test:e2e` (chromium) | ✅ 10/10 | Specs rewritten; was 0/13 (env + stale selectors) |
| `npm run build` | ✅ passes | tsc -b && vite build |
| Coverage (v8) | ⚠️ **13.72% stmts / 7.81% branch / 12.18% funcs / 14.63% lines** | Target: 99% (Phase 2) |
| E2E (firefox, webkit) | ❌ not validated locally | CI-only; needs browser install (Phase 6) |

### 1.2 Infrastructure Defects Fixed This Session (Phase 0 — done)

1. **`.claude` symlink wedged the Vite dev server.** The tracked symlink pulled the global
   agent-harness tree into Vite's watcher; the event loop blocked and every HTTP connection
   queued (all 13 E2E failures + broken `npm run dev`). Removed and committed.
2. **Vitest ran foreign test files** (from the same symlink) as failing suites. Fixed with
   explicit `include: ['src/**/*.{test,spec}.{ts,tsx}']`.
3. **Service worker registered in dev**, calling `skipWaiting`/`clients.claim` mid-navigation
   and caching dev module URLs. Now production-only (`import.meta.env.PROD`).
4. **Port/host ambiguity**: `localhost` resolved to `::1` for Vite while another process held
   `0.0.0.0:5173`. Playwright now pins `127.0.0.1` and honours `E2E_PORT` env override.
5. **Cold-start E2E flake**: Vite re-optimized deps mid-load → page reloads. Fixed with
   `optimizeDeps.include` for the 5 runtime deps.
6. **E2E specs tested removed behavior** (onboarding wizard is skipped by default since
   `hasSeenOnboarding: true` in `createDefaultGame`) and used ambiguous selectors. Rewritten
   against verified UI (roles, real storage key `devopsquest_game`).
7. **Duplicate React key** `/quests`: Battle Arena breadcrumb reused the Quests path. Fixed.
8. **`SECONDARY_GROUPS` slices dropped 4 nav items** (Shop, Badges, Tech Cards, Certs).
   Regrouped; all 15 items render exactly once.
9. **False "data corrupted" error log on every first visit** — empty storage now silent;
   warning only when data existed but was unreadable.
10. **All 14 ESLint warnings resolved** (8× exhaustive-deps fixed properly — `handleAnswer`
    ordering in QuizDash, state+effect for trail dash offset in WorldMapPage, memoized
    `playerStats` in SocialPage, module-level `COMPANIONS_DATA` — and 6× react-refresh
    resolved by relocating constants to `gameUtils` / deleting a dead `COMPANIONS` export).

### 1.3 Accessibility Baseline (axe-core, wcag2a + wcag2aa + wcag21aa)

Six key pages scanned:

| Page | Critical | Serious | Dominant issue |
|------|----------|---------|----------------|
| `/` | 0 | 9 | color-contrast |
| `/quests` | 5 | 2 | `select-name` — unnamed `<select>` elements |
| `/worldmap` | 0 | 7 | color-contrast |
| `/store` | 0 | 1 | color-contrast |
| `/settings` | 1 | 24 | `button-name` + contrast (worst page) |
| `/rewards` | 0 | 64 | color-contrast (worst contrast count) |

Systemic findings:
- **Color contrast (107 instances)**: slate-300/400 text on slate-800/900 backgrounds and
  amber-on-slate combinations sit below the 4.5:1 AA ratio. Needs a theme-level token fix,
  not per-element patches.
- **Unnamed controls (6 instances)**: `<select>` on /quests, a button on /settings need
  `aria-label`/associated labels.
- Mitigations already in place: Escape closes modals (KeyboardShortcutsHelp), skip-to-content
  link, aria-current on nav, progressbar roles.

### 1.4 Static Analysis (Aegis pattern scan)

5,756 findings triaged; **overwhelmingly false positives in data/documentation files**
(quiz questions *teaching* `innerHTML`, the word "Secret" as a badge label, `.env` entries
inside `.gitignore`, localhost SSRF flags on local audit scripts, workflow `secrets.*` usage).
Actionable items: KeyboardShortcutsHelp backdrop (mitigated: Escape works; focus trap → Phase 3),
`missing-lang` on generated HTML in CodePlayground (Phase 3), `sync-in-async` in scripts
(Phase 5). Recommended: add `aegis --format text scan src/ worker/ scripts/` to CI once
suppressions for data-file false positives are curated.

### 1.5 Code-Smell Inventory

| Smell | Evidence | Phase |
|-------|----------|-------|
| God file | `GameContext.tsx` 2,008 lines (state + 60+ actions + companions data) | 5 (see 002-REFACTORING) |
| Mega data file | `quizzes.ts` 2,751 lines single module | 5 |
| Mega page | `WorldMapPage.tsx` 1,139 lines | 5 |
| Duplicate data models | 3 companion shapes: `GameContext.COMPANIONS_DATA` (game model), `EVOLVED_COMPANIONS`, store `ShopItem` companions | 5 |
| Untrained dead path | `OnboardingWizard` unreachable (default `hasSeenOnboarding: true`) — decide: wire for new users or remove | 5 / product decision |
| Page tests | 4 of 34 pages have unit tests | 2 |
| Component tests | 7 of 43 components | 2 |
| Blocking sync I/O | `deep-audit.mjs`, `scrape-w3schools.js` use `*Sync()` | 5 |
| Regex-driven audit scripts | `scripts/*.mjs` duplicate concerns; no tests | 5 |

### 1.6 Documentation Gaps

- `CONTRIBUTING.md` documents a `stable` integration branch that does not exist (CI triggers
  on `main` + `stable`; only `main` exists).
- `copilot-instructions.md` claims a pre-commit hook runs lint/typecheck/tests — no hook is
  installed; `prepare` only chmods an existing file. Validation actually happens in CI.
- Root-level `PLAN.md`, `TASKS.md`, `PROGRESS.md`, `RESEARCH.md`, `DECISIONS.md` duplicate
  `docs/` concerns (post-revert leftovers).
- README badge says "187 passing" — accurate today, but manual numbers rot; CI should publish
  coverage instead.

---

## 2. Phased Roadmap

Each phase is independently shippable and leaves `main` green. Order matters:
CI reliability (Phase 1) before coverage ratchets (Phase 2), because ratchets need a
trustworthy gate.

### Phase 1 — CI/CD Hardening & GitForge Routing (1–2 sessions)

Per the standing directive, GitForge is the primary CI/CD platform; GitHub Actions is the
backup mirror.

- [ ] Add `gitforge` remote alongside `origin`; push both (GitForge first).
- [ ] Port the 4 CI jobs (lint, typecheck, test, build) to a GitForge pipeline; keep
      `.github/workflows/ci.yml` as mirror.
- [ ] Publish coverage + test counts as pipeline artifacts (replaces hand-edited README badge).
- [ ] Add E2E (chromium) job on a free port with `E2E_PORT` (already supported).
- [ ] Add `aegis scan src/ worker/ scripts/` step after curating data-file suppressions.
- [ ] Release automation: tag → changelog extract → GitHub release + GitForge release.
- [ ] Fix docs claims: remove `stable` branch references; correct pre-commit-hook claim;
      refresh `docs/README.md` index.

**Acceptance:** green pipeline on GitForge for a doc-only PR; release cut by tag push.

### Phase 2 — Coverage 13.7% → 99% (multi-session, ratcheted)

Strategy: **ratchet, don't boil the ocean.** Raise `vitest` `coverage.thresholds` in steps
(+5% lines per merge week) so coverage can never regress while the backlog burns down.

Order of work (highest value first):
- [ ] `GameContext` (17% → 95%): quest completion, XP/level-up, badge/milestone unlocks,
      companion purchase/evolution, storage backup restore, cross-tab merge. This file holds
      every game rule — it is the highest-leverage target.
- [ ] `utils/gameUtils.ts` (level curve, scoring) and `utils/dataExport.ts` (import
      sanitization — security-adjacent).
- [ ] Minigames (all 0%): MemoryMatch, QuizDash, CommandTyper, MathChallenge, CodePuzzle,
      IncidentSimulator, TerminalSimulator, MiniGameHub.
- [ ] Shared UI: Modal, Quiz (582 lines), HUD, Confetti, OnboardingWizard, Icon.
- [ ] Pages: start with quest flow (BattleArena, QuestJournal), then the remaining 28 pages
      (render + key interaction tests).
- [ ] Data integrity tests: cross-validate `technologies` ↔ `quests` ↔ `quizzes` ↔
      `w3schools-content` referential integrity (topic ids, technology ids).
- [ ] Wire coverage thresholds + `text-summary` reporter into CI.

**Acceptance:** thresholds ≥ 95% lines/85% branch, trending to 99%; every bug fix ships with
a regression test.

### Phase 3 — Accessibility: AA first, AAA per-component (2–3 sessions)

- [ ] **Theme token contrast pass**: audit the slate/amber palette pairs; adjust tokens in
      `tailwind.config.js` / `index.css` so body and muted text ≥ 4.5:1 (fixes ~107
      instances at the root, not per-element).
- [ ] `/rewards` (64) and `/settings` (24) contrast remediation; verify with axe.
- [ ] `/quests`: label all 5 `<select>` elements (`aria-label` or `<label for>`).
- [ ] `/settings`: name the unnamed button.
- [ ] Focus management: focus trap + restore in Modal/VictoryModal/KeyboardShortcutsHelp;
      document the backdrop-click + Escape pattern as the standard.
- [ ] Add `@axe-core/playwright` to E2E suite — fail build on new critical/serious violations
      (regression gate) for the six scanned routes.
- [ ] **AAA targets (per WCAG 2.1 AAA), applied where the component is touched**: contrast
      ≥ 7:1 for body text tokens, no time-limits without extension (quiz timers need a
      documented extension/pause affordance), target size and focus-appearance checks in
      component tests. AAA for the entire app is not scheduled as a single milestone —
      it rides along each component that reaches Phase 2/5 touch standards, with axe-AAA
      rule runs reported per page.
- [ ] Re-run the six-page scan; publish results in the README badge.

**Acceptance:** 0 critical, 0 serious axe violations on the six routes; AAA-mode report
tracked per page.

### Phase 4 — Strict Linting (1 session)

- [ ] Adopt `tseslint.configs.strictTypeChecked` (+ `stylisticTypeChecked`) with pragmatic
      disables documented in-config.
- [ ] Promote remaining rules to `error`: `react-hooks/exhaustive-deps`,
      `@typescript-eslint/no-floating-promises`, `no-explicit-any`.
- [ ] Add `eslint --max-warnings 0` to CI (warnings = failure).
- [ ] Prettier (or `eslint-stylistic`) single-format check step; `.prettierrc` with 2-space,
      single-quote (current dominant style).
- [ ] Add `knip` (or equivalent) to CI for dead-export/dead-file detection — the dead
      `COMPANIONS` export found this session was caught by hand; make it automatic.

**Acceptance:** CI fails on warnings, unused exports, format drift.

### Phase 5 — Refactoring & Code-Health (align with 002-REFACTORING)

- [ ] Split `GameContext` per 002-REFACTORING: state store, quest engine, companion module,
      achievement module, persistence layer. Keep `useGame` facade stable for 40+ consumers.
- [ ] Unify the 3 companion data models into `src/data/companions.ts` (game model + store
      display + evolved forms), single source imported by StorePage and GameContext.
- [ ] Split `quizzes.ts` into per-technology quiz modules under `src/data/quizzes/`.
- [ ] Extract WorldMapPage sub-components (TrailPath, LocationNode, RealmPanel) into files.
- [ ] Resolve the OnboardingWizard dead path (product decision: re-enable for new users via
      `hasSeenOnboarding: false` default + E2E, or delete the component and its 4% coverage
      burden).
- [ ] Port `scripts/deep-audit.mjs` + `scrape-w3schools.js` off sync I/O; add tests.
- [ ] Delete or merge root-level `PLAN.md`/`TASKS.md`/`PROGRESS.md`/`RESEARCH.md` into
      `docs/` (single source of truth).

**Acceptance:** no file > 700 lines outside `src/data/`; knip clean; all behavior covered by
Phase 2 tests before/after each split.

### Phase 6 — E2E Expansion & Browser Matrix (1–2 sessions)

- [ ] Validate firefox + webkit projects locally (browser install) and in CI.
- [ ] Add flows: minigame complete (MemoryMatch), side quest, store purchase → inventory,
      quest lock gating (level), settings persistence, theme toggle, offline indicator.
- [ ] Visual regression (Playwright screenshots) for HUD + world map on the 3 themes.
- [ ] Flakiness policy: `retries: 2` in CI only; quarantine tag for investigation.

### Phase 7 — Release & Documentation Cadence (ongoing)

- [ ] Keep a real `docs/CHANGELOG.md` (Keep-a-Changelog format); release notes generated
      from it by the Phase 1 release job.
- [ ] ADRs in `docs/decisions/` for: GitForge primary CI, service-worker prod-only,
      onboarding default, coverage ratchet policy.
- [ ] Quarterly `npm audit` + dependency refresh; `wrangler`/React minor bumps reviewed.

---

## 3. Current Session Position

- Phase 0: **complete** (all 10 infrastructure/defect items above fixed, committed, gates green).
- Next action: Phase 1 (GitForge routing + release automation).
