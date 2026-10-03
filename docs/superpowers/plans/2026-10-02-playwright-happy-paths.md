# Playwright Happy Paths Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a serial Chromium Playwright walkthrough that signs into a dedicated Supabase test account and covers one happy path per shipped feature.

**Architecture:** Pure helpers decide which household rows to delete and how to report missing env vars. A Supabase adapter runs that plan before and after the suite. Playwright then signs in through the login form, saves a session with no locale key, and runs the remaining happy paths in order against the real app.

**Tech Stack:** Playwright (`@playwright/test`), Chromium, Vitest, `@supabase/supabase-js`, the existing Vite dev server.

**Spec:** `docs/superpowers/specs/2026-10-02-playwright-happy-paths-design.md`

## Global Constraints

- Chromium only, viewport `390×844`.
- `workers` is `1` and `fullyParallel` is `false`.
- One dedicated test account. Cleanup deletes households it owns and memberships where it is only a member.
- Tests run in the spec’s order. `test.describe.serial` skips the rest after the first failure. Sign-out depends on the happy-path project, so it skips too. Global teardown still runs.
- No retries. Trace `retain-on-failure`.
- Login copy is the hardcoded English `Email`, `Password`, and `Sign in`.
- Tests 2–8 and sign-out call `openEnglish`. The language test does not.
- Sign-in sets `mealwise-locale` to `en` for its assertion, then removes that key before writing `e2e/.auth/user.json`.
- Dark mode writes `mealwise-theme` to `light` and reloads before the toggle. That write is not an init script.
- Stable names: `E2E Home`, `E2E Home 2`, `E2E Soup`, `Tomato`.
- `npm test` stays Vitest. `npm run test:e2e` runs Playwright.
- Do not print `.env` or `.env.e2e` values. Do not commit `.env.e2e`.
- No `data-testid`. No registration test. No join-by-code test. No CI workflow. Planner and shopping assert the heading and `Coming soon.` only.
- A missing required env var throws before any browser test and names every missing key.

## Review Focus

- Missing `E2E_USER_EMAIL` or `E2E_USER_PASSWORD` stops the run with those key names and does not include any other env value in the error.
- A cleanup sign-in or delete failure whose raw message contains the password throws an error that does not contain the password.
- An owned household is deleted. The membership row alone is not the only delete.
- A member-only membership is removed. That household row is not deleted.
- The language test’s first visible nav label is `Comidas`, so neither the saved session nor `openEnglish` may force English on that test.

---

## File structure

- `e2e/env.ts` — parse env file text, require keys, load `.env` then `.env.e2e`.
- `e2e/env.test.ts` — Vitest for parsing and missing keys.
- `e2e/errors.ts` — redact secret substrings from error text.
- `e2e/errors.test.ts` — Vitest for redaction.
- `e2e/memberships.ts` — turn memberships into delete actions.
- `e2e/memberships.test.ts` — Vitest for owner vs member.
- `e2e/cleanup.ts` — run the plan through an injected client; adapt a Supabase client.
- `e2e/cleanup.test.ts` — Vitest for the injected client, including redacted failures.
- `e2e/global-setup.ts` — load env and clear the account. Playwright global setup.
- `e2e/global-teardown.ts` — same clear.
- `e2e/fixtures.ts` — `openEnglish`.
- `e2e/auth.setup.ts` — sign-in test and storage state.
- `e2e/happy-paths.spec.ts` — serial tests 2–9.
- `e2e/sign-out.spec.ts` — test 10.
- `playwright.config.ts` — browser, server, projects.
- `.env.e2e.example` — empty credential keys.
- Modify `package.json` scripts and devDependencies.
- Modify `vite.config.ts` test include.
- Modify `.gitignore`.

App `tsconfig.json` stays `include: ["src"]`. Playwright compiles `e2e/` itself. Vitest picks up `e2e/**/*.test.ts` only.

## Task 1: Env parsing and household cleanup plan

**Files:**
- Create: `e2e/env.ts`
- Create: `e2e/env.test.ts`
- Create: `e2e/memberships.ts`
- Create: `e2e/memberships.test.ts`
- Modify: `vite.config.ts` (the `test.include` array)

