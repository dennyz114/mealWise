# Playwright happy-path tests

## Purpose

Add a Playwright suite that walks the shipped mealWise features in a real browser against the existing Supabase project. One happy path per feature. Auth is the only feature with two tests: sign in and sign out.

The suite is for local runs by a developer who has a dedicated test account. It is not a CI workflow.

## Constraints

- Chromium only, phone viewport `390×844`. That width is below the app breakpoint (`640`) and below Tailwind `md`, so the suite uses the bottom tabs and the mobile “New meal” button.
- Tests run one at a time, in a fixed order, sharing one signed-in test account.
- The account owns at most one household during a run. The app reads the user’s first household membership.
- Assertions for every test except language use English UI copy. The language test starts from the product default, Spanish.
- Login copy is already English in the form (`Email`, `Password`, `Sign in`) and is not translated.
- No retries.
- A missing `E2E_USER_EMAIL` or `E2E_USER_PASSWORD` stops the run before any browser test and names the missing variable.

## Out of scope

- Registration. Each run would create a real Supabase user.
- Joining a household by code. That needs a second account.
- The button component. It stays on Vitest.
- Assigning a meal on the planner, and checking or aggregating shopping items. Those screens only render a heading and “Coming soon.”
- GitHub Actions or any other CI job.
- `data-testid` attributes. Tests use roles, labels, and visible text. The profile control is the only button in the header.

## Architecture

`@playwright/test` starts `npm run dev` on port `5173` (`--strictPort`) and reuses a dev server that is already running. `workers` is `1` and `fullyParallel` is `false`.

| Piece | Responsibility |
|---|---|
| `playwright.config.ts` | Browser, viewport, web server, project order, trace on failure |
| `e2e/global-setup.ts` | Fail if credentials are missing. Delete this account’s household data. |
| `e2e/global-teardown.ts` | Same delete, including after a failed test |
| `e2e/cleanup.ts` | Shared delete used by setup and teardown |
| `e2e/auth.setup.ts` | Sign-in happy path. Saves `e2e/.auth/user.json` |
| `e2e/fixtures.ts` | `openEnglish(page, path)` sets `mealwise-locale` to `en` for that test only |
| `e2e/happy-paths.spec.ts` | Serial tests 2–9, using the saved session. Tests 2–8 call `openEnglish`. Test 9 does not |
| `e2e/sign-out.spec.ts` | Test 10. Depends on the happy-path project so it runs last |
| `.env.e2e.example` | Documents `E2E_USER_EMAIL` and `E2E_USER_PASSWORD` |
| `.gitignore` | Ignores `.env.e2e`, `e2e/.auth/`, `playwright-report/`, `test-results/` |

`npm run test:e2e` runs Playwright. `npm test` stays Vitest.

The app keeps reading `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from `.env`. Cleanup reads those same values plus the test-account password from `.env.e2e`. Nothing from either file is printed.

### Session and language

The setup project signs in through the login form and stores the session. Later projects load that `storageState`. The sign-in test sets `mealwise-locale` to `en` so it can assert the English heading, then removes that key before writing `e2e/.auth/user.json`. The saved session has no locale, so a fresh context still starts in Spanish.

Other tests set `mealwise-locale` to `en` with an init script that runs on each load of that test only. The language test does not use that script. The dark-mode test also writes `mealwise-theme` to `light` before toggling, so the click always turns the theme dark even when the machine prefers dark. That theme write is not an init script, so the reload still sees `dark`.

Dark mode and language are stored in the browser. Each of those tests reloads inside the same test. Meals and the household live in Supabase, so later tests see what earlier tests created.

### Cleanup

Cleanup signs in with `@supabase/supabase-js` using the anon key and the test account, then:

1. Loads `household_members` for that user.
2. If `role` is `owner`, deletes that `households` row. Foreign keys cascade members, meals, and related rows. This is the same delete the settings screen uses.
3. If `role` is `member`, deletes that membership row so the account is not stuck in someone else’s household.

This runs before tests and after the run. The UI tests do not close the household themselves.

### Failure behavior

`test.describe.serial` skips the remaining happy-path tests after the first failure. The sign-out project depends on the happy-path project, so it is skipped too. Global teardown still deletes the household. Traces are kept on failure.

## Tests

Names created by the suite are stable (`E2E Home`, `E2E Home 2`, `E2E Soup`, `Tomato`) because cleanup removes the household before the next run.

### 1. Sign in (`e2e/auth.setup.ts`)

Fill Email and Password from the env vars and submit Sign in. Success is the heading “Set up your household”. Remove `mealwise-locale` from localStorage, then save storage state.

### 2. Create household

Click “Create a household”. Fill the household name `E2E Home`. Submit “Create household”. Success is URL `/meals` and the heading “My meals”.

### 3. Rename household

Open the header profile button, then Settings. The page shows `E2E Home`. Click Edit, replace the name with `E2E Home 2`, click Save. The page shows `E2E Home 2`.

### 4. Create a meal

On My meals, click the button named “New meal”. Enter meal name `E2E Soup` and continue. In the ingredient search, type `Tomato` and choose `Add "Tomato" as new ingredient`. Set quantity to `2`. Leave unit `units` and category `Pantry`. Click “Add to meal”, then Next, then “Create meal”. Success shows “E2E Soup added”. Click “Back to meals”. The list shows `E2E Soup`.

### 5. Layout

From the bottom nav, open Planner, Shopping, and Meals. Each click lands on `/planner`, `/shopping`, and `/meals`.

### 6. Planner

Open Planner. The page shows the heading “Planner” and the text “Coming soon.”

### 7. Shopping

Open Shopping. The page shows the heading “Shopping” and the text “Coming soon.”

### 8. Dark mode

Set `mealwise-theme` to `light` and reload so the page starts light. Open the profile menu and click “Dark mode”. `document.documentElement` has `data-theme="dark"`. Reload. The attribute is still `dark`.

### 9. Language

This test does not force English. The meals tab reads “Comidas”. Open the profile menu, expand Language, and choose English. The tab reads “Meals”. Reload. The tab still reads “Meals”.

### 10. Sign out

Open the profile menu and click “Sign out”. Success is URL `/login` and a visible Sign in button.

## Prerequisites

The developer creates one Supabase user for this suite and puts its email and password in a gitignored `.env.e2e`. The user can sign in with email and password. The account does not need a household beforehand. Cleanup clears one if a previous run left it.

## Success criteria

`npm run test:e2e` passes against the local Vite app and the project’s Supabase database when `.env` and `.env.e2e` are present. After the run, the test account has no household membership.
