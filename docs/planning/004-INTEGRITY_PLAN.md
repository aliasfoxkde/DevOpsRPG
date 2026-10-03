# Phase 7 Plan — CI Integrity, Docs Truthing, Test Depth

**Created:** 2026-10-02
**Status:** ACTIVE
**Baseline:** v0.1.5 shipped (tag `v0.1.5`, commit `b354bdb`); gate green 106/106 files,
1,609/1,609 tests, coverage 97.34/91.76/99.21/98.58 (see [003 §6.9](003-QUALITY_PLAN.md))
**Method:** full-repo audit 2026-10-02 (routes/e2e, docs currency, untested files, Aegis
wiring, CI config); every claim below carries a `file:line` anchor measured on that audit.

---

## 1. Verified gaps (audit findings, evidence-anchored)

### 1.1 The two headline "gates" are not actually enforced

| Claim                                                             | Reality                                                                                                                                                                                                                                                          |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Coverage ratchet 97/91.5/98.5/98 (vite.config.ts:54-59) is a gate | **No CI job enables coverage.** `test` script is plain `vitest run` (package.json:11); `.gitforce.yml:38` and `ci.yml:89` both run it bare. Vitest only evaluates `coverage.thresholds` when coverage is on → the ratchet exists only as a manual local command. |
| Aegis pattern scan gates merges                                   | Both pipelines degrade to a skip when the `aegis` binary is absent (`.gitforce.yml:69-82`, `ci.yml:33-55`), and `build` does not `need: security` in GitForge (`.gitforce.yml:85-88`). On any runner without the binary the gate is a no-op.                     |

### 1.2 CI runs a weaker config than the validated one

The config that made v0.1.5 green under load — `vitest.loadresilient.config.ts` — is used
by neither pipeline nor by `scripts/gate-sharded.sh`. CI runs the default config, which
§6.9 of the quality plan documents as losing random files at load ≥ ~45. Related:
`scripts/gate.sh` does not exist — there is **no local one-command full ladder**
(lint → typecheck → format → knip → unit → worker → e2e → build); QUICKSTART.md:39's
"full validation" omits format, knip, worker, e2e.

### 1.3 The a11y gate audits a route that does not exist

`scripts/axe-audit.mjs:56` lists `/marketplace` — no such route (App.tsx has `/store`).
The phantom entry renders the bare layout shell and inflates the "30 routes × 2 themes"
claim in `ci.yml:152`, `.gitforce.yml:55`, `docs/process/VALIDATION.md:20`. `/store`
itself is covered (line 44).

### 1.4 E2E covers 4 of 30 routes

10 test cases in 2 spec files (`e2e/onboarding.spec.ts`, `e2e/quest-flow.spec.ts`);
4 routes covered, 1 partial, 25 uncovered. **The core loop is not e2e-tested**: no quest
completion → XP award → level-up, no store purchase, no persistence round-trip across
reload, no worldmap realm gating. Playwright runs 3 browser projects; GitForge runs
chromium only (`.gitforce.yml:47`).

### 1.5 Documentation asserts a product that was never built

Measured on 2026-10-02 (June-era docs, pre-dating the current architecture):

- `development/DEVELOPMENT.md` — "Coverage Target: 80%" (:91, superseded by the
  ratchet + ADR 0004); instructs creating content in `src/data/w3schools/` (:82, does
  not exist — it is `src/data/w3schools-content.ts`); "Prettier (if configured)" (:98,
  it is configured and CI-gated); claims auth exists (:73).
- `guides/DEPLOYMENT.md` — wrong deploy command (:41-42; the real script is `tsc -b &&
vite build` + `wrangler pages deploy dist --project-name devopsquest`); documents
  Google/GitHub OAuth env vars the worker never reads (:56-59; zero OAuth code in
  `worker/src/index.ts`); project tree lists a `tests/` directory (:77) that does not
  exist; omits `npm run deploy:worker` entirely; does not flag that
  `worker/wrangler.toml:12` still holds the placeholder `id = "your-kv-namespace-id"`.
