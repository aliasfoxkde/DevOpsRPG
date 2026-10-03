import { test, expect } from '@playwright/test'
import { seedGame, gotoApp } from './helpers'

/**
 * The core loop end to end: open a quest, pass its quiz, watch the victory
 * modal fire, and see every artifact of the run survive a reload. The quiz is
 * driven through its 'n' keyboard flow (auto-answer → next → finish), so the
 * test exercises the real Quiz component without hardcoding question data.
 */
test.describe('Quest progression', () => {
  const QUEST_URL = '/quest/quest_html_intro'
  // The modal header is variant, not fixed: a completion that crosses a level
  // threshold renders "🎉 LEVEL UP! 🎉" instead of "QUEST COMPLETE!"
  // (VictoryModal.tsx) — and a fresh save's first quest payout always crosses
  // one. The heading is the modal's invariant anchor.
  const victory = (page: import('@playwright/test').Page) =>
    page.getByRole('heading', { name: /LEVEL UP!|QUEST COMPLETE!/ })

  /**
   * Drives the quiz with 'n' presses, checking between each press so none
   * lands after the victory modal opens (it also binds 'n' and a stray press
   * would dismiss it). Under host CPU waves a press can outpace the render,
   * in which case the handler re-answers the same question — harmless, the
   * loop simply needs another press.
   */
  async function quizToVictory(page: import('@playwright/test').Page): Promise<void> {
    for (let i = 0; i < 12; i++) {
      if (
        await victory(page)
          .isVisible()
          .catch(() => false)
      )
        return
      await page.keyboard.press('n')
      await page.waitForTimeout(350)
    }
    await expect(victory(page)).toBeVisible({ timeout: 15000 })
  }

  test('completing a quest awards XP and fires the victory modal', async ({ page }) => {
    await seedGame(page, {})
    await gotoApp(page, QUEST_URL)

    // Study mode is the default and hosts the "Take Quiz to Complete (+N XP)"
    // CTA (the N reflects the live seasonal multiplier) — it switches to quiz
    // mode, where the Quiz component renders.
    await page.getByRole('button', { name: /Take Quiz to Complete/ }).click()
    await quizToVictory(page)

    // The XP bar reflects a raise over the fresh save's 0 XP. Quest payouts
    // carry the live seasonal multiplier, so the amount itself is not pinned.
    await expect(page.getByText(/⚡\s*[1-9]/)).toBeVisible({ timeout: 15000 })
  })

  test('quest completion and XP survive a reload', async ({ page }) => {
    await seedGame(page, {})
    await gotoApp(page, QUEST_URL)
    await page.getByRole('button', { name: /Take Quiz to Complete/ }).click()
    await quizToVictory(page)

    await page.reload()
    await gotoApp(page, QUEST_URL)

    // The quest card reports completion instead of offering the quiz toggle
    // (exact: the page also renders a "Quest Completed!" banner)
    await expect(page.getByText('Completed', { exact: true })).toBeVisible({ timeout: 15000 })
    await expect(page.getByRole('button', { name: '📝 Quiz' })).toHaveCount(0)

    // And the earned XP is still on the character
    await expect(page.getByText(/⚡\s*[1-9]/)).toBeVisible({ timeout: 15000 })
  })

  test('journal marks the completed quest and filters it out of available', async ({ page }) => {
    // TopicProgress shape as persisted by completeQuest
    await seedGame(page, {
      completedQuests: [
        {
          topicId: 'html_intro',
          technologyId: 'html',
          questId: 'quest_html_intro',
          completed: true,
          xpEarned: 53,
        },
      ],
    })
    await gotoApp(page, '/quests')

    await expect(page.getByRole('heading', { level: 1, name: 'Quest Journal' })).toBeVisible()

    // Available filter excludes the completed quest
    await page.getByLabel('Filter quests by status').selectOption('available')
    await expect(page.getByRole('link', { name: /HTML Introduction/ })).toHaveCount(0)

    await page.getByLabel('Filter quests by status').selectOption('completed')
    await expect(page.getByRole('link', { name: /HTML Introduction/ }).first()).toBeVisible()
  })
})
