# Quality & Architecture Plan — DevOpsQuest

**Created:** 2026-09-22
**Status:** ACTIVE
**Supersedes:** gaps not covered by [002-REFACTORING.md](002-REFACTORING.md) (which remains the GameContext-split reference)

---

## 1. Verified Baselines (2026-09-22)

All numbers below were measured on `main` during a full audit session — not estimated.

### 1.1 Test & Build Gates

| Gate                          | State                                                            | Notes                                             |
| ----------------------------- | ---------------------------------------------------------------- | ------------------------------------------------- |
| `npm run lint`                | ✅ 0 errors, 0 warnings                                          | Was 14 warnings; all resolved                     |
| `npm run typecheck`           | ✅ clean                                                         | strict mode, noUnusedLocals/Parameters            |
| `npm run test`                | ✅ 187/187 (21 files)                                            | Was running foreign suites from a stray symlink   |
| `npm run test:e2e` (chromium) | ✅ 10/10                                                         | Specs rewritten; was 0/13 (env + stale selectors) |
| `npm run build`               | ✅ passes                                                        | tsc -b && vite build                              |
| Coverage (v8)                 | ⚠️ **13.72% stmts / 7.81% branch / 12.18% funcs / 14.63% lines** | Target: 99% (Phase 2)                             |
| E2E (firefox, webkit)         | ❌ not validated locally                                         | CI-only; needs browser install (Phase 6)          |

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

| Page        | Critical | Serious | Dominant issue                              |
| ----------- | -------- | ------- | ------------------------------------------- |
| `/`         | 0        | 9       | color-contrast                              |
| `/quests`   | 5        | 2       | `select-name` — unnamed `<select>` elements |
| `/worldmap` | 0        | 7       | color-contrast                              |
| `/store`    | 0        | 1       | color-contrast                              |
| `/settings` | 1        | 24      | `button-name` + contrast (worst page)       |
| `/rewards`  | 0        | 64      | color-contrast (worst contrast count)       |

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
(quiz questions _teaching_ `innerHTML`, the word "Secret" as a badge label, `.env` entries
inside `.gitignore`, localhost SSRF flags on local audit scripts, workflow `secrets.*` usage).
Actionable items: KeyboardShortcutsHelp backdrop (mitigated: Escape works; focus trap → Phase 3),
`missing-lang` on generated HTML in CodePlayground (Phase 3), `sync-in-async` in scripts
(Phase 5). Recommended: add `aegis --format text scan src/ worker/ scripts/` to CI once
suppressions for data-file false positives are curated.

### 1.5 Code-Smell Inventory

| Smell                      | Evidence                                                                                                          | Phase                   |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------- |
| God file                   | `GameContext.tsx` 2,008 lines (state + 60+ actions + companions data)                                             | 5 (see 002-REFACTORING) |
| Mega data file             | `quizzes.ts` 2,751 lines single module                                                                            | 5                       |
| Mega page                  | `WorldMapPage.tsx` 1,139 lines                                                                                    | 5                       |
| Duplicate data models      | 3 companion shapes: `GameContext.COMPANIONS_DATA` (game model), `EVOLVED_COMPANIONS`, store `ShopItem` companions | 5                       |
| Untrained dead path        | `OnboardingWizard` unreachable (default `hasSeenOnboarding: true`) — decide: wire for new users or remove         | 5 / product decision    |
| Page tests                 | 4 of 34 pages have unit tests                                                                                     | 2                       |
| Component tests            | 7 of 43 components                                                                                                | 2                       |
| Blocking sync I/O          | `deep-audit.mjs`, `scrape-w3schools.js` use `*Sync()`                                                             | 5                       |
| Regex-driven audit scripts | `scripts/*.mjs` duplicate concerns; no tests                                                                      | 5                       |

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
- [x] Delete or merge root-level `PLAN.md`/`TASKS.md`/`PROGRESS.md`/`RESEARCH.md` into
      `docs/` (single source of truth). — `docs/TASKS.md` (the last stale duplicate) was
      retired 2026-09-23; its content is superseded by this plan.

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

## 3. Session Log

### Session 2026-09-23 — hardening execution

**Phase 2 (coverage).** New `src/data/integrity.test.ts` (35 tests) cross-validates every
static data module (ids, referential integrity, prereq cycles, quiz answerability,
phase→realm mapping). New `src/contexts/GameContext.test.tsx` (21 behavior tests: XP/level
transitions, quest-completion idempotency, badge grants, streak shields, learning topics,
daily rewards, persistence + backup recovery + cross-tab merge). `dataExport.test.ts`
extended to 28 tests (sanitization bounds, collection caps, download flow);
`gameUtils.test.ts` boundary branches. UI/minigame/page suites added in parallel.

