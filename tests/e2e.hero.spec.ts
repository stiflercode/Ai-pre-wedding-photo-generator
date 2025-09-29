import { test, expect } from '@playwright/test';

// Basic checks to ensure the hero renders and doesn't break core UI
// Runs in dev server context configured via playwright.config.ts

test.describe('HeroGeometric integration', () => {
  test('hero is present and upload section still visible', async ({ page }) => {
    await page.goto('/');
    // hero region exists
    await expect(page.locator('section[aria-label="hero"]')).toBeVisible();

    // The main header and core UI still render
    await expect(page.getByText('AI Pre-Wedding Photoshoot')).toBeVisible();

    // Upload cards section heading appears below hero
    await expect(page.getByText('Choose a style')).toBeVisible();
  });

  test('works with theme toggle', async ({ page }) => {
    await page.goto('/');
    // Theme toggle exists and can be toggled
    const toggle = page.getByRole('button', { name: /theme/i });
    if (await toggle.isVisible()) {
      await toggle.click();
    }
    // Hero should still be visible after theme change
    await expect(page.locator('section[aria-label="hero"]')).toBeVisible();
  });
});

