# MW-006 — Household Management

## Technical Details

### Overview

Household management enforces a "household-first" flow: authenticated users without a household see a setup gate instead of the main app. The gate offers create/join actions via bottom sheet (mobile) or modal (desktop). The `ProfileDropdown` is updated to show household status and the join code.

### Frontend

#### New Files

| File | Purpose |
|------|---------|
| `src/hooks/useHousehold.ts` | TanStack Query hook — fetches the current user's household. Returns `{ household, isLoading }`. Query key: `queryKeys.households(userId)`. |
| `src/lib/households.ts` | Supabase lib functions: `getHouseholdByUserId`, `createHousehold`, `joinHousehold`. |
| `src/components/household/HouseholdSetup.tsx` | The no-household gate screen. Displays centered card with "Create a household" and "Join a household" action buttons. Responsive: stacked on mobile, centered card on desktop. |
| `src/components/household/CreateHouseholdSheet.tsx` | Bottom sheet (mobile) / modal (desktop) for creating a household. Contains name input, auto-generated join code with copy button, and Create/Cancel buttons. |
| `src/components/household/JoinHouseholdSheet.tsx` | Bottom sheet (mobile) / modal (desktop) for joining a household. Contains masked code input (`XXX-XXX`), Join/Cancel buttons, and error display. |
| `src/components/ui/bottom-sheet.tsx` | Reusable bottom sheet component using Radix Dialog. Slides up from bottom on mobile, renders as centered modal on desktop (≥640px). |
| `src/components/ui/dialog.tsx` | Reusable dialog/modal wrapper around Radix Dialog, styled per the design system. |
| `src/utils/joinCode.ts` | Pure utility: `generateJoinCode()` (random alphanumeric `XXX-XXX`), `formatJoinCodeInput(raw: string): string` (auto-insert hyphen), `isValidJoinCode(code: string): boolean` (7 chars, matches `^[A-Z0-9]{3}-[A-Z0-9]{3}$`). |
| `src/types/household.ts` | Types: `Household`, `HouseholdMember`. |

#### Modified Files

| File | Changes |
|------|---------|
| `src/components/AppLayout.tsx` | Add household gate: fetch household via `useHousehold`. If `isLoading`, show skeleton. If no household, render `<HouseholdSetup />` instead of `<Outlet />` (header still visible, nav disabled). |
| `src/components/ProfileDropdown.tsx` | Accept household data as prop (or fetch internally). When no household: disable "My household" row (40% opacity), show amber "Setup needed" badge, open join sheet on click. When household exists: show join code, click-to-copy works with real code. |
| `src/components/Sidebar.tsx` | Dim/disabled state when no household (reduced opacity, no navigation). |
| `src/components/BottomTabBar.tsx` | Dim/disabled state when no household. |
| `src/lib/queryKeys.ts` | Add `household: (userId: string) => ['household', userId] as const` to the query keys object. |
| `src/types/index.ts` (or create `src/types/household.ts`) | Export `Household` and `HouseholdMember` types. |
| `src/locales/en.json` | Add household translation keys. |
| `src/locales/es.json` | Add household translation keys (Spanish). |
| `src/locales/fr.json` | Add household translation keys (French). |

### Backend / Supabase

No custom backend server — all data access is through the Supabase JS client. RLS policies enforce access control at the database level.

#### Supabase Lib Functions (`src/lib/households.ts`)

```ts
// Fetch household for the current user (via household_members join)
getHouseholdByUserId(userId: string): Promise<Household | null>

// Create a new household + add the creator as 'owner' member
// Join code generated client-side, uniqueness enforced by DB constraint
createHousehold(name: string, joinCode: string, userId: string): Promise<Household>

// Look up household by join_code, insert into household_members as 'member'
// Throws if code not found or user is already a member
joinHousehold(joinCode: string, userId: string): Promise<Household>
```

#### Supabase Query Shapes

**`getHouseholdByUserId`** — single query with join:
```ts
supabase
  .from('household_members')
  .select('household:households(id, name, join_code, created_by, created_at)')
  .eq('user_id', userId)
  .limit(1)
  .maybeSingle()
```

