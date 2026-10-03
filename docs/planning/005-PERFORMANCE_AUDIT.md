# Plan 005 — Performance & Quality Audit Cycle (Phase 8)

Status: in progress · Baseline: v0.1.6 (`5ec81ad`) · Date: 2026-10-03

## 1. Audit findings of record (measured, not estimated)

Every number below was produced this cycle. Profiling methodology: Playwright
chromium against the production deploy, anti-backgrounding launch flags, CDP
CPU sampler at 500 µs. Caveat that applies to all absolute timings: this host
runs concurrent agent workloads (loadavg 46–90 during measurement), so treat
absolute ms as inflated; the **relative** comparisons and cached-vs-cold
deltas are the robust signals.

### 1.1 Coverage (single-process, deadline-patched vitest)

| Metric | Measured | CI ratchet | Headroom |
|---|---|---|---|
| Statements | 97.41% (5423/5567) | 97 | +0.41 |
| Branches | 91.85% (4117/4482) | 91.5 | **+0.35** |
| Functions | 99.21% (1519/1531) | 98.5 | +0.71 |
| Lines | 98.58% (4864/4934) | 98 | +0.58 |

All four thresholds pass, but statements/branches pass with almost no margin —
a single new untested conditional breaks CI. Worst branch coverage:

- `AnalyticsPage.tsx` 66.7% branches
- `OfflineIndicator.tsx` 75% (lines 51–73 untested)
- `sidequests.ts` 75% (line 232)
- `CommandTyper.tsx` 79.1% (115–120, 276–284)
- `ProgressBar.tsx` 80% (line 19)
- `CodePlayground.tsx` 80.6% (93.2% stmts — worst file overall)
- `TechnologyPage.tsx` 80.8% · `SkillsPage.tsx` 81.0% · `IncidentSimulator.tsx` 81.5%
- `SeasonalEventsPage.tsx` 82.2% · `CareerPathPage.tsx` 82.6%

### 1.2 Dead code / smells

- knip: **clean** (0 findings across src/e2e/worker/scripts/configs).
- ESLint: already at `tseslint.configs.strictTypeChecked` in all three project
  blocks (app, tooling, worker) with tuned rule set, `no-console: error`,
  exhaustive-deps error, switch-exhaustiveness error. Verdict: at the strictest
  practical tier; `stylisticTypeChecked` remains as an optional cosmetic layer.

### 1.3 Bundle profile (dist of v0.1.6, sourcemap-attributed)

- Entry chunk `index-*.js`: 448 KB raw / **128 KB gzip** — the critical path.
- Route splitting works: every page is its own chunk (largest route chunk:
  BattleArenaPage 90.8 KB raw / 27 KB gz; MiniGameHub 80 KB / 18.7 KB gz).
- Entry-chunk attribution: react-dom 174 KB (39.4%) + react-router 40 KB (9.1%)
  = framework floor ~48%. App-controlled remainder ~52%:
  - GameContext 26.8 KB · technologies 26.6 KB · badges 18.6 KB
  - **Overlay modals always mounted at the root: MentorChat 12.6 KB,
    HUD 12.3 KB, VictoryModal 7.3 KB, OnboardingWizard 5.8 KB,
    RealmCompletionModal 4.9 KB — ~30 KB of dialog code on the critical path
    of every first visit**, though three of the five are only ever visible
    after a quest completion / on first-run / on chat open.
  - Data modules pulled into the entry via GameContext imports: careerPaths
    11.4 KB, milestones 7.4 KB, storylines 7.2 KB, skills 5.3 KB.
- CSS: single 129 KB stylesheet (Tailwind), one blocking request.

### 1.4 Runtime profile (production deploy)

Per-route cold load (compressed transfer ~149 KB, TTFB ~90 ms edge):

| Route | FCP cold | FCP cached | Long tasks |
|---|---|---|---|
| / | 752 ms | — | 446 ms |
| /quests | 620 ms | — | 347 ms |
| /skills | 1344 ms | — | 0 |
| /store | 916 ms | — | 253 ms |
| /character | 1896 ms | — | 53 ms |
| **/worldmap** | **3040 ms** | **1632 ms** | **3180 ms** |

The worldmap is the outlier and the numbers survive the cache: 1.6 s FCP with
zero network. CPU profile: `(program)` (browser style/layout/paint) dominates;
JS functions are all <1%. DOM is light (619 nodes, 30 SVGs, 67 CSS-animated
elements) — so the cost is **repeated React re-render invalidation churn**
(each state tick re-renders the map subtree and forces style/layout recalc),
not DOM weight or JS execution. Mechanism candidates in
`WorldMapPage.tsx`: the `animatedLocations` interval effect and un-memoized
location nodes.

An earlier uncontrolled probe showed far larger numbers (8.4 s long tasks,
FCP null) — that was headless background-page throttling, not app behavior;
the anti-backgrounding flags + foreground page are the measurement method of
record now.

## 2. Phases

### Phase 8E-1 — Trim the critical path (bundle)