**Interfaces:**
- Consumes: nothing
- Produces:
  - `readEnvFile(contents: string): Record<string, string>`
  - `requireEnv(env: Record<string, string | undefined>, keys: string[]): Record<string, string>`
  - `loadE2EEnv(cwd?: string): Record<string, string>` requiring `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `E2E_USER_EMAIL`, `E2E_USER_PASSWORD`
  - `Membership = { householdId: string; role: 'owner' | 'member' }`
  - `CleanupPlan = { householdIdsToDelete: string[]; membershipsToDelete: { householdId: string; userId: string }[] }`
  - `planHouseholdCleanup(userId: string, memberships: Membership[]): CleanupPlan`

- [ ] **Step 1: Write the failing tests**

Create `e2e/env.test.ts`:

```ts
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
```

Create `e2e/memberships.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { planHouseholdCleanup } from './memberships'

describe('planHouseholdCleanup', () => {
  it('deletes a household the account owns', () => {
    expect(
      planHouseholdCleanup('user-1', [{ householdId: 'home-1', role: 'owner' }]),
    ).toEqual({
      householdIdsToDelete: ['home-1'],
      membershipsToDelete: [],
    })
  })

  it('removes a member-only membership and does not delete that household', () => {
    expect(
      planHouseholdCleanup('user-1', [{ householdId: 'home-2', role: 'member' }]),
    ).toEqual({
      householdIdsToDelete: [],
      membershipsToDelete: [{ householdId: 'home-2', userId: 'user-1' }],
    })
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- e2e/env.test.ts e2e/memberships.test.ts`

Expected: FAIL because the modules do not exist. If Vitest ignores `e2e/`, add `'e2e/**/*.test.ts'` to `test.include` in `vite.config.ts` first and run again. The assertions must still fail until Step 3.

- [ ] **Step 3: Write the implementation**

`vite.config.ts` `test` block:

```ts
  test: {
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'e2e/**/*.test.ts'],
    environment: 'happy-dom',
    setupFiles: ['./src/test-setup.ts'],
  },
```

`e2e/env.ts`:

```ts
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
```

`e2e/memberships.ts`:

```ts
export type Membership = {
  householdId: string
  role: 'owner' | 'member'
}

export type CleanupPlan = {
  householdIdsToDelete: string[]
  membershipsToDelete: { householdId: string; userId: string }[]
}

export function planHouseholdCleanup(
  userId: string,
  memberships: Membership[],
): CleanupPlan {
  const householdIdsToDelete: string[] = []
  const membershipsToDelete: { householdId: string; userId: string }[] = []
  for (const membership of memberships) {
    if (membership.role === 'owner') {
      householdIdsToDelete.push(membership.householdId)
    } else {
      membershipsToDelete.push({ householdId: membership.householdId, userId })
    }
  }
  return { householdIdsToDelete, membershipsToDelete }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- e2e/env.test.ts e2e/memberships.test.ts`

Expected: PASS. Then run `npm test` and expect the existing suite to pass too.

- [ ] **Step 5: Commit**

```bash
git add e2e/env.ts e2e/env.test.ts e2e/memberships.ts e2e/memberships.test.ts vite.config.ts
git commit -m "$(cat <<'EOF'
Add pure helpers for e2e env checks and household cleanup.

EOF
)"
```

## Task 2: Run cleanup through a client

**Files:**
- Create: `e2e/errors.ts`
- Create: `e2e/errors.test.ts`
- Create: `e2e/cleanup.ts`
- Create: `e2e/cleanup.test.ts`
- Create: `e2e/global-setup.ts`
- Create: `e2e/global-teardown.ts`

**Interfaces:**
- Consumes: `loadE2EEnv`, `planHouseholdCleanup`, `Membership` from Task 1
- Produces:
  - `redactSecrets(message: string, secrets: string[]): string`
  - `CleanupClient` with `signIn`, `listMemberships`, `deleteHousehold`, `deleteMembership`
  - `clearAccountHouseholds(client: CleanupClient, email: string, password: string): Promise<void>`
  - `createSupabaseCleanupClient(supabase: SupabaseClient): CleanupClient`
  - default exports of `e2e/global-setup.ts` and `e2e/global-teardown.ts`

- [ ] **Step 1: Write the failing tests**

`e2e/errors.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { redactSecrets } from './errors'

describe('redactSecrets', () => {
  it('replaces each secret and leaves the rest of the message', () => {
    expect(redactSecrets('sign-in failed for p@ss word', ['p@ss'])).toBe(
      'sign-in failed for [redacted] word',
    )
  })
})
```

`e2e/cleanup.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest'
import { clearAccountHouseholds, type CleanupClient } from './cleanup'

const password = 'p@ss-should-not-leak'

function client(overrides: Partial<CleanupClient> = {}): CleanupClient {
  return {
    signIn: vi.fn(async () => ({ userId: 'user-1' })),
    listMemberships: vi.fn(async () => []),
    deleteHousehold: vi.fn(async () => undefined),
    deleteMembership: vi.fn(async () => undefined),
    ...overrides,
  }
}

describe('clearAccountHouseholds', () => {
  it('deletes an owned household and does not delete that membership', async () => {
    const fake = client({
      listMemberships: vi.fn(async () => [{ householdId: 'home-1', role: 'owner' as const }]),
    })
    await clearAccountHouseholds(fake, 'cook@example.com', password)
    expect(fake.deleteHousehold).toHaveBeenCalledWith('home-1')
    expect(fake.deleteMembership).not.toHaveBeenCalled()
  })

  it('deletes a member membership and does not delete that household', async () => {
    const fake = client({
      listMemberships: vi.fn(async () => [{ householdId: 'home-2', role: 'member' as const }]),
    })
    await clearAccountHouseholds(fake, 'cook@example.com', password)
    expect(fake.deleteMembership).toHaveBeenCalledWith('home-2', 'user-1')
    expect(fake.deleteHousehold).not.toHaveBeenCalled()
  })

  it('redacts the password when sign-in fails', async () => {
    const fake = client({
      signIn: vi.fn(async () => ({ error: `bad password ${password}` })),
    })
    await expect(clearAccountHouseholds(fake, 'cook@example.com', password)).rejects.toThrow(
      /Test account sign-in failed/,
    )
    await expect(clearAccountHouseholds(fake, 'cook@example.com', password)).rejects.toThrow(
      /\[redacted\]/,
    )
    try {
      await clearAccountHouseholds(fake, 'cook@example.com', password)
    } catch (error) {
      expect(String(error)).not.toContain(password)
    }
  })

  it('redacts the password when a delete fails', async () => {
    const fake = client({
      listMemberships: vi.fn(async () => [{ householdId: 'home-1', role: 'owner' as const }]),
      deleteHousehold: vi.fn(async () => {
        throw new Error(`delete failed ${password}`)
      }),
    })
    await expect(clearAccountHouseholds(fake, 'cook@example.com', password)).rejects.toThrow(
      /Failed to delete household home-1/,
    )
    try {
      await clearAccountHouseholds(fake, 'cook@example.com', password)
    } catch (error) {
      expect(String(error)).not.toContain(password)
    }
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- e2e/errors.test.ts e2e/cleanup.test.ts`

Expected: FAIL because the modules do not exist.

- [ ] **Step 3: Write the implementation**

`e2e/errors.ts`:

```ts
export function redactSecrets(message: string, secrets: string[]): string {
  return secrets.reduce((text, secret) => {
    if (!secret) return text
    return text.split(secret).join('[redacted]')
  }, message)
}
```

`e2e/cleanup.ts`:

```ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { redactSecrets } from './errors'
import { planHouseholdCleanup, type Membership } from './memberships'

export type CleanupClient = {
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ userId: string } | { error: string }>
  listMemberships: (userId: string) => Promise<Membership[]>
  deleteHousehold: (householdId: string) => Promise<void>
  deleteMembership: (householdId: string, userId: string) => Promise<void>
}

export async function clearAccountHouseholds(
  client: CleanupClient,
  email: string,
  password: string,
): Promise<void> {
  const signedIn = await client.signIn(email, password)
  if ('error' in signedIn) {
    throw new Error(
      redactSecrets(`Test account sign-in failed for household cleanup: ${signedIn.error}`, [
        password,
        email,
      ]),
    )
  }

  const memberships = await client.listMemberships(signedIn.userId)
  const plan = planHouseholdCleanup(signedIn.userId, memberships)

  for (const householdId of plan.householdIdsToDelete) {
    try {
      await client.deleteHousehold(householdId)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error'
      throw new Error(
        redactSecrets(`Failed to delete household ${householdId}: ${message}`, [password, email]),
      )
    }
  }

  for (const membership of plan.membershipsToDelete) {
    try {
      await client.deleteMembership(membership.householdId, membership.userId)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error'
      throw new Error(
        redactSecrets(
          `Failed to delete membership ${membership.householdId}: ${message}`,
          [password, email],
        ),
      )
    }
  }
}

export function createSupabaseCleanupClient(supabase: SupabaseClient): CleanupClient {
  return {
    async signIn(email, password) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error || !data.user) return { error: error?.message ?? 'No user returned' }
      return { userId: data.user.id }
    },
    async listMemberships(userId) {
      const { data, error } = await supabase
        .from('household_members')
        .select('household_id, role')
        .eq('user_id', userId)
      if (error) throw new Error(error.message)
      return (data ?? []).map((row) => ({
        householdId: String(row.household_id),
        role: row.role === 'owner' ? 'owner' : 'member',
      }))
    },
    async deleteHousehold(householdId) {
      const { error } = await supabase.from('households').delete().eq('id', householdId)
      if (error) throw new Error(error.message)
    },
    async deleteMembership(householdId, userId) {
      const { error } = await supabase
        .from('household_members')
        .delete()
        .eq('household_id', householdId)
        .eq('user_id', userId)
      if (error) throw new Error(error.message)
    },
  }
}

export async function resetTestAccount(): Promise<void> {
  const { loadE2EEnv } = await import('./env')
  const env = loadE2EEnv()
  const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)
  await clearAccountHouseholds(
    createSupabaseCleanupClient(supabase),
    env.E2E_USER_EMAIL,
    env.E2E_USER_PASSWORD,
  )
}
```

`e2e/global-setup.ts`:

```ts
import { resetTestAccount } from './cleanup'

export default async function globalSetup(): Promise<void> {
  await resetTestAccount()
}
```

`e2e/global-teardown.ts`:

```ts
import { resetTestAccount } from './cleanup'

export default async function globalTeardown(): Promise<void> {
  await resetTestAccount()
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- e2e/errors.test.ts e2e/cleanup.test.ts e2e/env.test.ts e2e/memberships.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add e2e/errors.ts e2e/errors.test.ts e2e/cleanup.ts e2e/cleanup.test.ts e2e/global-setup.ts e2e/global-teardown.ts
git commit -m "$(cat <<'EOF'
Clear the e2e account's households without leaking its password.

EOF
)"
```

## Task 3: Playwright project scaffold

**Files:**
- Create: `playwright.config.ts`
- Create: `.env.e2e.example`
- Modify: `package.json` (`scripts` and `devDependencies`)
- Modify: `.gitignore`

**Interfaces:**
- Consumes: `e2e/global-setup.ts` and `e2e/global-teardown.ts` default exports
- Produces: `npm run test:e2e`, projects `setup`, `happy-paths`, and `sign-out`

- [ ] **Step 1: Install Playwright**

Run: `npm install -D @playwright/test && npx playwright install chromium`

Expected: `@playwright/test` is in `devDependencies` and the Chromium binary downloads.

- [ ] **Step 2: Add the config, script, example env, and gitignore entries**

`playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  globalSetup: './e2e/global-setup.ts',
  globalTeardown: './e2e/global-teardown.ts',
  use: {
    baseURL: 'http://127.0.0.1:5173',
    viewport: { width: 390, height: 844 },
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --port 5173 --strictPort',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'happy-paths',
      testMatch: /happy-paths\.spec\.ts/,
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], storageState: 'e2e/.auth/user.json', viewport: { width: 390, height: 844 } },
    },
    {
      name: 'sign-out',
      testMatch: /sign-out\.spec\.ts/,
      dependencies: ['happy-paths'],
      use: { ...devices['Desktop Chrome'], storageState: 'e2e/.auth/user.json', viewport: { width: 390, height: 844 } },
    },
  ],
})
```

Do not spread `devices['Desktop Chrome']` in a way that overrides the phone viewport. Set `viewport` after the device spread, as above. The setup project inherits the root `use` viewport and does not load storage state.

Add to `package.json` scripts:

```json
"test:e2e": "playwright test"
```

`.env.e2e.example`:

```
E2E_USER_EMAIL=
E2E_USER_PASSWORD=
```

Append to `.gitignore`:

```
.env.e2e
e2e/.auth/
playwright-report/
test-results/
```

- [ ] **Step 3: Confirm the runner starts**

Run: `npx playwright test --list`

Expected: FAIL from global setup with `Missing E2E_USER_EMAIL, E2E_USER_PASSWORD` when `.env.e2e` is absent and `.env` already has the Supabase URL and anon key. That means the config loaded. Do not create `.env.e2e` in this task.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json playwright.config.ts .env.e2e.example .gitignore
git commit -m "$(cat <<'EOF'
Add the Playwright runner for serial happy-path tests.

EOF
)"
```

