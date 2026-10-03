import { describe, expect, it } from 'vitest'
import { readEnvFile, requireEnv } from './env'

describe('readEnvFile', () => {
  it('reads keys, skips comments and blank lines, and unquotes values', () => {
    const parsed = readEnvFile(`
# comment
VITE_SUPABASE_URL=https://example.supabase.co

E2E_USER_EMAIL="cook@example.com"
E2E_USER_PASSWORD='s3cret'
`)
    expect(parsed).toEqual({
      VITE_SUPABASE_URL: 'https://example.supabase.co',
      E2E_USER_EMAIL: 'cook@example.com',
      E2E_USER_PASSWORD: 's3cret',
    })
  })
})

describe('requireEnv', () => {
  it('names every missing key and does not include other values', () => {
    const env = { VITE_SUPABASE_ANON_KEY: 'super-secret-key' }
    expect(() => requireEnv(env, ['E2E_USER_EMAIL', 'E2E_USER_PASSWORD'])).toThrow(
      'Missing E2E_USER_EMAIL, E2E_USER_PASSWORD',
    )
    try {
      requireEnv(env, ['E2E_USER_EMAIL'])
    } catch (error) {
      expect(String(error)).not.toContain('super-secret-key')
    }
  })

  it('returns the requested keys when they are present', () => {
    expect(requireEnv({ E2E_USER_EMAIL: 'a@b.c' }, ['E2E_USER_EMAIL'])).toEqual({
      E2E_USER_EMAIL: 'a@b.c',
    })
  })
})
