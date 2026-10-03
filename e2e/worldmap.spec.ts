import { test, expect } from '@playwright/test'
import { seedGame, gotoApp } from './helpers'

/**
 * World-map level gating. Realm nodes are buttons whose accessible name
 * starts with the realm emoji (locked nodes also carry a "Lv{n}" badge and a
 * hidden tooltip in their subtree, hence the anchored regexes). A realm above
 * the character's level renders disabled; an unlocked realm opens a modal
 * whose travel CTA only renders when the gate is met.
 * Level ladder (src/data/worldmap.ts): foundations 1, scripts 5, frameworks
 * 10, cloud 15, devops 20, aiintelligence 25.
 */
test.describe('World map gating', () => {
  test('a level-1 hero sees the home realm open and every higher realm locked', async ({
    page,
  }) => {
    await seedGame(page, {})
    await gotoApp(page, '/worldmap')

    await expect(page.getByRole('heading', { level: 1, name: 'Realm of DevOps' })).toBeVisible()

    await expect(page.getByRole('button', { name: /^🏘️/ })).toBeEnabled()
    for (const locked of ['🌲', '🏰', '⛰️', '🏛️', '🧠']) {
      await expect(page.getByRole('button', { name: new RegExp(`^${locked}`) })).toBeDisabled()
    }

    // Locked realms are invisible by design — only unlocked locations animate
    // in (WorldMapPage's animatedLocations effect) — so their level badge
    // stays hidden inside the disabled node.
    await expect(page.getByRole('button', { name: /^🌲/ }).getByText('Lv5')).toBeHidden()

    // The legend is the visible ladder (it renders after the map, so .last()
    // picks the legend row over the hidden node badges)
    await expect(page.getByText('Lv5').last()).toBeVisible()
    await expect(page.getByText('Lv25').last()).toBeVisible()
  })

  test('entering the home realm opens its modal and travels to the journal', async ({ page }) => {
    await seedGame(page, {})
    await gotoApp(page, '/worldmap')

    await page.getByRole('button', { name: /^🏘️/ }).click()
    await expect(
      page.getByRole('heading', { level: 2, name: 'Village of Foundations' }),
    ).toBeVisible()
    await expect(page.getByText('✓ Unlocked')).toBeVisible()

    await page.getByRole('button', { name: '⚔️ Enter Realm' }).click()
    await expect(page).toHaveURL(/\/quests$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Quest Journal' })).toBeVisible()
  })

  test('a higher realm unlocks once the level requirement is met', async ({ page }) => {
    await seedGame(page, { character: { level: 6, xp: 500 } })
    await gotoApp(page, '/worldmap')

    await expect(page.getByRole('button', { name: /^🌲/ })).toBeEnabled()
    await page.getByRole('button', { name: /^🌲/ }).click()

    // The modal is the only place these render: the realm heading, the
    // satisfied gate checkmark, and the travel CTA
    await expect(page.getByRole('heading', { level: 2, name: 'Forest of Scripts' })).toBeVisible()
    await expect(page.getByText('✓ Unlocked')).toBeVisible()
    await expect(page.getByRole('button', { name: '⚔️ Enter Realm' })).toBeVisible()
  })
})
