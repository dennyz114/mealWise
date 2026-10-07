import { expect, test } from '@playwright/test'
import { openEnglish } from './fixtures'

test('sign out', async ({ page }) => {
  await openEnglish(page, '/meals')
  await page.getByRole('banner').getByRole('button').click()
  await page.getByRole('menuitem', { name: 'Sign out' }).click()
  await expect(page).toHaveURL(/\/login/)
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
})
