import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export function readEnvFile(contents: string): Record<string, string> {
  const result: Record<string, string> = {}
  for (const line of contents.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    result[key] = value
  }
  return result
}

export function requireEnv(
  env: Record<string, string | undefined>,
  keys: string[],
): Record<string, string> {
  const missing = keys.filter((key) => !env[key])
  if (missing.length > 0) {
    throw new Error(`Missing ${missing.join(', ')}`)
  }
  const picked: Record<string, string> = {}
  for (const key of keys) {
    const value = env[key]
    if (!value) throw new Error(`Missing ${key}`)
    picked[key] = value
  }
  return picked
}

const REQUIRED_KEYS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'E2E_USER_EMAIL',
  'E2E_USER_PASSWORD',
] as const

export function loadE2EEnv(cwd = process.cwd()): Record<string, string> {
  const merged: Record<string, string> = {}
  for (const name of ['.env', '.env.e2e']) {
    const path = resolve(cwd, name)
    if (!existsSync(path)) continue
    Object.assign(merged, readEnvFile(readFileSync(path, 'utf8')))
  }
  return requireEnv(merged, [...REQUIRED_KEYS])
}
