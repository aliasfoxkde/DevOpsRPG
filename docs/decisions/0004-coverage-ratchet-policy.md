# ADR-0004: Coverage is enforced by a ratchet, not an absolute target

- **Status:** Accepted
- **Date:** 2026-09-23
- **Deciders:** Repository owners

## Context

The suite started at 13.7% statement coverage. Jumping straight to a 99% gate would
have blocked every unrelated change for weeks and invited low-value tests written
to satisfy a number. The campaign instead adds tests in value order (GameContext
rules, import sanitization, data integrity, minigames, UI kit, page smoke tests)
and locks in each gain so it can never silently regress.

## Decision

`vitest.config.ts` sets `coverage.thresholds` per coverage type, and each threshold
is pinned **just below the measured value at the time it is set**. Whenever real
coverage rises meaningfully above a threshold, the threshold is raised to the new
value minus a small margin. Coverage can only move up.

- Current gate: see `coverage.thresholds` in `vite.config.ts` (the vitest config
  lives there); it always reflects the latest ratchet notch with the date it was
  set in an adjacent comment.
- `coverage.include` covers `src/` except `src/components/layout/**` and
  `src/main.tsx` (thin shell code measured by E2E instead).
- Every bug fix lands with a regression test that demonstrates the fixed behavior,
  so defect fixes also raise the floor.

## Consequences

- A PR that deletes tests or ships untested code fails CI with a clear
  "coverage threshold" message rather than passing silently.
- Raising the notch is a one-line change reviewed like any code change.
- The long-term goal stated in `docs/planning/003-QUALITY_PLAN.md` (≥95% lines /
  85% branch, trending to 99%) is reached by ratcheting, not by a big-bang gate.