- `process/TDD.md` — 80% target (:4); lists `msw` (:33, not a dependency); describes a
  `tests/{unit,integration,e2e}` tree with `auth.spec.ts`/`learn.spec.ts`/
  `gamification.spec.ts` (:39-52, none exist); an auth checklist (:58-63);
  "chromium only on CI" (:104, CI runs 3 browsers).
- `architecture/ARCHITECTURE.md` — version "1.0.0" vs package 0.1.5; OAuth (:19) and
  Cloudflare D1 (:17) stated as present (D1 is commented out in `worker/wrangler.toml`;
  `/api/leaderboard` returns "D1 database is not configured", worker/src/index.ts:146);
  5 career-path themes (:59-63) vs 10 in `src/data/careerPaths.ts`; Node 18 (:138) vs
  node 20 pinned in both pipelines; a `users`/`progress`/`achievements` SQL schema
  (:91-128) for what is actually a KV progress store keyed `progress:<userId>`.
- `docs/README.md` — status table says "103 files / 1,590" unit tests (:171; real:
  106/1,609) and "E2E Tests 30 passing" (:173; real: 10 cases × 3 browsers); calls
  `npm run test` "coverage-gated" (:120,171) which §1.1 shows is false.
- `PROGRESS.md` — internally contradictory (100% complete header vs unchecked phases
  at :35-38, 5/6 e2e at :104, a 212-statement coverage sample at :106-111 vs today's
  5,567 statements).
- `planning/003-QUALITY_PLAN.md:550` — "MarketplacePage" (real file: `StorePage.tsx`).
- Neither `process/VALIDATION.md` nor README mentions `vitest.loadresilient.config.ts`
  or the exact authoritative coverage invocation.

### 1.6 Unit-test depth: 279 lines of runtime logic without a direct test

`src/contexts/game/defaultState.ts` (151), `src/components/minigames/gameCatalog.ts`
(104), `src/contexts/game/xp.ts` (24). `xp.ts` is not imported by any test file
(transitively covered only). Branch coverage debt (~370 branches) concentrates in
`GameContext`'s storage-quota and corruption-fallback arms — never exercised because
nothing simulates `QuotaExceededError` or torn localStorage writes.

### 1.7 Remaining code smells

- `src/pages/WorldMapPage.tsx` — 1,381 lines (was 1,139 at the last audit; grew).
- `src/contexts/GameContext.tsx` — 1,897 lines after the v0.1.3 split (was 2,008);
  002-REFACTORING remains the reference for finishing the extraction.
- 9 of 106 suites still require per-file isolation in shared-worker mode
  (Quiz module-data mutator unidentified; provider imports state from storage at
  module import — see `vitest.loadresilient.config.ts` comments and 003 §6.9).

### 1.8 Aegis scan scope and baseline drift

`npm run audit:secrets` scans `.` (whole tree) against `aegis-baseline.json`
(221 baseline findings, committed at `3f84dfe`). Docs claim 354 findings
(`CHANGELOG.md:125`, `003:517`) — the current count is 221; the docs lines sit in
dated historical sections but no doc records the current number. CLI gotcha of record:
this build takes `--format` as a top-level flag (`aegis --format json scan .`).

---

## 2. Phases (each independently shippable; commit + push per phase)

### Phase 7A — Make the claimed gates real _(highest leverage first)_

1. Add `test:coverage` script; wire it into the `test` job of **both** pipelines so the
   ratchet (97/91.5/98.5/98) is enforced where the code runs. CI runners are quiet —
   plain single invocation, default pool.
2. Remove the phantom `/marketplace` route from `scripts/axe-audit.mjs`; correct the
   route-count claims to the real list.
3. GitForge `test` job gets `timeout`/`retry` like its e2e/a11y jobs (load-starvation
   protection on the primary platform).
4. GitForge `build` job `needs:` all gates (lint, typecheck, test, e2e, a11y, security)
   — mirror `ci.yml`'s deployment precondition.
