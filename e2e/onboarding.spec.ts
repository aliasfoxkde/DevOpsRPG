import { test, expect } from '@playwright/test'

test.describe('Onboarding Flow', () => {
  test('new user sees onboarding wizard', async ({ page }) => {
    // Clear localStorage to simulate fresh user
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()

    // Should show onboarding wizard
    await expect(page.locator('text=Welcome to DevOpsQuest')).toBeVisible({ timeout: 10000 })
  })

  test('user can complete onboarding', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()

    // Wait for onboarding
    await expect(page.locator('text=Welcome to DevOpsQuest')).toBeVisible({ timeout: 10000 })

    // Select avatar
    const avatarButton = page.locator('button').filter({ hasText: '⚔️' }).first()
    if (await avatarButton.isVisible()) {
      await avatarButton.click()
    }

    // Enter name if input exists
    const nameInput = page.locator('input[placeholder*="name" i], input[placeholder*="称呼" i]')
    if (await nameInput.isVisible()) {
      await nameInput.fill('Test Hero')
    }

    // Click continue/start button
    const continueButton = page.locator('button').filter({ hasText: /continue|start|begin|next/i }).first()
    if (await continueButton.isVisible()) {
      await continueButton.click()
    }

    // Should eventually get to home page
    await expect(page.locator('text=DevOpsQuest').or(page.locator('text=⚔️'))).toBeVisible({ timeout: 15000 })
  })
})

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    // Clear and setup a fresh game state
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
    // Complete onboarding if visible
    const continueBtn = page.locator('button').filter({ hasText: /continue|start|begin/i }).first()
    if (await continueBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await continueBtn.click()
      await page.waitForTimeout(500)
    }
  })

  test('shows character info in HUD', async ({ page }) => {
    await expect(page.locator('text=Lv')).toBeVisible()
    await expect(page.locator('text=DevOpsQuest').or(page.locator('text=⚔️'))).toBeVisible()
  })

  test('shows XP bar', async ({ page }) => {
    await expect(page.locator('.bg-gradient-to-r')).toBeVisible() // XP bar gradient
  })
})

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Skip onboarding if present
    const continueBtn = page.locator('button').filter({ hasText: /continue|start|begin/i }).first()
    if (await continueBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await continueBtn.click()
    }
  })

  test('can navigate to quests page', async ({ page }) => {
    await page.click('text=Quests')
    await expect(page).toHaveURL(/quests/)
  })

  test('can navigate to character page', async ({ page }) => {
    await page.click('text=Hero')
    await expect(page).toHaveURL(/character/)
  })

  test('can navigate to rewards page', async ({ page }) => {
    await page.click('text=Rewards')
    await expect(page).toHaveURL(/rewards/)
  })
})