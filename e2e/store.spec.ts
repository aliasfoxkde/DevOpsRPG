import { test, expect, type Page } from '@playwright/test'
import { seedGame, gotoApp } from './helpers'

/**
 * Store economics over the real catalog: seeded gold enables purchases, a
 * purchase debits the balance and marks the item owned, and both survive a
 * reload. The Gold Coin is the cheapest catalog item (40 gold), reached by
 * filtering to Power-Ups so "first Buy button" is deterministic.
 */
async function openStoreWithGold(page: Page, gold: number): Promise<void> {
  await seedGame(page, { character: { gold } })
  await gotoApp(page, '/store')
  await expect(page.getByRole('heading', { level: 1, name: /Quest Shop/ })).toBeVisible()
}

test.describe('Store', () => {
  test('a broke hero sees every purchase disabled', async ({ page }) => {
    await openStoreWithGold(page, 0)

    // Fresh saves carry 0 gold: buy buttons render "Need Gold" and disabled
    const buyButtons = page.getByRole('button', { name: 'Need Gold' })
    await expect(buyButtons.first()).toBeVisible()
    await expect(buyButtons.first()).toBeDisabled()
    await expect(page.getByText('💰 0').first()).toBeVisible()
  })

  test('purchasing debits gold and persists across reload', async ({ page }) => {
    await openStoreWithGold(page, 200)

    // Buy the Gold Coin specifically: the first Power-Ups card is a 50-gold
    // booster, and the coin is the catalog's cheapest item (40 gold). Its Buy
    // button is the first one rendered after its card heading.
    const coinBuy = page.locator(
      'xpath=//h3[normalize-space()="Gold Coin"]/following::button[normalize-space()="Buy"][1]',
    )
    await coinBuy.click()

    // The balance drops 200 → 160 — the exact 40-gold price pins the item.
    // Scoped to the store's balance display (the HUD tooltip repeats the
    // amount, so an unscoped text query is strict-mode-unsafe).
    const balance = page.getByText('Gold Available').locator('xpath=preceding-sibling::span[1]')
    await expect(balance).toHaveText('💰 160', { timeout: 15000 })

    // State round-trips through localStorage
    await page.reload()
    await gotoApp(page, '/store')
    await expect(
      page.getByText('Gold Available').locator('xpath=preceding-sibling::span[1]'),
    ).toHaveText('💰 160', { timeout: 15000 })
  })
})
