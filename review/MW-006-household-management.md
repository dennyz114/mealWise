# Review — MW-006 Household Management (Backend)

## Bugs
- **None found.** All functions handle errors correctly, early return where appropriate, and the Join code utility functions cover all edge cases.

## Duplicated Code
- **None found.** Each file has a single responsibility.

## Orphaned / Unused Code
- **None found.** All exports are used:
  - `src/types/household.ts` — `Household` is imported and used in `src/lib/households.ts`
  - `src/utils/joinCode.ts` — all 3 functions are testable and designed for frontend use
  - `src/lib/households.ts` — all 3 functions are exported for consumption

## Guideline Violations
- **None found.**
  - All functions use arrow functions (no `function` keyword) ✓
  - All functions return typed promises ✓
  - All Supabase responses check for errors before use ✓
  - No `any` types used ✓
  - Early return / guard clause pattern used ✓
  - `@/` path aliases used correctly ✓
  - camelCase for TypeScript properties, mapped from snake_case DB columns ✓
  - No `service_role` key usage ✓

## Missing Test Coverage
- **Covered (28 tests pass):**
  - `generateJoinCode`: validates format and uniqueness (2 tests)
  - `formatJoinCodeInput`: auto-hyphen, preserve hyphen, truncation, invalid chars, uppercase, empty, partial, 4th char (8 tests)
  - `isValidJoinCode`: valid, no hyphen, lowercase, too short, too long, empty, null/undefined, invalid chars, wrong hyphen position (9 tests)
  - `getHouseholdByUserId`: returns household, returns null, throws on error (3 tests)
  - `createHousehold`: creates household + membership, fails on duplicate code, fails on member insert (3 tests)
  - `joinHousehold`: joins with valid code, fails on invalid code, fails on duplicate membership (3 tests)

- **Not covered (database-level, cannot unit-test with mocks):**
  - RLS: user cannot read other households
  - RLS: user cannot add arbitrary membership for another user
  - Join code uniqueness constraint (covered implicitly by the duplicate code test on `createHousehold`)
  - These require integration tests against a real Supabase instance.

## Requirement Gaps
- **None found.** All requirements from the plan and feature doc are implemented:
  - Types defined with camelCase ✓
  - Join code utility: generate, format, validate ✓
  - Supabase lib: getHouseholdByUserId, createHousehold, joinHousehold ✓
  - Error handling in all functions ✓
  - queryKeys.ts already has the `households` key (verified) ✓
  - RLS policies documented in plan ✓

## Suggested Enhancements
1. **Consider a transaction for createHousehold** — currently two sequential writes. If the member insert fails after household creation, you'd have an orphan household. Supabase doesn't support transactions in the JS client without RPC/Edge Functions. This is acceptable for MVP but worth noting.
2. **Add environment variable validation** — consider adding a test that verifies the Supabase env vars are present (similar to the guard in `src/lib/supabase.ts`).
