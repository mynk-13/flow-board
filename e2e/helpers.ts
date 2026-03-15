import type { Page } from '@playwright/test'

export const TEST_EMAIL    = process.env.PLAYWRIGHT_TEST_EMAIL    ?? 'test@flowboard.dev'
export const TEST_PASSWORD = process.env.PLAYWRIGHT_TEST_PASSWORD ?? 'Test@1234!'

/** Signs in with the configured test account and waits for the dashboard. */
export async function login(page: Page) {
  await page.goto('/login')
  await page.fill('input[type="email"]', TEST_EMAIL)
  await page.fill('input[type="password"]', TEST_PASSWORD)
  await page.click('button[type="submit"]')
  await page.waitForURL('/', { timeout: 20_000 })
}
