# Changelog - DevOpsQuest

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

Quality-infrastructure cycle: GitForge-first CI, a production worker CORS fix found by the
new worker test suite, and a repo-wide strict type-aware lint campaign.

### Added

- GitForge CI pipeline (`.gitforce.yml`) as the primary CI/CD definition — lint/format/knip,
  typecheck (app + tooling + worker), unit + worker tests, e2e, aegis security scan, and build;
  the GitHub Actions workflow mirrors the same npm scripts so both platforms stay in lockstep
- `npm run audit:secrets`: Aegis production-profile pattern scan with a committed baseline
  ratchet (`aegis-baseline.json`, 198 triaged findings) — the gate fails only on findings that
  are new relative to the baseline
- `npm run test:worker` + `worker/vitest.config.ts`: 18 tests over the worker KV API router
  (CORS preflight/echo, auth schemes, progress merge semantics, leaderboard happy/sad paths,
  404 routing) using in-memory KV/D1 fakes with real get/put serialization semantics
- Accessibility audit extended to all 30 routes in both themes with `wcag2a`/`wcag2aa`/`wcag21aa`/
  `wcag2aaa` rule tagging and separate AA/AAA reporting (`--aaa-strict` promotes AAA
  critical/serious to gate failures)
- `npm run format:check` (prettier, repo-wide single style) and `npm run knip` (unused
  exports/files/dependencies) gates in CI

### Fixed

- **Worker CORS bug (production-blocking)**: every JSON response hardcoded
  `Access-Control-Allow-Origin: http://localhost:5173`, so the deployed API rejected browser
  calls from the production Pages origin — JSON and preflight responses now resolve the origin
  against `ALLOWED_ORIGINS` and echo the caller's; covered by regression tests
- Strict type-aware lint campaign: typescript-eslint `strictTypeChecked` applied per-scope
  (app / tooling / worker) resolving 1,165 reported errors to a zero-warning gate, including
  removal of dead exports surfaced by the type-aware rules

### Changed

- `docs/process/VALIDATION.md` rewritten to document the actual 10-gate validation suite and
  coverage-ratchet procedure (the previous text described OAuth flows, iframes and ports this
  app does not have)

## [0.1.2] - 2026-09-23

Quality hardening pass: accessibility driven to zero violations, strict linting enforced,
and a test campaign that caught real data/logic defects.

### Added

- `npm run audit:a11y` (scripts/axe-audit.mjs): Playwright + axe-core scan of 6 routes in both themes, non-zero exit on critical/serious violations
- `src/data/integrity.test.ts`: 37 cross-module data-integrity tests (unique ids, referential integrity, prerequisite cycles, quiz answerability, phase→realm mapping, badge requirement handling, puzzle solvability)
- `src/contexts/GameContext.test.tsx`: 21 behavior tests (XP/level, quest completion idempotency, badge grants, streak shields, learning topics, daily rewards, persistence + backup recovery + cross-tab sync)
- E2E job in CI: 3-browser matrix (chromium, firefox, webkit) with browser caching and report artifacts; both deploy jobs now gate on it
- `HANDLED_REQUIREMENT_TYPES` export in badges.ts guarding against badge requirement types with no unlock handler
- Page smoke suites for every route in `src/pages/` (34 files) plus UI-kit, mini-game, export/import and data-integrity suites — 73 test files, 636 tests
- Coverage ratchet wired into `vite.config.ts` (`coverage.thresholds` pinned just below measured values; policy in `docs/decisions/0004-coverage-ratchet-policy.md`)
- Architecture Decision Records under `docs/decisions/` (GitForge-first CI, prod-only service worker, onboarding default, coverage ratchet)

### Changed

- ESLint runs with `--max-warnings 0` and promoted rules to error: `react-hooks/exhaustive-deps`, `@typescript-eslint/no-explicit-any`, `no-fallthrough`, `eqeqeq`, `prefer-const`
- Playwright E2E boots its dev server on dedicated port 5299 (E2E_PORT overrides) so a foreign Vite app on the default port can no longer silently serve the wrong app to every test; human dev server stays on 5173
- Dark-first theme default matching the app's design (dark was already the visual default; now explicit and tested)

