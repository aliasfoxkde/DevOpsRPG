import { test, expect } from '@playwright/test'
import { seedGame, gotoApp } from './helpers'

/**
 * Route integrity for the pages the flow specs don't visit: each must render
 * its lazy-loaded page with a real heading and never land in the error
 * boundary. This is the broad net that catches blank-page/route-regression
 * classes; the flow specs cover the interactive depth elsewhere.
 *
 * Grouped rather than one-test-per-route to keep the 3-browser matrix
 * affordable on a shared host (see docs/planning/004 §7D).
 */
test.describe('Route integrity', () => {
  const ROUTES: Array<[path: string, heading: RegExp]> = [
    ['/character', /Character Sheet/],
    ['/badges', /Badge Collection/],
    ['/rewards', /Rewards Hub/],
    ['/skills', /Skill Tree/],
    ['/store', /Quest Shop/],
    ['/settings', /Settings/],
  ]

  for (const [path, heading] of ROUTES) {
    test(`renders ${path}`, async ({ page }) => {
      await seedGame(page, {})
      await gotoApp(page, path)
      await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible({
        timeout: 15000,
      })
      await expect(page.getByText('Something went wrong')).toHaveCount(0)
    })
  }

  test('the secondary pages all render without hitting the error boundary', async ({ page }) => {
    await seedGame(page, {})
    const secondaryRoutes = [
      '/profile',
      '/sidequests',
      '/challenges',
      '/leaderboard',
      '/milestones',
      '/games',
      '/analytics',
      '/titles-frames',
      '/seasonal-events',
      '/pvp-arena',
      '/social',
      '/guild',
      '/career-path',
      '/storylines',
      '/technology-collection',
      '/certifications',
      '/feedback',
      '/about',
      '/faq',
      '/privacy-policy',
    ]
    for (const path of secondaryRoutes) {
      await gotoApp(page, path)
      await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible({
        timeout: 15000,
      })
      await expect(page.getByText('Something went wrong')).toHaveCount(0)
    }
  })
})