**`createHousehold`** — two sequential writes:
```ts
// 1. Insert household
const { data: household } = await supabase
  .from('households')
  .insert({ name, join_code: joinCode, created_by: userId })
  .select()
  .single()

// 2. Add owner as member
await supabase
  .from('household_members')
  .insert({ household_id: household.id, user_id: userId, role: 'owner' })
```

**`joinHousehold`** — lookup + insert:
```ts
// 1. Find household by code
const { data: household } = await supabase
  .from('households')
  .select('id')
  .eq('join_code', joinCode)
  .single()

// 2. Insert membership
await supabase
  .from('household_members')
  .insert({ household_id: household.id, user_id: userId, role: 'member' })
```

#### Required Database Policies (RLS)

The following RLS policies must exist (or be verified) for the feature to work:

| Table | Policy | Rule |
|-------|--------|------|
| `households` | SELECT | User is a member of the household (via `household_members`) |
| `households` | INSERT | Authenticated user (any user can create one household) |
| `household_members` | SELECT | User is a member of the household OR is inserting their own membership |
| `household_members` | INSERT | Authenticated user inserting their own `user_id` |

> Note: The `join_code` uniqueness constraint on `households` is assumed to exist per `DATABASE.md`. If not, it must be added.

---

## API Contracts

### Types (`src/types/household.ts`)

```ts
export type Household = {
  id: string
  name: string
  joinCode: string
  createdBy: string
  createdAt: string
}

export type HouseholdMember = {
  id: string
  householdId: string
  userId: string
  role: 'owner' | 'member'
  joinedAt: string
}
```

### Hook: `useHousehold`

```ts
// src/hooks/useHousehold.ts
type UseHouseholdReturn = {
  household: Household | null
  isLoading: boolean
  error: Error | null
}

export const useHousehold = (): UseHouseholdReturn
```

### Lib Functions (`src/lib/households.ts`)

```ts
export const getHouseholdByUserId = async (userId: string): Promise<Household | null>

export const createHousehold = async (
  name: string,
  joinCode: string,
  userId: string,
): Promise<Household>

export const joinHousehold = async (
  joinCode: string,
  userId: string,
): Promise<Household>
```

### Utility Functions (`src/utils/joinCode.ts`)

```ts
export const generateJoinCode = (): string  // e.g. "XK4-92T"
export const formatJoinCodeInput = (raw: string): string  // auto-insert hyphen
export const isValidJoinCode = (code: string): boolean    // /^[A-Z0-9]{3}-[A-Z0-9]{3}$/
```

### Query Keys (`src/lib/queryKeys.ts`)

```ts
household: (userId: string) => ['household', userId] as const,
```

### Mutation Patterns

**Create household:**
```ts
const createMutation = useMutation({
  mutationFn: ({ name, joinCode }: { name: string; joinCode: string }) =>
    createHousehold(name, joinCode, user.id),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.household(user.id) })
    navigate({ to: '/meals' })
  },
})
```

**Join household:**
```ts
const joinMutation = useMutation({
  mutationFn: ({ joinCode }: { joinCode: string }) =>
    joinHousehold(joinCode, user.id),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.household(user.id) })
    navigate({ to: '/meals' })
  },
  onError: (error: Error) => {
    setJoinError(error.message)
  },
})
```

### Component Props

**`HouseholdSetup`**
```ts
type HouseholdSetupProps = {
  user: AuthUser
}
```

**`CreateHouseholdSheet`**
```ts
type CreateHouseholdSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: AuthUser
}
```

**`JoinHouseholdSheet`**
```ts
type JoinHouseholdSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: AuthUser
}
```

**`ProfileDropdown` (updated)**
```ts
type ProfileDropdownProps = {
  user: AuthUser
  household: Household | null
  onSetupNeeded?: () => void  // opens join or setup flow
}
```

---

## Component Architecture

### HouseholdSetup Gate Flow