### Fixed

- **`grantBadge` was a no-op for every catalog badge** — badges are pre-seeded in locked state and the guard tested "id exists" instead of "id unlocked", so challenge/reward/seasonal badge claims silently did nothing
- Secret side quest `perfectionist` rewarded badge id `perfectionist`, which had no badge definition (claims would have rendered a broken entry) — badge added (epic, 300 XP / 150 gold)
- Phase 7 had no category in `technologies.ts` although Kafka/RabbitMQ/Istio are phase 7 — added `Streaming & Mesh`
- `aiintelligence` realm omitted `ansible` (phase 6) and all phase-7 techs from its technologies list, leaving them unreachable on the world map
- Orphaned `gitops_intro` / `gitops_argocd` quizzes referenced topics that never existed — removed
- Code puzzle `css_prop` was unanswerable (answer `red` not among its options) and `git_cmd`/`python_list` shipped options missing their answers — a deck containing them could never be solved; all now offer their answers
- Incident scenario `high-cpu-production` ended on a command-less "Monitor for 5 minutes" step that dead-ended every run — final step now accepts `kubectl top nodes`
- `IncidentSimulator` scored a flawless run at 86% (stale completion callback dropped the last step from accuracy) — the final step list is passed explicitly, flawless runs now score 98-99%
- `IncidentSimulator` hint button advertised "+10s penalty" but never applied it — the penalty is now charged to the clock
- `MiniGameHub` accuracy could exceed 100% (Math Challenge raw score 1175/750 displayed 157%) — clamped to 100%
- `MiniGameHub` Terminal Simulator tile was announced as "Play Incident Simulator game", duplicating the incident tile's accessible name — each tile now announces its own title
- `ChallengesPage` claim guard was inverted (`completed || claimed` instead of `!completed || claimed`), so the CLAIM! button — only rendered for completed challenges — silently did nothing: no rewards, no claimed state
- The "no fastest quest yet" sentinel (`Infinity`) does not survive JSON persistence, so after a reload the Analytics "Fastest Quest" showed `0s` and the next completed quest collapsed the record to 0 (wrongly unlocking the speed badge) — the load path restores the sentinel
- `BadgesPage` counted the pre-seeded catalog array as "earned", reading "81 of 81 badges earned" for a brand-new player — the count now reflects actual unlocks
- WCAG contrast failures: 12 critical + 107 serious axe violations → **0/0** across all audited routes in both themes (token-level palette remaps, dark surface tokens for light-mode cards, named controls, modal focus restoration, `animate-pulse` replaced by a glow effect that keeps text above AA mid-animation)
- shellcheck SC2086 warnings in autonomous-agents workflow (actionlint 1.7.7 clean)

## [0.1.1] - 2026-09-22

First tagged release. Ships the previously unreleased feature work below plus a
quality/infrastructure hardening pass. Full baselines and the phased roadmap live in
[docs/planning/003-QUALITY_PLAN.md](planning/003-QUALITY_PLAN.md).

### Added

- New technologies: Ansible (configuration management), Kafka (event streaming), RabbitMQ (message broker), Istio (service mesh)
- Enhanced Terraform topics with modules and state management
- Achievement notification system (badge/milestone unlock toasts)
- Daily Streak System UI (StreakTracker component with 7-day activity grid, milestone markers, streak-at-risk warnings)
- Weekly/Monthly Challenges page (ChallengesPage with 5 weekly + 5 monthly challenges)
- Added quizzes for Ansible (5 topics), Kafka (6 topics), RabbitMQ (5 topics), and Istio (4 topics)
- `docs/planning/003-QUALITY_PLAN.md`: verified quality baselines (gates, axe-core a11y, Aegis scan, code smells) and a 7-phase roadmap (coverage ratchet to 99%, WCAG AA→AAA, strict linting, E2E browser matrix, release cadence)
- `axe-core` as a devDependency for accessibility auditing
- `src/vite-env.d.ts` for `import.meta.env` typing

