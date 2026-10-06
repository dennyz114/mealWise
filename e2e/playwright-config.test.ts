import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('playwright config', () => {
  it('does not retain a trace for the sign-in project', () => {
    const source = readFileSync('playwright.config.ts', 'utf8')
    expect(source).toContain("name: 'setup', testMatch: /auth\\.setup\\.ts/, use: { trace: 'off' }")
  })
})