Real defects the new tests caught:

1. `grantBadge` was a **no-op for every catalog badge** — badges are pre-seeded locked and
   the guard tested "id exists" instead of "id unlocked", so challenge/reward badge claims
   silently did nothing. (`src/contexts/GameContext.tsx`)
2. Orphaned `gitops_intro` / `gitops_argocd` quizzes referenced topics that never existed.
3. `categories` had no phase-7 entry although kafka/rabbitmq/istio are phase 7 → added the
   `Streaming & Mesh` category.
4. The `aiintelligence` realm omitted `ansible` (phase 6) and all phase-7 techs, leaving
   them unreachable on the world map.
5. Secret side quest `perfectionist` rewarded a badge id with no badge definition → added
   the badge (300 xp / 150 gold, matching its side-quest reward).

**Phase 3 (a11y).** 12 critical + 107 serious axe violations → **0/0** across 6 routes ×
2 themes via `npm run audit:a11y`: token-level contrast remaps in `@theme` (slate/amber/
green scales), dark surface tokens for light-mode `--card`, named controls, modal focus
restoration, glow-pulse instead of `animate-pulse` (opacity pulses break AA mid-animation),
dark-first default matching the app's design.

**Phase 4 (strict linting).** `eslint . --max-warnings 0`; promoted `react-hooks/
exhaustive-deps`, `@typescript-eslint/no-explicit-any`, `no-fallthrough`, `eqeqeq`,
`prefer-const` to error. CI inherits.

**Phase 6 (E2E matrix).** Local: chromium 10/10, firefox 10/10, webkit 9 + 1 flaky
(passes on retry — `N`-key modal close under load). CI gained the missing `e2e` job
(3-browser matrix, browser cache, report artifact); both deploy jobs now gate on it.

**Infrastructure findings.**

- **E2E port squatting:** a foreign Vite app bound `0.0.0.0:5173` and Playwright's
  `reuseExistingServer` served it to every test — 100% false failures that looked like app
  breakage. E2E now boots its own dev server on dedicated port **5299** (`E2E_PORT` still
  overrides); human dev server stays on 5173.
- actionlint 1.7.7 clean on both workflows (fixed the remaining SC2086 shellcheck nits).
- **GitForge status:** gateway `:42780` healthy; CLI unauthenticated (401). Pipeline
  routing requires the user's interactive `gitforge auth --login` (user-only credential
  path); remote/push/pipeline steps are mechanical afterwards.

**Coverage ratchet (same session).** With all parallel suites landed the full run is
**73 test files / 636 tests, all green**, measuring 62.63% statements / 58.30% branches /
62.23% functions / 65.24% lines. `coverage.thresholds` in `vite.config.ts` is pinned just
below those values (60/56/60/63) per ADR-0004, so coverage can only move up.

Four more defects fixed while integrating the page suites: 6. `ChallengesPage.handleClaim` guard was inverted — the CLAIM! button (rendered only for
completed challenges) silently did nothing. 7. The `Infinity` "no fastest quest yet" sentinel did not survive JSON persistence: after
reload Analytics showed `0s` and the next quest collapsed the record to 0 (wrongly
unlocking the speed badge). The load path now restores the sentinel. 8. `BadgesPage` counted the pre-seeded catalog as "earned" ("81 of 81" for a new player) —
now counts real unlocks. 9. Minigames batch (found by re-encoding agent tests to the fixed behavior): unanswerable
`css_prop` puzzle, `git_cmd`/`python_list` options missing their answers, command-less
final step in `high-cpu-production`, IncidentSimulator stale-closure scoring (86% on a
flawless run) and unapplied hint penalty, duplicated Terminal-tile accessible name,
hub accuracy >100%.

Also this session: ADRs added under `docs/decisions/` (Phase 7 start); stale
`docs/DECISIONS.md` entries marked superseded; `docs/TASKS.md` (the last stale
root-planning duplicate) retired; `testTimeout` raised to 15s for coverage-instrumented
page renders.

**Still open:** Phase 5 refactoring (GameContext split), knip/prettier adoption,
quarterly dependency refresh (Phase 7 cadence).

---

## 4. Cycle 2 — 2026-09-24: measured gaps and expanded roadmap

Baseline v0.1.2 (all gates green: lint, typecheck, 636/636 tests, axe 0/0, actionlint,
E2E 3 browsers, CI + release + deploy verified). This cycle closes what Cycle 1
deliberately deferred, sized by measurement rather than intuition.

### 4.1 Measured gap baseline

