import { test, expect } from '@playwright/test';

test.describe('AI Pre-Wedding App', () => {
  test('home page loads and core UI is present', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: /AI Pre[-\s]?Wedding Photoshoot/i })).toBeVisible();
    await expect(page.getByText(/Upload two photos, pick a style/i)).toBeVisible();

    // Upload cards
    await expect(page.getByText('Partner 1')).toBeVisible();
    await expect(page.getByText('Partner 2')).toBeVisible();

    // Generate disabled until selections
    const genBtn = page.getByRole('button', { name: /Generate My Photoshoot/i });
    await expect(genBtn).toBeDisabled();

    // Styles grid
    await expect(page.getByText('Choose a style')).toBeVisible();
    for (const name of [
      '90s Vintage Romance',
      'Lakeside Golden Hour',
      'Bollywood Stroll',
      'Intimate Indoor Braiding',
      'Retro Sunshine',
      'Fairytale Forest Dawn',
    ]) {
      await expect(page.getByText(name)).toBeVisible();
    }
  });
});

