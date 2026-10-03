import { test, expect } from '@playwright/test'
import { seedGame, gotoApp } from './helpers'

/**
 * Skill-tree allocation: seeded skill points are spendable via a tree's "+1"
 * buttons and the spend survives a reload. Points live on the character
 * (skillPoints), so the seed goes through the storage contract.
 */
test.describe('Skill tree', () => {
  test('allocating a skill point debits the balance and persists', async ({ page }) => {
    await seedGame(page, { character: { level: 3, xp: 200, skillPoints: 2 } })
    await gotoApp(page, '/skills')

    await expect(page.getByRole('heading', { level: 1, name: 'Skill Tree' })).toBeVisible()

    // The big number sits beside the label's wrapper div inside the points
    // card (label → parent div.text-left → preceding sibling = the number)
    const pointsValue = page
      .getByText('Skill Points Available')
      .locator('xpath=ancestor::div[1]/preceding-sibling::div[1]')
    await expect(pointsValue).toHaveText('2')

    // The first tree's root node is always allocatable (no prerequisites)
    const allocate = page.getByRole('button', { name: '+1' }).first()
    await expect(allocate).toBeEnabled()
    await allocate.click()

    // Balance debited immediately. Generous timeout: this host has deep CPU
    // waves and the tree re-render (bonus recalculation) can lag the click.
    await expect(pointsValue).toHaveText('1', { timeout: 15000 })

    // And the allocation round-trips through localStorage
    await page.reload()
    await gotoApp(page, '/skills')
    await expect(
      page
        .getByText('Skill Points Available')
        .locator('xpath=ancestor::div[1]/preceding-sibling::div[1]'),
    ).toHaveText('1', { timeout: 15000 })
  })
})