5. Verify aegis baseline-mode exit semantics locally (does a NEW finding fail the
   run?); record the answer in VALIDATION.md and keep the degrade-guard only for the
   missing-binary case.
6. Add `npm run validate` — the local one-command ladder (lint, typecheck, format,
   knip, unit, worker tests, build) with e2e left explicit; point QUICKSTART/README at
   it.

**Done when:** both pipeline configs enforce coverage + full dependency chains; axe
route list matches App.tsx exactly; `npm run validate` exists and passes.

### Phase 7B — Docs truthing

1. Rewrite `development/DEVELOPMENT.md` to the current validation surface (all 10+
   scripts, real coverage ratchet, real content pipeline, no auth).
2. Rewrite `guides/DEPLOYMENT.md`: real deploy path, worker disposition (KV binding,
   the placeholder-id gotcha, `deploy:worker`), delete OAuth env vars and `tests/` tree.
3. Rewrite `process/TDD.md` to the real test architecture (co-located Vitest, jsdom
   setup, e2e/ Playwright × 3 browsers, no msw, no auth checklist); drop the 80%
   target for the ratchet.
4. `architecture/ARCHITECTURE.md` → v2.0.0: real client storage model (localStorage
   keys + backup fallback), real worker (KV progress store; D1 commented out),
   10 career paths, Node 20, version synced to package.
5. Fix `docs/README.md` status table (106/1,609; honest e2e counts; accurate
   "coverage-gated" phrasing once 7A lands), `PROGRESS.md` contradictions (superseded
   banner), `planning/003:550` MarketplacePage→StorePage, and record the current Aegis
   baseline count (221).
6. Add the load-resilient invocation to `process/VALIDATION.md` and reference it from
   README.

**Done when:** a grep for `80%`, `msw`, `OAuth`, `/marketplace`, `w3schools/`,
`tests/setup.ts`, `chromium only`, `Node 18`, "103 files", "1,590" across docs/ returns
only historical, clearly-dated context or nothing.

### Phase 7C — Unit test depth (branch-coverage ladder)

1. Direct tests: `defaultState.ts`, `gameCatalog.ts`, `xp.ts`. ✅ landed
   (`xp.test.ts` 6 cases, `defaultState.test.ts` 9, `gameCatalog.test.ts` 7).
2. `GameContext` persistence branches: simulate `QuotaExceededError` on persist, torn
   JSON, and schema-mismatch saves → exercise the fallback arms. ✅ landed —
   `useGamePersistence.test.tsx` (quota + cross-tab) and `gameStorage.test.ts`
   (loader validation, backup recovery, legacy `ownedItems` seed, `Infinity`
   sentinel, non-array repair including all four `claimed*` ledgers).
