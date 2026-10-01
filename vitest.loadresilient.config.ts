// Load-resilient variant of the unit gate for shared/bursty hosts.
//
// The default gate (vite.config.ts test block) isolates every test file in
// its own worker, which costs ~106 worker spawns per run. Each spawn must
// finish inside vitest's hardcoded 90 s startup window; on a host with
// background CPU waves (see docs/planning/003-QUALITY_PLAN.md §6.6) random
// files lose that race and the run aborts them with "Failed to start
// threads worker" — pool-level spawn failures that --retry cannot recover.
//
// This config keeps the same tests, environment, setup and coverage
// thresholds, but splits the suite into two projects:
//
//   stateful  — the suites that depend on per-file module registries or
//               module-level provider state (measured: with everything
//               shared, the onboarding walk hung at 179 s on leaked state).
//               They keep per-file isolation.
//   shared    — everything else, running sequentially inside ONE long-lived
//               worker: one spawn event instead of ~106, and the jsdom
//               environment is created once instead of per file (setup was
//               ~149 s of the last full run).
//
// Coverage still comes from a single vitest invocation (one process tree),
// so the report and thresholds stay valid. Run it with:
//   npx vitest run --config vitest.loadresilient.config.ts \
//     --maxWorkers=1 --fileParallelism=false --testTimeout=60000 --coverage
// (Do NOT pass --no-isolate on the CLI: it would strip isolation from the
// stateful project too.)
//
// Note: vitest projects do NOT inherit the root's resolve.alias, environment,
// setupFiles or globals — every project restates them.
import { resolve } from 'path'
import { defineConfig, mergeConfig, defaultExclude } from 'vitest/config'
import type { ViteUserConfig } from 'vitest/config'
import base from './vite.config'

/** Suites that require per-file isolation (module-registry or provider state). */
const STATEFUL_SUITES = [
  'src/App.test.tsx',
  'src/contexts/GameContext.test.tsx',
  'src/contexts/GameContext.actions.test.tsx',
  'src/components/ui/OnboardingWizard.test.tsx',
  // Quiz's assertions read module-level question data that some other suite
  // mutates in the shared registry (the "Multiple Choice" type badge
  // disappears); LeaderboardPage's personal-record assertions depend on
  // storage sequencing an earlier file's writes disturb. BattleArena, Skills
  // and Guild assert absolute XP amounts, and the provider initialises its
  // in-memory state from storage at module import — under a shared registry
  // earlier files' quest completions leak into those amounts (order-
  // dependent, 42/42 green isolated). Finding a per-file provider reset is
  // the follow-up (plan doc §6.9).
  'src/components/ui/Quiz.test.tsx',
  'src/pages/LeaderboardPage.test.tsx',
  'src/pages/BattleArenaPage.test.tsx',
  'src/pages/SkillsPage.test.tsx',
  'src/pages/GuildPage.test.tsx',
]

// These declare `@vitest-environment node` per file. Switching environments
// inside a shared jsdom worker tears down globals mid-run (the next suite
// reads `window.navigator` off a dead environment), so they run isolated too.
const NODE_ENV_SUITES = [
  'src/contexts/game/gameStorage.test.ts',
  'src/data/moduleGuardrails.test.ts',
]

/** Fields vitest projects don't inherit from the root config. */
function projectTest(test: ViteUserConfig['test']): {
  resolve: ViteUserConfig['resolve']
  test: ViteUserConfig['test']
} {
  return {
    resolve: { alias: { '@': resolve(__dirname, './src') } },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: resolve(__dirname, './src/test/setup.ts'),
      ...test,
    },
  }
}

export default mergeConfig(
  base,
  defineConfig({
    test: {
      projects: [
        defineProject('stateful', { include: STATEFUL_SUITES, isolate: true }),
        defineProject('node', { environment: 'node', include: NODE_ENV_SUITES, isolate: true }),
        defineProject('shared', {
          include: ['src/**/*.{test,spec}.{ts,tsx}'],
          // Project-level exclude replaces the defaults — keep them.
          exclude: [...defaultExclude, ...STATEFUL_SUITES, ...NODE_ENV_SUITES],
          isolate: false,
        }),
      ],
    },
  }),
)

function defineProject(
  name: string,
  test: NonNullable<ViteUserConfig['test']>,
): ReturnType<typeof projectTest> {
  return projectTest({ ...test, name })
}
