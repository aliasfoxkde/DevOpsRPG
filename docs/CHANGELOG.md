# Changelog - DevOpsQuest

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

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
- Quiz/topic ID mismatches fixed: css_boxmodel→css_box_model, aws_ec2→aws-ec2, aws_s3→aws-s3, python_*→py_*
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