```
AppLayout
├── Header (always visible)
├── useHousehold() → { household, isLoading }
├── if isLoading → <Skeleton />
├── if no household → <HouseholdSetup user={user} />
│   ├── "Create a household" button → opens CreateHouseholdSheet
│   └── "Join a household" button → opens JoinHouseholdSheet
│       ├── CreateHouseholdSheet (bottom sheet / modal)
│       │   ├── Name input
│       │   ├── Join code display + copy
│       │   └── Create / Cancel buttons
│       └── JoinHouseholdSheet (bottom sheet / modal)
│           ├── Code input (masked)
│           └── Join / Cancel buttons
└── if household exists → <Outlet />
```

### Responsive Pattern

```tsx
// In AppLayout or the sheet components:
const { isDesktop } = useBreakpoint()

// Mobile: bottom sheet (Radix Dialog with bottom sheet styling)
// Desktop: centered modal (Radix Dialog with centered styling)
// Both use the same Radix Dialog primitive — just different CSS
```

### Bottom Sheet / Modal Reuse

The `ui/bottom-sheet.tsx` component wraps Radix Dialog and applies:
- Mobile: `rounded-t-[20px]` at bottom, slide-up animation
- Desktop (≥640px): centered, `rounded-[var(--radius-xl)]`, backdrop

This same pattern is used for both `CreateHouseholdSheet` and `JoinHouseholdSheet`.

---

## i18n Keys

Add to all locale files (`en.json`, `es.json`, `fr.json`):

```json
{
  "household": {
    "setupTitle": "Set up your household",
    "setupDescription": "Create a new household or join an existing one to get started.",
    "createTitle": "Create a household",
    "createSubtitle": "Give your household a name. You'll get a code to share with others.",
    "createNameLabel": "Household name",
    "createNamePlaceholder": "e.g. My Family",
    "createCodeHelper": "Share this code with anyone you want to invite. They can join from their profile.",
    "createButton": "Create household",
    "joinTitle": "Join a household",
    "joinSubtitle": "Ask the household owner for their code and enter it below.",
    "joinInputLabel": "Join code",
    "joinInputPlaceholder": "e.g. XK4-92T",
    "joinButton": "Join household",
    "cancel": "Cancel",
    "copyCode": "Copy code",
    "copied": "Copied!",
    "setupNeeded": "Setup needed",
    "myHousehold": "My household",
    "codeCopied": "Code copied!",
    "errorInvalidCode": "Invalid join code. Please check and try again.",
    "errorAlreadyMember": "You're already a member of this household.",
    "errorNameRequired": "Household name is required.",
    "errorGeneric": "Something went wrong. Please try again."
  }
}
```

---

## Essential Tests

### Frontend

#### Utility Tests (`src/utils/joinCode.test.ts`)

| Test | Input | Expected |
|------|-------|----------|
| Generates valid format | `generateJoinCode()` | Matches `/^[A-Z0-9]{3}-[A-Z0-9]{3}$/` |
| Formats input with auto-hyphen | `"XK492T"` | `"XK4-92T"` |
| Formats input preserving existing hyphen | `"XK4-92T"` | `"XK4-92T"` |
| Truncates excess characters | `"XK4-92T12"` | `"XK4-92T"` |
| Accepts valid code | `"XK4-92T"` | `true` |
| Rejects code without hyphen | `"XK492T"` | `false` |
| Rejects lowercase input | `"xk4-92t"` | `false` |
| Rejects too short | `"XK-92"` | `false` |
| Rejects too long | `"XK4-92T1"` | `false` |

#### Hook Tests (`src/hooks/useHousehold.test.ts`)

| Test | Scenario | Expected |
|------|----------|----------|
| Returns household when exists | User has a household membership | `household` is populated, `isLoading` is false |
| Returns null when no household | User has no membership | `household` is null, `isLoading` is false |
| Shows loading state | Initial fetch in progress | `isLoading` is true |
| Handles error gracefully | Network or Supabase error | `error` is set, `household` is null |

