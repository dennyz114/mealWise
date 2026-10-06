import type { Page } from '@playwright/test'

export async function openEnglish(page: Page, path: string): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem('mealwise-locale', 'en')
  })
  await page.goto(path)
}