## Task 4: Sign-in setup

**Files:**
- Create: `e2e/auth.setup.ts`

**Interfaces:**
- Consumes: `loadE2EEnv()` from `e2e/env.ts`
- Produces: `e2e/.auth/user.json` with a session and without `mealwise-locale`

- [ ] **Step 1: Require a local credential file**

If `.env.e2e` is missing or its email or password is empty, stop and ask the user to create it from `.env.e2e.example`. Do not invent a user. Do not print the password. Do not commit the file.

- [ ] **Step 2: Write the sign-in test**

`e2e/auth.setup.ts`:

```ts
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
```

- [ ] **Step 3: Run the sign-in project**

Run: `npx playwright test --project=setup`

Expected: PASS, and the heading is the English setup title. The dev server may already be running on port 5173; the config reuses it. If port 5173 is taken by something else, stop that process and run again.

- [ ] **Step 4: Commit**

```bash
git add e2e/auth.setup.ts
git commit -m "$(cat <<'EOF'
Sign in the e2e account and save a session without a locale.

EOF
)"
```

## Task 5: Serial happy paths

**Files:**
- Create: `e2e/fixtures.ts`
- Create: `e2e/happy-paths.spec.ts`

**Interfaces:**
- Consumes: storage state from Task 4, `openEnglish(page, path)`
- Produces: tests 2–9 in one `test.describe.serial` block