#### Component Tests

| Component | Test | Scenario |
|-----------|------|----------|
| `HouseholdSetup` | Renders both action buttons | Two buttons visible: "Create" and "Join" |
| `HouseholdSetup` | Opens create sheet on create click | `CreateHouseholdSheet` becomes visible |
| `HouseholdSetup` | Opens join sheet on join click | `JoinHouseholdSheet` becomes visible |
| `CreateHouseholdSheet` | Disables create button when name empty | Button has `disabled` attribute |
| `CreateHouseholdSheet` | Enables create button when name entered | Button enabled |
| `CreateHouseholdSheet` | Shows join code on open | Code is displayed and formatted |
| `CreateHouseholdSheet` | Copies code on copy button click | `navigator.clipboard.writeText` called |
| `CreateHouseholdSheet` | Calls create mutation on submit | `createHousehold` called with name + code |
| `CreateHouseholdSheet` | Shows error message on failure | Error text displayed |
| `JoinHouseholdSheet` | Disables join button when code incomplete | Button disabled for `< 7` chars |
| `JoinHouseholdSheet` | Enables join button when code is valid length | Button enabled at 7 chars |
| `JoinHouseholdSheet` | Auto-inserts hyphen in code input | Typing `"XK492"` → input shows `"XK4-9"` |
| `JoinHouseholdSheet` | Calls join mutation on submit | `joinHousehold` called with code |
| `JoinHouseholdSheet` | Shows error on invalid code | Error message displayed |
| `AppLayout` | Shows setup screen when no household | `HouseholdSetup` rendered instead of `Outlet` |
| `AppLayout` | Shows main content when household exists | `Outlet` rendered normally |
| `AppLayout` | Shows skeleton while loading | Skeleton/spinner visible |
| `ProfileDropdown` | Shows "Setup needed" badge when no household | Amber badge visible, row disabled |
| `ProfileDropdown` | Shows join code when household exists | Code displayed, copyable |
| `ProfileDropdown` | Copies code to clipboard on click | Clipboard API called |
| `Sidebar` | Dimmed when no household | Reduced opacity applied |
| `BottomTabBar` | Dimmed when no household | Reduced opacity applied |

### Backend (Supabase)

Since all data access is through the Supabase JS client and RLS handles security, backend tests focus on Supabase query correctness and edge cases.

| Test | Scenario | Expected |
|------|----------|----------|
| `getHouseholdByUserId` returns household | User is a member | Household object returned with correct fields |
| `getHouseholdByUserId` returns null | User has no membership | `null` returned |
| `createHousehold` creates household + membership | Valid name + unique code | Household created, user is `owner` member |
| `createHousehold` fails on duplicate code | Code already exists | Supabase error thrown (unique constraint) |
| `joinHousehold` adds membership | Valid code, user not already member | Membership created with role `member` |
| `joinHousehold` fails on invalid code | Code doesn't exist | Supabase error (no matching row) |
| `joinHousehold` fails if already member | User is already in household | Supabase error (duplicate membership) |
| RLS: user cannot read other households | User queries non-member household | Empty result / denied |
| RLS: user cannot add arbitrary membership | User inserts membership for another user | Denied |
| Join code uniqueness | Two households with same code | Second insert fails |

---

## Implementation Order

1. **Types & utilities** — `src/types/household.ts`, `src/utils/joinCode.ts`
2. **Supabase lib** — `src/lib/households.ts`
3. **Query keys** — update `src/lib/queryKeys.ts`
4. **Hook** — `src/hooks/useHousehold.ts`
5. **UI components** — `src/components/ui/dialog.tsx`, `src/components/ui/bottom-sheet.tsx`
6. **Household components** — `HouseholdSetup`, `CreateHouseholdSheet`, `JoinHouseholdSheet`
7. **Layout integration** — `AppLayout` gate, `Sidebar`/`BottomTabBar` disabled state
8. **ProfileDropdown update** — household-aware display
9. **i18n** — translation keys in all locales
10. **Tests** — utilities, hooks, components
