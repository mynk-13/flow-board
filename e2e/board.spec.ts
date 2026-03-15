import { test, expect } from '@playwright/test'
import { login } from './helpers'

const UNIQUE = `E2E-${Date.now()}`

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('shows workspace name in header', async ({ page }) => {
    // The header shows the workspace name (email prefix + "'s Workspace")
    const header = page.locator('header').first()
    await expect(header).toBeVisible()
  })

  test('sidebar shows FlowBoard logo and nav items', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'FlowBoard' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible()
    await expect(page.getByRole('link', { name: /analytics/i })).toBeVisible()
  })

  test('command palette opens with Ctrl+K', async ({ page }) => {
    await page.keyboard.press('Control+k')
    await expect(page.getByRole('dialog', { name: /command palette/i })).toBeVisible()
  })

  test('command palette closes with Escape', async ({ page }) => {
    await page.keyboard.press('Control+k')
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 3_000 })
  })

  test('dark mode toggles the html.dark class', async ({ page }) => {
    const toggle = page.getByRole('button', { name: /switch to dark mode|switch to light mode/i })
    // Ensure we start in light mode
    const htmlEl = page.locator('html')
    const startDark = await htmlEl.evaluate((el) => el.classList.contains('dark'))
    await toggle.click()
    const afterDark = await htmlEl.evaluate((el) => el.classList.contains('dark'))
    expect(afterDark).toBe(!startDark)
    // Restore
    await toggle.click()
  })

  test('avatar menu shows email and sign out', async ({ page }) => {
    await page.getByRole('button', { name: 'Open user menu' }).click()
    await expect(page.getByText('Sign out')).toBeVisible()
    await expect(page.getByText('Settings')).toBeVisible()
  })

  test('sidebar collapse toggle works', async ({ page }) => {
    const collapseBtn = page.getByRole('button', { name: /collapse sidebar/i })
    await expect(collapseBtn).toBeVisible()
    await collapseBtn.click()
    // Sidebar should shrink — expand button now visible
    await expect(page.getByRole('button', { name: /expand sidebar/i })).toBeVisible()
    // Re-expand
    await page.getByRole('button', { name: /expand sidebar/i }).click()
    await expect(page.getByRole('button', { name: /collapse sidebar/i })).toBeVisible()
  })
})

test.describe('Project creation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('can create a new project', async ({ page }) => {
    // Click the + next to "Created by me"
    await page.getByRole('button', { name: 'New project' }).first().click()
    // Modal appears
    await expect(page.getByText('New Project')).toBeVisible()
    await page.fill('input[placeholder="Project name"]', UNIQUE)
    await page.getByRole('button', { name: 'Create' }).click()
    // Redirected to the board
    await expect(page).toHaveURL(/\/board\//, { timeout: 15_000 })
    await expect(page.getByText(UNIQUE)).toBeVisible()
  })
})

test.describe('Board & tasks', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    // Navigate to the first owned project if one exists
    const firstProject = page.locator('nav a[href^="/board/"]').first()
    const count = await firstProject.count()
    if (count > 0) {
      await firstProject.click()
      await page.waitForURL(/\/board\//)
    } else {
      // Create one on the fly
      await page.getByRole('button', { name: 'New project' }).first().click()
      await page.fill('input[placeholder="Project name"]', UNIQUE)
      await page.getByRole('button', { name: 'Create' }).click()
      await page.waitForURL(/\/board\//, { timeout: 15_000 })
    }
  })

  test('board shows 5 kanban columns', async ({ page }) => {
    await expect(page.getByText('Backlog')).toBeVisible()
    await expect(page.getByText('To Do')).toBeVisible()
    await expect(page.getByText('In Progress')).toBeVisible()
    await expect(page.getByText('In Review')).toBeVisible()
    await expect(page.getByText('Done')).toBeVisible()
  })

  test('inline task creation adds a card', async ({ page }) => {
    const title = `Task-${Date.now()}`
    // Click "Add task" in Backlog column
    await page.getByText('Add task').first().click()
    await page.getByPlaceholder('Task title…').fill(title)
    await page.keyboard.press('Enter')
    await expect(page.getByText(title)).toBeVisible({ timeout: 8_000 })
  })

  test('clicking a task card opens the detail modal', async ({ page }) => {
    // Create a task first
    const title = `Detail-${Date.now()}`
    await page.getByText('Add task').first().click()
    await page.getByPlaceholder('Task title…').fill(title)
    await page.keyboard.press('Enter')
    await expect(page.getByText(title)).toBeVisible({ timeout: 8_000 })
    // Click it
    await page.getByText(title).click()
    // Detail modal should open (has priority selector, description, etc.)
    await expect(page.getByText('Priority')).toBeVisible({ timeout: 5_000 })
  })

  test('task search filter narrows visible cards', async ({ page }) => {
    const unique = `Search-${Date.now()}`
    // Add a uniquely named task
    await page.getByText('Add task').first().click()
    await page.getByPlaceholder('Task title…').fill(unique)
    await page.keyboard.press('Enter')
    await expect(page.getByText(unique)).toBeVisible({ timeout: 8_000 })
    // Search for it
    await page.fill('input[placeholder="Search tasks…"]', unique)
    await expect(page.getByText(unique)).toBeVisible()
    // Search for something that matches nothing
    await page.fill('input[placeholder="Search tasks…"]', 'zzznomatch999')
    await expect(page.getByText(unique)).not.toBeVisible({ timeout: 3_000 })
  })
})
