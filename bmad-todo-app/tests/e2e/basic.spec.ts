import { test, expect } from '@playwright/test'

test.describe('Todo App - E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display the todo app', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Todo App')
    await expect(
      page.locator('input[placeholder="Enter a new todo..."]'),
    ).toBeVisible()
  })

  test('should create a new todo', async ({ page }) => {
    const input = page.locator('input[placeholder="Enter a new todo..."]')
    const addButton = page.locator('button:has-text("Add")')

    await input.fill('Buy groceries')
    await addButton.click()

    await expect(page.locator('text=Buy groceries')).toBeVisible()
  })

  test('should complete a todo', async ({ page }) => {
    const input = page.locator('input[placeholder="Enter a new todo..."]')
    const addButton = page.locator('button:has-text("Add")')

    await input.fill('Learn Playwright')
    await addButton.click()

    const checkbox = page.locator('input[type="checkbox"]').first()
    await checkbox.check()

    await expect(checkbox).toBeChecked()
    await expect(page.locator('text=Learn Playwright')).toHaveClass(
      /line-through/,
    )
  })

  test('should delete a todo', async ({ page }) => {
    const input = page.locator('input[placeholder="Enter a new todo..."]')
    const addButton = page.locator('button:has-text("Add")')

    await input.fill('Delete me')
    await addButton.click()

    await expect(page.locator('text=Delete me')).toBeVisible()

    const deleteButton = page.locator('button:has-text("Delete")').first()
    await deleteButton.click()

    await expect(page.locator('text=Delete me')).not.toBeVisible()
  })

  test('should show progress bar with completed todos', async ({ page }) => {
    const input = page.locator('input[placeholder="Enter a new todo..."]')
    const addButton = page.locator('button:has-text("Add")')

    // Create two todos
    await input.fill('Task 1')
    await addButton.click()
    await input.fill('Task 2')
    await addButton.click()

    // Complete one
    const checkbox = page.locator('input[type="checkbox"]').first()
    await checkbox.check()

    // Verify progress shows
    await expect(page.locator('text=1 of 2 completed')).toBeVisible()
  })

  test('should persist todos on page refresh', async ({ page }) => {
    const input = page.locator('input[placeholder="Enter a new todo..."]')
    const addButton = page.locator('button:has-text("Add")')

    await input.fill('Persistent todo')
    await addButton.click()

    await expect(page.locator('text=Persistent todo')).toBeVisible()

    // Refresh page
    await page.reload()

    // Todo should still be there
    await expect(page.locator('text=Persistent todo')).toBeVisible()
  })

  test('should handle empty input validation', async ({ page }) => {
    const addButton = page.locator('button:has-text("Add")')

    await addButton.click()

    await expect(page.locator('text=Title is required')).toBeVisible()
  })

  test('should be keyboard accessible', async ({ page }) => {
    const input = page.locator('input[placeholder="Enter a new todo..."]')
    const addButton = page.locator('button:has-text("Add")')

    // Focus on input
    await input.focus()
    await expect(input).toBeFocused()

    // Type and submit with Enter
    await input.type('Keyboard test')
    await page.keyboard.press('Enter')

    await expect(page.locator('text=Keyboard test')).toBeVisible()

    // Tab to checkbox and press Space to toggle
    const checkbox = page.locator('input[type="checkbox"]').first()
    await checkbox.focus()
    await page.keyboard.press('Space')

    await expect(checkbox).toBeChecked()
  })
})
