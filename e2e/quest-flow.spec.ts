import { test, expect, type Page } from '@playwright/test'

test.describe('Quest Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('progressbar', { name: /experience/i })).toBeVisible({
      timeout: 15000,
    })
  })

  test('quest journal lists available quests', async ({ page }) => {
    await page
      .getByRole('navigation', { name: 'Primary navigation' })
      .getByRole('link', { name: 'Quests' })
      .click()
    await expect(page).toHaveURL(/quests/)

    // Quest cards link to individual quest pages
    const questLinks = page.locator('a[href^="/quest/"]')
    await expect(questLinks.first()).toBeVisible()
    expect(await questLinks.count()).toBeGreaterThan(0)
  })

  test('can start a quest from the journal', async ({ page }) => {
    await page
      .getByRole('navigation', { name: 'Primary navigation' })
      .getByRole('link', { name: 'Quests' })
      .click()
    await expect(page).toHaveURL(/quests/)

    await page.locator('a[href^="/quest/"]').first().click()
    await expect(page).toHaveURL(/quest\/.+/)

    // The battle arena should render the quest (not an error state)
    const heading = page.getByRole('heading', { level: 1 })
    await expect(heading).toBeVisible()
    await expect(heading).not.toHaveText('Quest Not Found')
    await expect(heading).not.toHaveText('Quest Content Unavailable')
  })
})

test.describe('Daily Rewards', () => {
  test('rewards page shows daily reward tiles', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('progressbar', { name: /experience/i })).toBeVisible({
      timeout: 15000,
    })

    await page.getByRole('button', { name: /more navigation options/i }).click()
    await page.getByRole('menuitem', { name: /rewards/i }).click()
    await expect(page).toHaveURL(/rewards/)

    // Daily reward calendar renders a tile per day
    await expect(page.getByText('Day 1', { exact: true })).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Victory Modal', () => {
  // Seeds victory state using the app's own persisted shape (storage key from
  // STORAGE_KEYS.GAME = 'devopsquest_game'), then reloads so the app loads it.
  async function loadWithVictory(page: Page) {
    // Seeds via addInitScript so the record exists before the app boots.
    // The previous evaluate-then-reload version raced the app's mount-time
    // requestAnimationFrame quest save, which could overwrite the seed with
    // pre-seed state after the write but before the reload.
    await page.addInitScript(() => {
      const key = 'devopsquest_game'
      // Structural slice of the app's persisted GameState: only the fields this
      // seed touches are modelled, everything else is passed through untouched.
      const isRecord = (value: unknown): value is Record<string, unknown> =>
        typeof value === 'object' && value !== null
      const raw = localStorage.getItem(key)
      let parsed: unknown = {}
      try {
        parsed = raw ? JSON.parse(raw) : {}
      } catch {
        parsed = {}
      }
      const state = isRecord(parsed) ? parsed : {}
      state.hasSeenOnboarding = true
      state.showVictory = true
      state.lastVictory = { xp: 100, levelUp: false, newLevel: 2, milestone: null, badge: null }
      // loadAndValidateGame rejects records without these two fields before it
      // deep-merges onto the app defaults, and a rejected record boots a fresh
      // game with showVictory cleared. An empty character object and empty
      // badge array pass the check and merge onto the defaults on load.
      if (!isRecord(state.character)) state.character = {}
      if (!Array.isArray(state.badges)) state.badges = []
      localStorage.setItem(key, JSON.stringify(state))
    })
    await page.goto('/')
    // Scoped to the banner: the victory modal under test renders its own
    // "Experience progress" bar, which would trip strict mode on this wait.
    await expect(
      page.getByRole('banner').getByRole('progressbar', { name: /experience/i }),
    ).toBeVisible({ timeout: 15000 })
  }

  test('victory modal shows on quest complete', async ({ page }) => {
    await loadWithVictory(page)

    await expect(page.getByText('QUEST COMPLETE!')).toBeVisible({ timeout: 10000 })
  })

  test('victory modal can be closed with N key', async ({ page }) => {
    await loadWithVictory(page)

    await expect(page.getByText('QUEST COMPLETE!')).toBeVisible({ timeout: 10000 })

    // 'N' activates the modal's primary (dismiss) button
    await page.keyboard.press('n')

    await expect(page.getByText('QUEST COMPLETE!')).not.toBeVisible({ timeout: 5000 })
  })
})