3. Hunt the Quiz module-data mutator (isolation debt, `vitest.loadresilient.config.ts`).
   ✅ **hunt closed, no mutator exists**: every in-place `sort`/`push`/`splice`
   in pages/components operates on a fresh copy (`[...allQuests]` at
   QuestJournalPage.tsx:73, `Object.values(realms).sort()` at
   HomePage.tsx:11 and LeaderboardPage.tsx:10 — `Object.values` already
   returns a new array, `[...SEASONAL_EVENTS]` at SeasonalEventsPage.tsx:201;
   QuizDash's Fisher-Yates shuffles a spread). The sole consumer of the live
   `getQuizForTopic` reference (Quiz.tsx:14) is read-only. The shared-registry
   Quiz failure is therefore **module-mock registry leakage** (Quiz.test.tsx's
   `vi.mock('../../data/quizzes')` interacting with other suites' imports
   under `isolate: false`), not data mutation.
4. Per-file provider reset so absolute-XP suites (BattleArena, Skills, Guild,
   Leaderboard) can leave the stateful project. ⏸ **Deferred with corrected
   root cause**: the config comment says the provider initializes "at module
   import", but it is `useState<GameState>(loadInitialGame)`
   (GameContext.tsx:106) — per-render from storage. The leak is inter-file
   localStorage hygiene (a file that does not clear/seed in `beforeEach`
   inherits the previous file's writes), plus the mock leakage above for
   Quiz. Fixable, but every iteration needs a full suite run, which is
   load-window gated; not started while runs starve.

**Done when:** branch coverage ≥ 95% with thresholds ratcheted to match; stateful
project shrunk. (Coverage re-measurement itself is pending a quiet-host window;
the four new suites were verified green individually.)

### Phase 7D — E2E expansion (core loop first)

New specs, highest value first: quest completion → XP/level-up → victory modal →
persistence across reload; store purchase (gold debit + ownership); worldmap realm
gating; skills training; settings round-trip. Target ~10 → ~25 cases, ~12 routes.
✅ Authored: `e2e/helpers.ts` (shared `seedGame` via the app's own storage
contract + `gotoApp`), `progression.spec.ts` (quiz-driven completion, victory,
reload persistence, journal filtering), `store.spec.ts` (disabled-at-zero,
purchase debit + ownership round-trip), `worldmap.spec.ts` (level-gated nodes,
modal travel, unlock-at-level), `skills.spec.ts` (allocation debit + reload),
`settings.spec.ts` (theme radio + sound switch round-trips),
`route-integrity.spec.ts` (6 heading-verified routes + a 20-route error-boundary
sweep). UI contracts anchored to the real DOM: quiz driven via its `'n'`
keyboard flow, XP asserted relative (quest payouts carry the live seasonal
multiplier — pinned to 1× only in unit tests), worldmap modal has no
`dialog` role so assertions scope by heading/CTA.

✅ **Green: 84/84 executions (28 cases × chromium/firefox/webkit), workers=1.**
Three app contracts the suite had to learn, all now encoded in
`e2e/helpers.ts` + spec comments:
1. **`addInitScript` re-fires on every navigation** — a naive seed re-applies
   over the state the app just wrote, so reload-persistence tests silently
   assert the seed instead of the app. `seedGame` is one-shot: it writes only
   when the storage key is absent, so post-reload assertions read the app's
   own write.
2. **Victory-modal header is variant**: `levelUp ? '🎉 LEVEL UP! 🎉' :
   'QUEST COMPLETE!'` (VictoryModal.tsx:148) — a fresh save's first quest
   payout always crosses into level 2, so the modal fires as the level-up
   variant. Assertions match the heading regex `/LEVEL UP!|QUEST COMPLETE!/`.
3. **A second "Experience progress" bar renders at level ≥ 2** (level-up
   panel), so the `gotoApp` HUD wait scopes to the banner; unscoped it is a
   strict-mode violation.

**Done when:** ✅ `npm run test:e2e` green ×3 browsers; every new spec has a
stable storage-seeding strategy (no fake data — real game state via the app's
own storage contract). Flakiness note of record: concurrent heavy runs on this
host produce contention timeouts (4 spurious failures while a vitest run ran
simultaneously; all 8 affected executions passed on clean retry) — run e2e and
unit suites serially.

### Phase 7E — Code smells (measured, opportunistic)

WorldMapPage extraction (realm/node subcomponents + hooks) and the next GameContext
slice, only with the suite green before/after; do not start if 7C/7D regressed.

### Phase 7F — Release

v0.1.6: CHANGELOG, tag, GitHub release, Cloudflare deploy, byte-verify. GitForge
pipeline validation (#22) remains user-gated on `gitforge auth --login`.

---

## 3. Execution constraints of record

- Host load waves (llama-server, load 22–143) — heavy runs use
  `vitest.loadresilient.config.ts`; coverage runs single-process only (003 §6.8).
- Sharded coverage is invalid on vitest 4.1.9 (measured); pass/fail shards only.
- Never `git push --force`; never `git stash`; stale `.git/index.lock` protocol:
  verify zero git processes via `/proc/<pid>/cwd` before removing.
- No placeholders/stubs/simulated data in product code; examples live in planning docs.
- GitForge primary, GitHub backup mirror; production deploys verified by byte-compare
  of the Vite content hash against `dist/`.