1. `React.lazy` the three deferred overlays: `VictoryModal`,
   `RealmCompletionModal`, `OnboardingWizard` (rendered only when open/needed;
   wrap in `Suspense` with null fallback to avoid layout shift). MentorChat
   follows only if it renders nothing until opened (verify mount behavior
   first). Expected: ~18–25 KB raw (~6–8 KB gz) off the entry.
2. Rebuild, re-measure entry size, confirm e2e still green (victory/worldmap
   specs cover two of the three overlays end-to-end).

**Done when:** entry gzip ≤ 124 KB (−4 KB measured), e2e 84/84, unit suite
green.

**Disposition (shipped 2026-10-03):** entry chunk 448,382 → 429,930 B raw
(−18.5 KB), **128.1 → 120.9 KB gzip** — beats the ≤124 KB target. All three
overlays lazy with `Suspense fallback={null}`; VictoryModal's mount gate
mirrors its own visibility condition (`game.showVictory && game.lastVictory`).
MentorChat excluded (renders its floating toggle even when closed — must stay
mounted); KeyboardShortcutsHelp excluded (owns its own `'?'` listener).
Verified: onboarding+progression e2e 8/8 chromium (victory modal + onboarding
through their lazy chunks), App + overlay unit tests 88/88 (run serially —
the parallel 4-file run starved workers on this host and is not a signal).
Side effect: gating fixed a latent bug — `victoryShownRef` previously stayed
`true` after the first victory, so particles/sounds never re-fired for later
victories in the same session; per-victory remount restores them.

### Phase 8E-2 — Worldmap render churn (runtime)

1. Reproduce the mechanism precisely: count renders per second on the live
   page (React DevTools-free: wrap a probe in a test or count effect ticks).
2. Fix by widest safe measure, in order: memoize location components
   (`React.memo` on node subcomponents), move tick-driven state to CSS
   animation where it's decorative, narrow the interval state to the minimum
   subscribed component.
3. Re-measure with the same controlled probe: target FCP-cached ≤ 900 ms and
   long tasks ≤ 1 s on /worldmap.
4. This phase doubles as the risk assessment for the 7E extraction: if the
   perf fix requires structural change, do the extraction then (suite green
   before/after, e2e worldmap specs pin behavior).

**Done when:** controlled probe shows worldmap within ~1.2× of sibling-route
FCP (cached), e2e worldmap 3/3, unit suite green.

**Disposition (shipped 2026-10-03):** mechanism proven and fixed. `TrailPath`
was defined inside the page body, so every render gave it a fresh type
identity and each 3 s `pathAnimKey` tick remounted every trail subtree.
Identity-sampling probe (level-15 save, local preview): **9 trail paths torn
down and recreated every 3 s** (`25,0,0,0,9,0,0,9`) before; **0 after** the
hoist (`25,0,0,0,…` across 13 samples / two ticks). Fix: hoist
`generateSmoothPath` + `TrailPath` to module scope (matches the file's own
idiom — MountainSVG et al.); the dash offset is now derived purely as
`seededDashOffset(trailId, animKey)` (FNV-1a hash) — the react-hooks
`set-state-in-effect` and `purity` rules forced out the old
`Math.random()` + setState-in-effect pattern, leaving one state hook fewer
with the same visual behaviour (per-trail, per-tick offset in [0, 20)).
7E risk assessment: the fix required zero structural change → the page
extraction stays deferred. Honest caveat on the FCP done-when: the
interleaved prod-vs-fixed FCP A/B landed in a host contention window
(prod rAF stalls up to 7.2 s during measurement), burying absolute FCP;
the churn result above is noise-immune and quiet-window long tasks show no
regression (120–665 ms). Verified: worldmap unit tests 18/18, e2e 3/3
chromium, lint + typecheck clean.

### Phase 8E-3 — Coverage headroom

Direct branch tests for the worst files, highest ratio-first:
`AnalyticsPage` (66.7%), `OfflineIndicator` 51–73, `CommandTyper` 276–284,
`CodePlayground`, `ProgressBar:19`, `TechnologyPage`, `SkillsPage`,
`SeasonalEventsPage`, `CareerPathPage`. Target: branches ≥ 93.5% (2 pts of
ratchet margin), statements ≥ 98%.

**Done when:** single-process coverage run shows branches ≥ 93.5% and all
suites green.

### Phase 8E-4 — Gates, release v0.1.7, deploy, verify

Full ladder (lint, typecheck, canonical suite 109 files, e2e ×3 browsers),
CHANGELOG, tag, GitHub release, Cloudflare deploy, byte-verify. GitForge
validation (#22) remains user-gated on `gitforge auth --login`.

## 3. Constraints carried forward

- Single-process coverage only; patch vitest's two spawn deadlines first
  (see plan 004 §7C diagnosis).
- e2e and unit suites run serially on this host.
- No placeholders/stubs/simulated data anywhere, including tests.
- Conventional Commits; commit+push at start and end of every work block.
