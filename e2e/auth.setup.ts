import { mkdirSync } from 'node:fs'
import { expect, test as setup } from '@playwright/test'
import { loadE2EEnv } from './env'

const authFile = 'e2e/.auth/user.json'

setup('sign in', async ({ page }) => {
  const env = loadE2EEnv()
  await page.addInitScript(() => {
    localStorage.setItem('mealwise-locale', 'en')
  })
  await page.goto('/login')
  await page.getByLabel('Email').fill(env.E2E_USER_EMAIL)
  await page.getByLabel('Password').fill(env.E2E_USER_PASSWORD)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByRole('heading', { name: 'Set up your household' })).toBeVisible()
  await page.evaluate(() => localStorage.removeItem('mealwise-locale'))
  mkdirSync('e2e/.auth', { recursive: true })
  await page.context().storageState({ path: authFile })
})
