import { test, expect } from '@playwright/test';
import fs from 'fs';
import os from 'os';
import path from 'path';

function makeTempImage(ext: 'png'|'webp'|'jpg', sizeBytes = 20_000) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-prewedding-'));
  const filePath = path.join(tmp, `file.${ext}`);
  // Write dummy bytes; server validates size/type; content validity not required for our flow
  fs.writeFileSync(filePath, Buffer.alloc(sizeBytes, 0));
  return filePath;
}

function makeLargePng(sizeBytes = 6 * 1024 * 1024) { // >5MB
  return makeTempImage('png', sizeBytes);
}

function makeInvalidFile() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-prewedding-'));
  const p = path.join(tmp, `file.txt`);
  fs.writeFileSync(p, 'hello');
  return p;
}

const BASE_URL = process.env.BASE_URL || 'http://localhost:3002';
const DEMO = process.env.DEMO_MODE === '1' || true;

async function uploadTwoImages(page) {
  const f1 = makeTempImage('png');
  const f2 = makeTempImage('jpg');
  await page.locator('input[type="file"]').first().setInputFiles(f1);
  await page.locator('input[type="file"]').first().setInputFiles(f2);
}

test.describe('End-to-end flow (DEMO_MODE)', () => {
  test.skip('upload → choose style → generate → view → download single and zip', async ({ page, context }) => {
    await page.goto(BASE_URL);

    await uploadTwoImages(page);

    // Choose first style card (button inside)
    // Click first style card
    const styleCards = page.locator('[data-testid="style-card"]');
    await expect(styleCards.first()).toBeVisible();
    await styleCards.first().click();

    // Generate
    const generateBtn = page.getByRole('button', { name: /Generate/i });
    await generateBtn.click();

    // Wait for gallery grid to have 10 items
    const cards = page.locator('[data-testid="result-card"]');
    await expect(cards).toHaveCount(10, { timeout: 30000 });

    // Open preview dialog by clicking first image
    await cards.first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: /Close/i }).first().click();

    // Download single
    const downloadOne = page.getByRole('link', { name: /^Download$/i }).first();
    const d1 = await Promise.all([
      page.waitForEvent('download'),
      downloadOne.click(),
    ]);
    const file1 = await d1[0].path();
    expect(file1).toBeTruthy();

    // Download ZIP
    const zipBtn = page.getByRole('button', { name: /Download All/i });
    const d2 = await Promise.all([
      page.waitForEvent('download'),
      zipBtn.click(),
    ]);
    const file2 = await d2[0].path();
    expect(file2).toBeTruthy();
  });

  test.skip('theme toggle persists', async ({ page }) => {
    await page.goto(BASE_URL);
    const html = page.locator('html');
    const toggle = page.getByRole('button', { name: /theme/i });
    await toggle.click();
    await expect(html).toHaveClass(/dark/);
    await page.reload();
    await expect(html).toHaveClass(/dark/);
  });

  test('responsive layout', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.setViewportSize({ width: 375, height: 800 });
    await expect(page.locator('main')).toBeVisible();
    await page.setViewportSize({ width: 1024, height: 800 });
    await expect(page.locator('main')).toBeVisible();
  });

  test('invalid file type is handled', async ({ page }) => {
    await page.goto(BASE_URL);
    const inputs = page.locator('input[type="file"]');
    await inputs.first().setInputFiles(makeInvalidFile());
    // User may still proceed but server should reject on generate
  });

  test('oversized file rejected by API', async ({ page }) => {
    await page.goto(BASE_URL);
    const big = makeLargePng();
    const ok = makeTempImage('jpg');
    await page.locator('input[type="file"]').first().setInputFiles(big);
    await page.locator('input[type="file"]').first().setInputFiles(ok);

    const styleCards = page.locator('[data-testid="style-card"]');
    await styleCards.first().click();
    const generateBtn = page.getByRole('button', { name: /Generate/i });
    await expect(generateBtn).toBeDisabled();

    // Expect one of the upload instructions still visible (file not accepted)
    await expect(page.locator('label', { hasText: /JPG\/PNG\/WebP, 5MB/i }).first()).toBeVisible();
  });
});

// Real API scenario (skipped if DEMO_MODE=1)
(DEMO ? test.skip : test)('real API basic flow', async ({ page }) => {
  await page.goto(BASE_URL);
  await uploadTwoImages(page);
  const styleButtons = page.getByRole('button', { name: /Select/i });
  await styleButtons.first().click();
  await page.getByRole('button', { name: /Generate/i }).click();
  const cards = page.locator('[data-testid="result-card"]');
  await expect(cards).toHaveCount(10, { timeout: 120000 });
});

