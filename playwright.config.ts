import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30 * 1000,
  expect: { timeout: 5000 },
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3002',
    headless: true,
    trace: 'on-first-retry',
    acceptDownloads: true,
  },
  fullyParallel: true,
  reporter: [['list']],
  webServer: {
    command: 'npx next dev --port 3002',
    port: 3002,
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});

