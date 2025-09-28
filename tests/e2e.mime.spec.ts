import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3002';

// In DEMO_MODE the API returns SVG images. Verify the first result's download
// link has .svg extension and data:image/svg+xml prefix.
test.skip('DEMO_MODE: results use SVG data URLs and .svg filenames', async ({ page }) => {
  await page.goto(BASE_URL);

  // Upload two small images
  await page.locator('input[type=\"file\"]').first().setInputFiles({ name: 'a.png', mimeType: 'image/png', buffer: Buffer.alloc(1000) });
  await page.locator('input[type=\"file\"]').first().setInputFiles({ name: 'b.jpg', mimeType: 'image/jpeg', buffer: Buffer.alloc(1000) });

  // Select first style and generate
  await page.locator('[data-testid="style-card"]').first().click();
  await page.getByRole('button', { name: /Generate/i }).click();

  // Wait for gallery
  const cards = page.locator('[data-testid="result-card"]');
  await expect(cards).toHaveCount(10, { timeout: 30000 });

  // Check first download link
  const firstLink = cards.first().getByRole('link', { name: /^Download$/i });
  await expect(firstLink).toHaveAttribute('download', /\.svg$/i);
  const href = await firstLink.getAttribute('href');
  expect(href?.startsWith('data:image/svg+xml;base64,')).toBeTruthy();
});

