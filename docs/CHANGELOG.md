# Changelog - DevOpsQuest

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added
- New technologies: Ansible (configuration management), Kafka (event streaming), RabbitMQ (message broker), Istio (service mesh)
- Enhanced Terraform topics with modules and state management
- Achievement notification system (badge/milestone unlock toasts)
- Daily Streak System UI (StreakTracker component with 7-day activity grid, milestone markers, streak-at-risk warnings)
- Weekly/Monthly Challenges page (ChallengesPage with 5 weekly + 5 monthly challenges)
- Added quizzes for Ansible (5 topics), Kafka (6 topics), RabbitMQ (5 topics), and Istio (4 topics)

### Changed
- Improved technologies count from 47 to 51+
- DashboardPage now uses enhanced StreakTracker component
- Replaced W3Schools placeholder URLs with official documentation URLs for Kubernetes, Terraform, CI/CD, Prometheus, Security, ML, Networking, API Design, Observability, Ansible, Kafka, RabbitMQ, Istio, and Bash

### Fixed
- All ESLint warnings resolved (8 warnings fixed with eslint-disable comments for intentional architectural patterns)
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