| Area                      | Baseline (2026-09-24)                                                                                                                                                                    | Target                                           |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Statement coverage        | 62.63% (branch 58.30 / funcs 62.23 / lines 65.24)                                                                                                                                        | ≥ 99% ratcheted                                  |
| Weakest areas             | `useSoundEffects` 12%, `BackgroundGenerator` 31%, `useVoiceNarration` 42%, `SettingsPage` 43%, `BattleArenaPage` 45%, `FeedbackPage` 48%, `GameContext` ~48%                             | all ≥ 90%                                        |
| knip                      | 11 unused files, 72 unused exports, 30 unused types, 2 duplicate exports, 3 dependency findings                                                                                          | 0 (config-documented ignores only)               |
| Type-aware ESLint         | 200 findings (123 src / 77 tests); top: `no-unsafe-member-access` 76                                                                                                                     | 0 on `recommendedTypeChecked` + strict additions |
| console.* in shipped code | 48 (Quiz 16, GameContext 10, worker 5, hooks 4, main 4)                                                                                                                                  | removed or funneled through the error boundary   |
| Aegis scan                | 6053 findings; 3 "critical" all false positives (example URLs in teaching content); true classes: console noise; `react-missing-key-prop` hits are pattern noise (keys verified present) | baseline-gated: new findings fail CI             |
| Accessibility             | WCAG 2.1 AA: 0 violations on 6 routes × 2 themes                                                                                                                                         | AAA pass + more routes                           |
| GitForge CI               | gateway healthy `:42780`; CLI unauthenticated (401) — interactive `gitforge auth --login <user>` is the user-only credential step                                                        | pipeline created + first green run               |
| Scripts                   | `deep-audit.mjs` hardcodes `localhost:5173`, writes `audit-report.json` (unignored)                                                                                                      | env-configurable, artifacts ignored              |

### 4.2 Phases

**Phase A — Tooling adoption (1 session).** Prettier (repo-wide single-format commit, CI
gate), knip (config with documented entry points for `public/sw.js`, `worker/`, `scripts/`;
fix or delete each finding), type-aware ESLint (`recommendedTypeChecked` + `switch-exhaustiveness-check`

- `no-console` warn/error + `react/jsx-key`), aegis npm script with checked-in baseline
  (new findings fail), scripts de-hardcoded, `audit-report.json` ignored.

**Phase B — Coverage ratchet 62.6% → 99% (multi-session, parallel).** Order by leverage:

1. `GameContext` branches (~48% → 95%): companions, equipment, collectibles, storylines,
   guild, PvP, prestige, seasonal events, world map transitions.
2. Hooks: `useSoundEffects` (12%), `useVoiceNarration`, `useKeyboardShortcuts`,
   `useLocalStorage` branches.
3. Pages at the bottom: `SettingsPage` (43%), `BattleArenaPage` (45%), `FeedbackPage` (48%),
   then 60-75% band (Rewards, Store, Marketplace, PVP, WorldMap, Guild).
4. `BackgroundGenerator` (31%), utils (`achievementCardGenerator`, `backgroundGenerator`).
5. `worker/` KV API (its own package, untested).
   Thresholds rise as areas land; every defect found gets a fix + regression test.

**Phase C — Accessibility AAA (1-2 sessions).** Extend `axe-audit.mjs`: AAA rule set,
more routes (every page route), per-page AAA report; contrast ≥ 7:1 for body-text tokens;
target size and focus-appearance assertions in component tests; quiz timer pause/extend
affordance (AAA 2.2.1).

**Phase D — Phase 5 refactoring (2-3 sessions, after B has GameContext ≥ 90%).**
Per `002-REFACTORING.md`: split `GameContext` into store + quest engine + companion +
achievement + persistence modules behind a stable `useGame` facade; unify the 3 companion
data models into `src/data/companions.ts`; split `quizzes.ts` into per-technology modules;
extract `WorldMapPage` subcomponents; port scripts off sync I/O with tests. Behavior
locked by B's tests before each split.

**Phase E — GitForge pipeline (blocked on user auth).** Mechanical once
`gitforge auth --login <user>` runs: `gitforge repo --create aliasfoxkde/DevOpsRPG`,
register the pipeline (lint → typecheck → test → e2e → build), push both remotes,
webhook trigger. The GitHub `ci.yml` remains the mirror.

**Phase F — Release cadence.** Gates → CHANGELOG 0.1.3 → tag + GitHub release →
wrangler deploy with existing env vars → byte-verify production.

### 4.3 Honest constraints

- 99% _lines_ is reachable; 99% _branch_ on a content-heavy SPA has long-tail files
  (WorldMapPage 1000+ lines of presentational branches) where the cost/benefit crosses
  over — the ratchet records each notch and the plan states where it stopped and why.
- `w3schools-content.ts` (scraped content) stays a documented knip/coverage exclusion:
  it is data, not logic.
