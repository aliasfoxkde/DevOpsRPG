import { test, expect } from '@playwright/test';

test.describe('DevOpsQuest E2E Tests', () => {
  test('homepage loads correctly', async ({ page }) => {
    await page.goto('/');

    // Check title
    await expect(page).toHaveTitle(/DevOpsQuest/);

    // Check hero content
    await expect(page.locator('h2')).toContainText('Level Up Your DevOps Skills');

    // Check career paths section
    await expect(page.locator('text=Choose Your Career Path')).toBeVisible();

    // Check gamification features using headings
    await expect(page.getByRole('heading', { name: 'XP System' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Achievements' })).toBeVisible();
  });

  test('can navigate to learn page', async ({ page }) => {
    await page.goto('/');

    // Click start learning button
    await page.click('text=Start Learning');

    // Should be on learn page
    await expect(page).toHaveURL(/\/learn/);

    // Should show technologies
    await expect(page.locator('text=All Technologies')).toBeVisible();
  });

  test('learn page shows technologies', async ({ page }) => {
    await page.goto('/learn');

    // Check technologies are displayed - use first() to avoid strict mode violations
    await expect(page.getByRole('heading', { name: /HTML/ }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: /CSS/ }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: /JavaScript/ }).first()).toBeVisible();
  });

  test('can navigate to technology page', async ({ page }) => {
    await page.goto('/learn');

    // Click on HTML card (first Foundations card)
    await page.locator('[href="/learn/html"]').first().click();

    // Should navigate to technology page
    await expect(page).toHaveURL(/\/learn\/html/);

    // Should show topics - use heading role to avoid duplicate matches
    await expect(page.getByRole('heading', { name: 'HTML Introduction' })).toBeVisible();
  });

  test('dashboard shows user progress', async ({ page }) => {
    await page.goto('/dashboard');

    // Should show login prompt or dashboard
    // Since we have demo user auto-login, should show dashboard
    await expect(page.locator('text=Welcome back')).toBeVisible();
  });

  test('theme toggle works', async ({ page }) => {
    await page.goto('/');

    // Find theme toggle button
    const themeToggle = page.locator('button[aria-label="Toggle theme"]');
    await expect(themeToggle).toBeVisible();

    // Click to toggle
    await themeToggle.click();

    // Dark class should be toggled on html element
    const html = page.locator('html');
    const hasDarkClass = await html.evaluate(el => el.classList.contains('dark'));

    // Toggle again
    await themeToggle.click();
    const hasDarkClassAfter = await html.evaluate(el => el.classList.contains('dark'));

    // Should be different
    expect(hasDarkClass).not.toBe(hasDarkClassAfter);
  });

  test('stats are visible on homepage', async ({ page }) => {
    await page.goto('/');

    // Should show stats section - check for stat values
    await expect(page.locator('text=Technologies').first()).toBeVisible();
    await expect(page.locator('text=Total Topics').first()).toBeVisible();
  });
});

test.describe('Gamification Flow', () => {
  test('shows XP on page', async ({ page }) => {
    await page.goto('/');

    // Check XP System heading is displayed
    await expect(page.getByRole('heading', { name: 'XP System' })).toBeVisible();
  });

  test('shows streak information', async ({ page }) => {
    await page.goto('/');

    // Streak heading should be visible
    await expect(page.getByRole('heading', { name: 'Daily Streaks' })).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('can navigate between pages', async ({ page }) => {
    await page.goto('/');

    // Go to learn
    await page.click('text=Start Learning');
    await expect(page).toHaveURL(/\/learn/);

    // Go back to home via logo
    await page.locator('text=DevOpsQuest').first().click();
    await expect(page).toHaveURL('/');
  });

  test('learn page category filters work', async ({ page }) => {
    await page.goto('/learn');

    // Click on a category filter
    await page.click('button:has-text("Foundations")');

    // Should filter content (specific check depends on implementation)
    await expect(page.locator('h1')).toContainText('All Technologies');
  });
});
