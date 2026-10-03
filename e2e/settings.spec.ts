import { test, expect } from '@playwright/test'
import { seedGame, gotoApp } from './helpers'

/**
 * Settings round-trips: theme choice and the sound switch must survive a
 * reload. Theme is a radio group; sound is a real role="switch" whose
 * aria-checked state is the assertion target.
 */
test.describe('Settings persistence', () => {
  test('theme selection applies and persists across reload', async ({ page }) => {
    await seedGame(page, {})
    await gotoApp(page, '/settings')

    await expect(page.getByRole('heading', { level: 1, name: /Settings/ })).toBeVisible()

    const dark = page.getByRole('radio', { name: /Dark Mode/ })
    await dark.check()
    await expect(dark).toBeChecked()

    await page.reload()
    await gotoApp(page, '/settings')
    await expect(page.getByRole('radio', { name: /Dark Mode/ })).toBeChecked()
    // The resolved theme echoes the choice
    await expect(page.getByText(/Current:\s*dark/i)).toBeVisible()
  })

  test('the sound switch toggles and persists across reload', async ({ page }) => {
    await seedGame(page, {})
    await gotoApp(page, '/settings')

    const sound = page.getByRole('switch', { name: 'Sound effects' })
    // Fresh saves boot muted; whatever the initial state, the click must
    // invert it and the inversion must survive a reload.
    const initial = (await sound.getAttribute('aria-checked')) === 'true'
    await sound.click()
    await expect(sound).toHaveAttribute('aria-checked', initial ? 'false' : 'true', {
      timeout: 15000,
    })

    await page.reload()
    await gotoApp(page, '/settings')
    await expect(page.getByRole('switch', { name: 'Sound effects' })).toHaveAttribute(
      'aria-checked',
      initial ? 'false' : 'true',
      { timeout: 15000 },
    )
  })
})
