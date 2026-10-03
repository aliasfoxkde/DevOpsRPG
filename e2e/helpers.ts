import { expect, type Page } from '@playwright/test'

/**
 * Shared seeding + boot helpers for the e2e suite.
 *
 * Seeds follow the app's own storage contract (STORAGE_KEYS.GAME =
 * 'devopsquest_game'): a structural slice of the persisted GameState is
 * merged into whatever is already stored, and the loader's validation gate
 * (object character + array badges) is satisfied so the record is accepted
 * and deep-merged onto the app defaults. Seeding happens in addInitScript so
 * the record exists before the app boots — the same pattern quest-flow.spec
 * uses to avoid the mount-time save racing the seed.
 */

export const GAME_KEY = 'devopsquest_game'

type StateSlice = Record<string, unknown>

export async function seedGame(page: Page, slice: StateSlice): Promise<void> {
  // Awaited: goto must not boot the app before the seed script is registered.
  // One-shot: the init script re-fires on every navigation, so a reload test
  // must not re-apply the slice over the state the app just wrote — the seed
  // lands only when the storage key is absent (first boot).
  await page.addInitScript(
    ({ key, slice }: { key: string; slice: StateSlice }) => {
      if (localStorage.getItem(key) !== null) return
      const isRecord = (value: unknown): value is Record<string, unknown> =>
        typeof value === 'object' && value !== null
      const state: StateSlice = {}
      Object.assign(state, slice)
      // Fresh profiles boot the onboarding wizard over everything else
      state.hasSeenOnboarding = true
      // loadAndValidateGame rejects records without these two fields before
      // merging onto defaults — satisfy the gate, pass the rest through.
      if (!isRecord(state.character)) state.character = {}
      if (!Array.isArray(state.badges)) state.badges = []
      localStorage.setItem(key, JSON.stringify(state))
    },
    { key: GAME_KEY, slice },
  )
}

/** Navigates and waits for the HUD so lazy-loaded pages have settled. */
export async function gotoApp(page: Page, path = '/'): Promise<void> {
  await page.goto(path)
  // Scoped to the banner: pages above level 1 render a second "Experience
  // progress" bar (the level-up panel), which would trip strict mode.
  await expect(
    page.getByRole('banner').getByRole('progressbar', { name: /experience/i }),
  ).toBeVisible({ timeout: 15000 })
}
