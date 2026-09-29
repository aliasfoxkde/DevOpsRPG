import { test, expect } from '@playwright/test'

// Fresh browser contexts start with empty localStorage, so every test here
// exercises the real first-run experience.
// Note: the app currently defaults hasSeenOnboarding to true (GameContext
// createDefaultGame), so new users land directly on the home page HUD.

test.describe('Fresh User Experience', () => {
  test('fresh user lands on home page with game HUD', async ({ page }) => {
    // Don't block on "load": the dev server compiles the module graph on
    // demand, so the first navigation of a cold run can outlast the default
    // navigation timeout on slower machines. The assertions below do the
    // real waiting.
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    // HUD renders the character's XP progress
    await expect(page.getByRole('progressbar', { name: /experience/i })).toBeVisible({
      timeout: 15000,
    })
    // Home page greets the new hero (lazy-loaded route chunk on a cold run)
    await expect(page.getByRole('heading', { name: /welcome/i })).toBeVisible({
      timeout: 15000,
    })
  })

  test('HUD shows starting level and primary navigation', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('banner').getByText(/LV 1/)).toBeVisible({ timeout: 15000 })
    await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible()
  })
})

test.describe('Navigation', () => {
  test('can navigate to the quest journal', async ({ page }) => {
    await page.goto('/')
    await page
      .getByRole('navigation', { name: 'Primary navigation' })
      .getByRole('link', { name: 'Quests' })
      .click()
    await expect(page).toHaveURL(/quests/)
  })

  test('can navigate to the rewards page', async ({ page }) => {
    await page.goto('/')
    // Rewards lives in the extended nav behind "More navigation options"
    await page.getByRole('button', { name: /more navigation options/i }).click()
    await page.getByRole('menuitem', { name: /rewards/i }).click()
    await expect(page).toHaveURL(/rewards/)
  })

  test('can navigate to the character sheet', async ({ page }) => {
    await page.goto('/')
    await page
      .getByRole('navigation', { name: 'Primary navigation' })
      .getByRole('link', { name: 'Hero' })
      .click()
    await expect(page).toHaveURL(/character/)
  })
})