### Changed

- Improved technologies count from 47 to 51+
- DashboardPage now uses enhanced StreakTracker component
- Replaced W3Schools placeholder URLs with official documentation URLs for Kubernetes, Terraform, CI/CD, Prometheus, Security, ML, Networking, API Design, Observability, Ansible, Kafka, RabbitMQ, Istio, and Bash
- Playwright pins the dev server to `127.0.0.1` and honours an `E2E_PORT` override, avoiding `::1`/`0.0.0.0` port conflicts
- Vitest only collects tests under `src/`; Vite pre-bundles the 5 runtime dependencies (`optimizeDeps.include`) to stop mid-session re-optimization reloads
- Service worker registration is production-only (`import.meta.env.PROD`) — no more dev-server navigation hijacking

### Fixed

- Removed the tracked `.claude` symlink that pulled the global agent-harness tree into Vite's file watcher, wedging the dev server event loop and failing all 13 E2E tests
- E2E specs rewritten against current behavior (the onboarding wizard is skipped by default; selectors now role-based) — 10/10 passing on Chromium
- All 14 ESLint warnings resolved: 8 `react-hooks/exhaustive-deps` fixed properly (callback ordering, memoization, effect deps) and 6 `react-refresh/only-export-components` resolved by moving constants to `gameUtils` or deleting dead exports
- Shared game constants (`XP_PER_LEVEL`, `MAX_HP`, `MAX_MP`, `COLLECTIBLE_DROP_RATE`, `GOLD_XP_RATIO`) are now first-class exports from `gameUtils` instead of implicit GameContext re-exports
- Duplicate React key on `/quests` (Battle Arena breadcrumb reused the Quests path)
- HUD secondary nav dropped 4 of 15 items (Shop, Badges, Tech Cards, Certs) — regrouped, all render
- False "data corrupted" console error on every first visit — empty storage is now silent; warnings only when existing data is unreadable
- Documentation accuracy: `CONTRIBUTING.md` no longer references a nonexistent `stable` branch; `.github/copilot-instructions.md` no longer claims a pre-commit hook (validation runs in CI); `docs/README.md` index refreshed
- Badge system gaps: added missing requirement type handlers (challenge_complete, sidequest_complete, milestone_tier, all_realms, all_technologies, gold_hoard, first_legendary, quiz_master)
- GameContext badgeStats now includes derived stats (allRealms, allTechnologies, goldHoard)
- Milestone speed_quest trigger now properly handled in checkMilestone function
- Added 16 missing badge definitions (weekly_crusader, streak_sentinel, quiz_wizard, devops_champion, monthly_master, quiz_oracle, weekly_warrior, xp_champion, streak_master, quiz_legend, world_traveler, journeyman, expert, master, grandmaster)
- MysteryBox error handling improved with try-catch and fallback UI
- Quiz stat tracking fixed: incrementStat('quiz', isPerfect, wrongAnswers) now called on quiz completion, enabling quiz badges to unlock properly
- quest_all badge requirement value updated from 118 to 163 to match actual quest count
- Wrong answer tracking added for no_mistakes badge support
- grantBadge now properly triggers recentBadgeUnlocks for celebration UI
- Removed deprecated helper badge (help_count requirement not implemented)
- Ansible prerequisite fixed: 'linux' → 'bash' (linux technology doesn't exist)
- Quiz/topic ID mismatches fixed: css_boxmodel→css_box_model, aws_ec2→aws-ec2, aws_s3→aws-s3, python__→py__
- tier_5 milestone requirement value fixed: 118 → 163 quests
- all_categories badge now properly checks earnedCategories for quest/streak/skill/secret
- all_badges badge now properly checks total badges earned
- QuestJournalPage realm unlock now uses actual quest count instead of fixed *5 assumption
- TechnologyPage now uses tech.xpPerTopic for correct XP rewards (25 → 75-200 based on technology)
- all_technologies badge threshold fixed: 40 → 26 (actual tech count)
- streak_7_secret fixed: 7-day → 21-day streak (was duplicate of streak_7)
- Added challengeComplete, sidequestComplete, milestoneTier to GameState stats
- Added missing max_level badge handler (badge would never unlock without it)
- Python quiz IDs fixed: python_* → py_* to match topic IDs in technologies.ts
- Added quizMasterScore tracking for quiz_master badge (80%+ scores)
- Added fastestQuestTime tracking for speed_demon badge
- Added currentQuestStartTime to GameState
- allRealms/allTechnologies now derived from data (Object.keys)
- XP_PER_LEVEL consolidated: exported from GameContext, removed from ProfilePage/XPBar/DashboardPage
- Added 'challenge' to incrementStat type; ChallengesPage tracks challengeComplete on claim

## [0.1.0] - 2026-06-22

### Added

- Initial project scaffold
- ViteJS + React 19 + TypeScript configuration
- Tailwind CSS v4 with dark/light theme support
- Project documentation (PLAN.md, RESEARCH.md, TASKS.md, PROGRESS.md)
- TDD.md test planning document
- VALIDATION.md validation criteria
- Cloudflare Workers API structure
- 47 technology learning paths defined
- 5 career path themes defined
- Gamification system design (XP, levels, achievements, streaks)
- PWA manifest and service worker scaffolding
- Onboarding wizard for new users

### Fixed

- Badge/milestone unlocking broken for technology-based badges (computing techCompleted from completedQuests)
- XP progress display showing wrong values when XP > 2*xpToNextLevel
- Division by zero causing NaN display in progress calculations
- Weekly quests expiring on wrong date (day-of-week calculation)
- Personality trait strings with incorrect whitespace (impatient)
- Leaderboard generating duplicate entries
- Invalid Tailwind class `bottom-18` (should be `bottom-16`)
- Dead code in useKeyboardShortcuts (unused singleShortcut variable)
- Minigame stat tracking not incrementing (now calls incrementStat on game complete)
- ESLint react-hooks/exhaustive-deps error in BadgesPage
- topicId vs questId mismatch in badge/milestone checking (was comparing wrong fields)
- Achievement restoration crash on old save files (missing null guard)
- Two-key shortcut sequence never fires (clearPendingKey called before building sequence)
- Stale state in MathChallenge XP calculation (correct * 15 used old value)
- Stale state in CodePuzzle XP calculation (correct/wrong used old values)
- XP progress formula in DashboardPage (was using modulo instead of cumulative)
- Kubernetes topic ID mismatch (hyphens vs underscores between technologies and quizzes)
- Realm completion detection only finding first realm (break statement removed)
- Division by zero in HUD.tsx progress bars
- Division by zero in ProgressBar.tsx
- Division by zero in RewardsPage tier progress
- Deprecated stub 'helper' badge (future feature not yet implemented)
- Dead code removal (unused getRealmCompletionStatus function)
- SpinWheel circular dependency (rotation ref to avoid stale closure)
- Weekly quests Monday edge case (was expiring same day, now correctly expires next Monday)
- ESLint react-hooks/exhaustive-deps warnings in BadgesPage and MilestonesPage (isUnlocked now useCallback)
- GameContext useEffect missing dependencies (added eslint-disable with justification comment)
- BadgesPage playerStats used game.completedRealms instead of destructured completedRealms

### Planned (Next Release)

- OAuth authentication (Google, GitHub)
- Cloudflare D1 database integration
- Cloudflare KV session management
- Full technology catalog UI
- Topic viewer with W3Schools iframe
- Achievement system implementation
- Daily streak tracking
- PWA offline support

---

## Versioning

We use [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

- **Major version**: Incompatible API changes
- **Minor version**: New functionality in backwards compatible manner
- **Patch version**: Backwards compatible bug fixes

Current version: **0.1.0** (Pre-alpha - Feature complete for foundation)

---

## Release Schedule

- **v0.1.0** (2026-06-22): Foundation scaffold complete
- **v0.2.0** (2026-07-06): Authentication + Core UI
- **v0.3.0** (2026-08-03): Gamification + Learning flow
- **v1.0.0** (2026-08-31): Production-ready with 80% test coverage
