import { test, expect } from '@playwright/test'
import { TEST_EMAIL, TEST_PASSWORD } from './helpers'

test.describe('Authentication', () => {
  test('redirects unauthenticated users to /login', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
  })

  test('login page shows FlowBoard branding', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('Welcome back')).toBeVisible()
    await expect(page.getByText('Sign in to your FlowBoard account')).toBeVisible()
  })

  test('navigates to signup from login', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('link', { name: /create one free/i }).click()
    await expect(page).toHaveURL(/\/signup/)
    await expect(page.getByText('Create your account')).toBeVisible()
  })

  test('navigates back to login from signup', async ({ page }) => {
    await page.goto('/signup')
    await page.getByRole('link', { name: /sign in/i }).click()
    await expect(page).toHaveURL(/\/login/)
  })

  test('email validation shows error for missing @', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'notanemail')
    await page.locator('input[type="email"]').blur()
    await expect(page.getByText(/please enter a valid email/i)).toBeVisible()
  })

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'nobody@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 12_000 })
  })

  test('password visibility toggle works', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="password"]', 'secret123')
    const input = page.locator('input[id="login-password"]')
    await expect(input).toHaveAttribute('type', 'password')
    // Toggle visibility
    await page.getByRole('button', { name: /show password/i }).click()
    await expect(input).toHaveAttribute('type', 'text')
    // Toggle back
    await page.getByRole('button', { name: /hide password/i }).click()
    await expect(input).toHaveAttribute('type', 'password')
  })

  test('signup enforces password rules before enabling button', async ({ page }) => {
    await page.goto('/signup')
    const submitBtn = page.getByRole('button', { name: /create account/i })
    await expect(submitBtn).toBeDisabled()
    // Fill valid email
    await page.fill('input[type="email"]', 'new@test.com')
    // Fill weak password
    await page.fill('input[id="signup-password"]', 'weak')
    await expect(submitBtn).toBeDisabled()
  })

  test('signs in and reaches dashboard with valid credentials', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', TEST_EMAIL)
    await page.fill('input[type="password"]', TEST_PASSWORD)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/', { timeout: 20_000 })
  })

  test('user can sign out from avatar menu', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', TEST_EMAIL)
    await page.fill('input[type="password"]', TEST_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForURL('/', { timeout: 20_000 })
    // Open avatar dropdown
    await page.getByRole('button', { name: 'Open user menu' }).click()
    await page.getByRole('button', { name: /sign out/i }).click()
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
  })
})
