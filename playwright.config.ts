import { defineConfig, devices } from '@playwright/test'

/**
 * FlowBoard E2E test configuration.
 *
 * Set credentials in .env.test (see .env.test.example) before running:
 *   PLAYWRIGHT_TEST_EMAIL=your@email.com
 *   PLAYWRIGHT_TEST_PASSWORD=YourPassword123!
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // Firebase auth can't handle parallel sessions reliably
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  timeout: 30_000,
  reporter: [['html', { open: 'never' }], ['list']],

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
