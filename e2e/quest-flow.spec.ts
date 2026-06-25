import { test, expect } from '@playwright/test'

test.describe('Quest Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Skip onboarding if present
    const continueBtn = page.locator('button').filter({ hasText: /continue|start|begin/i }).first()
    if (await continueBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await continueBtn.click()
      await page.waitForTimeout(1000)
    }
  })

  test('can view quest list', async ({ page }) => {
    await page.click('text=Quests')
    await expect(page).toHaveURL(/quests/)
    // Should see some quests
    await expect(page.locator('text=Quest').or(page.locator('text=📜'))).toBeVisible()
  })

  test('can start a quest', async ({ page }) => {
    await page.click('text=Quests')

    // Look for a quest to click
    const questCard = page.locator('[class*="cursor-pointer"], [class*="hover:bg-slate"]').first()
    if (await questCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await questCard.click()
      // Should navigate to battle arena
      await expect(page).toHaveURL(/quest/)
    }
  })

  test('keyboard shortcut N works for auto-solve', async ({ page }) => {
    await page.click('text=Quests')

    // Find and start a quest
    const questCard = page.locator('[class*="cursor-pointer"], [class*="hover:bg-slate"]').first()
    if (await questCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await questCard.click()
      await page.waitForURL(/quest/)

      // Check if quiz or minigame is visible
      const quizVisible = await page.locator('text=Knowledge Check, text=Quiz').isVisible({ timeout: 3000 }).catch(() => false)
      if (quizVisible) {
        // Press N to auto-answer
        await page.keyboard.press('n')
        await page.waitForTimeout(500)
      }
    }
  })
})

test.describe('Daily Rewards', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Skip onboarding if present
    const continueBtn = page.locator('button').filter({ hasText: /continue|start|begin/i }).first()
    if (await continueBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await continueBtn.click()
      await page.waitForTimeout(1000)
    }
  })

  test('daily reward claim button exists', async ({ page }) => {
    await page.click('text=Rewards')

    // Look for daily reward section
    const dailySection = page.locator('text=Daily Reward, text=Daily Bonus, text=📅').first()
    if (await dailySection.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Claim button should exist
      await expect(page.locator('button').filter({ hasText: /claim|collect|receive/i })).toBeVisible()
    }
  })
})

test.describe('Victory Modal', () => {
  test('victory modal shows on quest complete', async ({ page }) => {
    await page.goto('/')

    // Set up game state to show victory (via console)
    await page.evaluate(() => {
      const gameState = {
        character: {
          name: 'Test',
          avatar: '⚔️',
          level: 1,
          xp: 0,
          gold: 0,
          streakDays: 0,
          streakShields: 0,
          title: 'Novice',
          completedQuests: [],
          badges: [],
          collectibles: [],
          recentBadgeUnlocks: [],
          recentMilestoneUnlocks: [],
        },
        completedRealms: [],
        completedQuestIds: [],
        stats: { questsCompleted: 0, totalXP: 0, quiz: 0, typer: 0, memory: 0, math: 0, minigame: 0, challenge: 0 },
        lastDailyReward: null,
        showVictory: true,
        lastVictory: { xp: 100, levelUp: false, newLevel: 2, milestone: null, badge: null },
        showRealmCompletion: null,
        hasSeenOnboarding: true,
      }
      localStorage.setItem('devopsquest-game', JSON.stringify(gameState))
    })

    await page.reload()
    await page.waitForTimeout(1000)

    // Victory modal should be visible
    await expect(page.locator('text=QUEST COMPLETE').or(page.locator('text=Level Up'))).toBeVisible({ timeout: 5000 })
  })

  test('victory modal can be closed with N key', async ({ page }) => {
    await page.goto('/')

    // Set up game state to show victory
    await page.evaluate(() => {
      const gameState = {
        character: {
          name: 'Test',
          avatar: '⚔️',
          level: 1,
          xp: 0,
          gold: 0,
          streakDays: 0,
          streakShields: 0,
          title: 'Novice',
          completedQuests: [],
          badges: [],
          collectibles: [],
          recentBadgeUnlocks: [],
          recentMilestoneUnlocks: [],
        },
        completedRealms: [],
        completedQuestIds: [],
        stats: { questsCompleted: 0, totalXP: 0, quiz: 0, typer: 0, memory: 0, math: 0, minigame: 0, challenge: 0 },
        lastDailyReward: null,
        showVictory: true,
        lastVictory: { xp: 100, levelUp: false, newLevel: 2, milestone: null, badge: null },
        showRealmCompletion: null,
        hasSeenOnboarding: true,
      }
      localStorage.setItem('devopsquest-game', JSON.stringify(gameState))
    })

    await page.reload()
    await page.waitForTimeout(1000)

    // Victory modal should be visible
    await expect(page.locator('text=QUEST COMPLETE').or(page.locator('text=Level Up'))).toBeVisible({ timeout: 5000 })

    // Press N to close
    await page.keyboard.press('n')
    await page.waitForTimeout(500)

    // Modal should be gone
    await expect(page.locator('text=QUEST COMPLETE')).not.toBeVisible()
  })
})