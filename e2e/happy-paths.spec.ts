import { expect, test } from '@playwright/test'
import { openEnglish } from './fixtures'

test.describe.serial('happy paths', () => {
  test('create a household', async ({ page }) => {
    await openEnglish(page, '/meals')
    await page.getByRole('button', { name: 'Create a household' }).click()
    const dialog = page.getByRole('dialog', { name: 'Create a household' })
    await dialog.getByLabel('Household name').fill('E2E Home')
    await dialog.getByRole('button', { name: 'Create household' }).click()
    await expect(page).toHaveURL(/\/meals/)
    await expect(page.getByRole('heading', { name: 'My meals' })).toBeVisible()
  })

  test('rename the household', async ({ page }) => {
    await openEnglish(page, '/meals')
    await page.getByRole('banner').getByRole('button').click()
    await page.getByRole('menuitem', { name: 'Settings' }).click()
    await expect(page.getByText('E2E Home', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Edit' }).click()
    await page.getByRole('textbox').fill('E2E Home 2')
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByText('E2E Home 2', { exact: true })).toBeVisible()
  })

  test('create a meal with one ingredient', async ({ page }) => {
    await openEnglish(page, '/meals')
    await page.getByRole('button', { name: 'New meal' }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByPlaceholder('e.g. Ají de gallina').fill('E2E Soup')
    await dialog.getByRole('button', { name: 'Continue' }).click()
    await dialog.getByPlaceholder('Search ingredients...').fill('Tomato')
    await dialog.getByRole('button', { name: 'Add "Tomato" as new ingredient' }).click()
    await dialog.getByRole('spinbutton').fill('2')
    await dialog.getByRole('button', { name: 'Add to meal' }).click()
    await dialog.getByRole('button', { name: 'Next' }).click()
    await dialog.getByRole('button', { name: 'Create meal' }).click()
    await expect(dialog.getByRole('heading', { name: 'E2E Soup added' })).toBeVisible()
    await dialog.getByRole('button', { name: 'Back to meals' }).click()
    await expect(page.getByRole('button', { name: /E2E Soup/ })).toBeVisible()
  })

  test('open meals, planner, and shopping from the nav', async ({ page }) => {
    await openEnglish(page, '/meals')
    const nav = page.getByRole('navigation')
    await nav.getByRole('link', { name: 'Planner' }).click()
    await expect(page).toHaveURL(/\/planner/)
    await nav.getByRole('link', { name: 'Shopping' }).click()
    await expect(page).toHaveURL(/\/shopping/)
    await nav.getByRole('link', { name: 'Meals' }).click()
    await expect(page).toHaveURL(/\/meals/)
  })

  test('planner page shows coming soon', async ({ page }) => {
    await openEnglish(page, '/planner')
    await expect(page.getByRole('heading', { name: 'Planner' })).toBeVisible()
    await expect(page.getByText('Coming soon.')).toBeVisible()
  })

  test('shopping page shows coming soon', async ({ page }) => {
    await openEnglish(page, '/shopping')
    await expect(page.getByRole('heading', { name: 'Shopping' })).toBeVisible()
    await expect(page.getByText('Coming soon.')).toBeVisible()
  })

  test('dark mode survives reload', async ({ page }) => {
    await openEnglish(page, '/meals')
    await page.evaluate(() => localStorage.setItem('mealwise-theme', 'light'))
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
    await page.getByRole('banner').getByRole('button').click()
    await page.getByRole('menuitem', { name: 'Dark mode' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  })

  test('switch language from Spanish to English', async ({ page }) => {
    await page.goto('/meals')
    await expect(page.getByRole('navigation').getByRole('link', { name: 'Comidas' })).toBeVisible()
    await page.getByRole('banner').getByRole('button').click()
    await page.getByRole('menuitem', { name: 'Idioma' }).click()
    await page.getByRole('button', { name: 'English' }).click()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('navigation').getByRole('link', { name: 'Meals' })).toBeVisible()
    await page.reload()
    await expect(page.getByRole('navigation').getByRole('link', { name: 'Meals' })).toBeVisible()
  })
})
