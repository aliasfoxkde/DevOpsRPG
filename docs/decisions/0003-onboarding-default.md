# ADR-0003: New players skip the onboarding wizard by default

- **Status:** Accepted
- **Date:** 2026-09-23
- **Deciders:** Repository owners (revisit trigger recorded below)

## Context

`OnboardingWizard` walks new players through HUD, quests and the world map. Fresh
saves default to `hasSeenOnboarding: true` (`src/contexts/GameContext.tsx`, default
game state), so the wizard never opens for a new player unless they explicitly
trigger it. The wizard and its flow remain fully implemented and tested; the
default is the product decision, not a dead component.

## Decision

Keep `hasSeenOnboarding: true` as the fresh-save default. The first interaction a
player gets is the world map / dashboard, not a modal wizard. Progression mechanics
(streaks, daily rewards, first-quest flow) already teach the core loop.

## Consequences

- No first-run modal friction; the game is playable the moment it loads.
- The wizard is dormant surface area: it ships in the bundle but is only reachable
  through explicit triggers. If product wants a guided first run, flip the default
  to `false` — the component, its tests and the `completeOnboarding` reducer are
  already in place and covered by `GameContext.test.tsx`.
- Do not delete `OnboardingWizard` as "dead code" without revisiting this ADR; its
  4% coverage share was accepted deliberately.