- AAA contrast ≥ 7:1 on every text token may force palette changes with visual-design
  review; changes are made token-level and re-audited.

### 4.4 Cycle 2 execution log — 2026-09-24 (Phase A complete)

Phase A landed in full. Final gate state after the campaign:

| Gate                       | Result                                                                                                          |
| -------------------------- | --------------------------------------------------------------------------------------------------------------- |
| ESLint (strictTypeChecked) | 1165 errors → **0 errors / 0 warnings** across 198 files (`--max-warnings 0`), zero eslint-disable comments     |
| Typecheck                  | 3 projects green (app `tsconfig.json`, tooling `tsconfig.node.json` incl. `scripts/**` + `e2e/**`, `worker/`)   |
| Tests                      | **70 files / 606 tests passing**; new tests added for every fixed defect                                        |
| Prettier                   | repo-wide single-format commit; `format:check` gate green                                                       |
| Knip                       | 0 unused exports/files/deps; config trimmed to auto-detected entries; `src/**/*.css` followed                   |
| Aegis                      | baseline committed (`aegis-baseline.json`, 198 findings triaged — see below); `audit:secrets` fails only on new |
| Coverage                   | 62.63/58.30/62.23/65.24 → **65.51 stmts / 59.25 branch / 65.88 funcs / 68.08 lines**; thresholds ratcheted up   |
| Build                      | `tsc -b && vite build` green                                                                                    |

Work executed:

- **Strict type-aware lint campaign** (typescript-eslint `strictTypeChecked` with
  `parserOptions.project` per scope — app/tooling/worker). Two rules tuned with written
  justification in `eslint.config.js`: `restrict-template-expressions` allows
  number/boolean interpolation (game UI interpolates stats everywhere),
  `no-confusing-void-expression` allows the `void` operator (idiomatic
  floating-promise suppression). Everything else at strict defaults.
- **Parallel remediation across 5 scopes** (contexts/utils/data, pages A-L, pages M-Z,
  ui/worker, games/minigames/e2e). Every scope re-verified independently, then the whole
  repo re-linted.
- **Real defects fixed along the way** (each with regression test where applicable):
  cross-tab `storage` events with non-object payloads wiped the save to defaults
  (GameContext); malformed saves (`character: null`, `achievements: [null]`) discarded
  the entire save including the backup instead of the bad part; `localStorage.theme`
  cast unvalidated ("purple" reached `documentElement.classList`); import sanitizer
  stringified non-scalar ids to `"[object Object]"`; missing `case 'specific'` in
  `communityChallenges` fell silently to `default: 0`; Confetti `animationRef.current!`
  crash path; ChallengesPage `dailyDash.startTime!` non-null assertion inside a
  `setInterval` closure; BattleArenaPage's "Quest Content Unavailable" fallback is live
  code (5 technology ids — ansible, foundations, istio, kafka, rabbitmq — have no
  w3schools-content entry), verified against the data before keeping it.
- **Scrape script de-stubbed**: `scripts/scrape-w3schools.js` now performs real
  fetch/parse of W3Schools topic pages (entity decoding, `<h2>` sectioning,
  `<pre>` code examples, main-region extraction) and throws on HTTP/parse failure —
  the previous version returned hardcoded placeholder data.
- **Tooling wiring**: `.gitforce.yml` (GitForge primary pipeline: lint → format → knip →
  typecheck → test → e2e → security → build), `ci.yml` gains `format:check`, `knip`
  and a `security` job (aegis baseline ratchet, degrade-to-warning on GitHub where the
  binary is unavailable), npm scripts `format`/`format:check`/`knip`/`audit:secrets`,
  `typecheck` extended to all three tsconfigs.
- **Aegis baseline triage** (198 findings, all reviewed): the 8 "high" findings are
  false positives — scraped W3Schools teaching content about `innerHTML` (React
  escapes on render), a `'devopsquest_voice_settings'` STORAGE_KEY constant, a
  `secret:` badge-category label, and a `100000000` XP clamp matching tax-number
  patterns. Mediums are `Math.random()` game randomness (66), 5-digit XP values read
  as zip codes (59), SQL-teaching content, and localhost URLs in docs/scripts of a
  fully client-side app. Baseline ratchet means any NEW occurrence fails CI.
- **Coverage measurement note**: vitest v8 coverage under 2-worker parallelism
  silently dropped 2 test files (undercounting both tests and coverage); the 2026-09-24
  numbers above are from a single-worker run. Use `--maxWorkers=1` for coverage runs
  until root-caused.

Cycle 2 continues with Phase B (coverage), Phase C (AAA), Phase D (refactor), Phase E
(GitForge, user-auth-gated) per §4.2.