- [ ] **Step 1: Write the English helper**

`e2e/fixtures.ts`:

```ts
import type { Page } from '@playwright/test'

export async function openEnglish(page: Page, path: string): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem('mealwise-locale', 'en')
  })
  await page.goto(path)
}
```

- [ ] **Step 2: Write the serial spec**

`e2e/happy-paths.spec.ts`:

```ts
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
    await expect(page.getByRole('navigation').getByRole('link', { name: 'Meals' })).toBeVisible()
    await page.reload()
    await expect(page.getByRole('navigation').getByRole('link', { name: 'Meals' })).toBeVisible()
  })
})
```

- [ ] **Step 3: Run the happy-path project**

Run: `npx playwright test --project=happy-paths`

Expected: PASS, including the setup dependency. The first language assertion is `Comidas`. If a selector does not match the live UI, fix the locator in this file. Do not add `data-testid`.

- [ ] **Step 4: Commit**

```bash
git add e2e/fixtures.ts e2e/happy-paths.spec.ts
git commit -m "$(cat <<'EOF'
Cover household, meal, nav, theme, and language happy paths.

EOF
)"
```

## Task 6: Sign out

**Files:**
- Create: `e2e/sign-out.spec.ts`

**Interfaces:**
- Consumes: `openEnglish` from `e2e/fixtures.ts`, storage state from Task 4, household left by Task 5

- [ ] **Step 1: Write the sign-out test**

`e2e/sign-out.spec.ts`:

```ts
import { expect, test } from '@playwright/test'
import { openEnglish } from './fixtures'

test('sign out', async ({ page }) => {
  await openEnglish(page, '/meals')
  await page.getByRole('banner').getByRole('button').click()
  await page.getByRole('menuitem', { name: 'Sign out' }).click()
  await expect(page).toHaveURL(/\/login/)
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
})
```

- [ ] **Step 2: Run the full suite**

Run: `npm run test:e2e`

Expected: PASS. Global teardown leaves the test account with no household membership. Then run `npm test` and expect the Vitest suite, including the new `e2e/*.test.ts` files, to pass.

- [ ] **Step 3: Commit**

```bash
git add e2e/sign-out.spec.ts
git commit -m "$(cat <<'EOF'
Sign out at the end of the e2e happy-path walkthrough.

EOF
)"
```
