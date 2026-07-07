# MW-007 — Household Settings

## Technical Details

### Overview
Add a Settings page reachable from the profile dropdown. The page displays account info (read-only), household details (editable by owner), a member list with color-coded avatars, and a danger zone for close/leave household actions. Two new Supabase functions (getMembers, updateHouseholdName) and two new Supabase functions for close/leave are needed.

---

### Frontend

#### 1. New Route: `src/routes/_authenticated/settings.tsx`
- Path: `/settings`
- Uses `useAuth()` to get user, `useHousehold()` to get household
- Redirects to `/` if no household (edge case: user somehow reaches settings without one)
- Renders `SettingsPage` component
- Prefetches household members via `useQuery` with `queryKeys.householdMembers(householdId)`

#### 2. New Component: `src/components/settings/SettingsPage.tsx`
A single scrollable page with three sections:

**Account Section**
- Card with two rows: Name and Email
- Name: shows `user.displayName` (read-only, no edit button for now)
- Email: shows `user.email` (read-only)
- Each row has an icon on the left (user icon for name, mail icon for email)

**Household Section**
- Card with three rows:
  1. **Name row**: Shows `household.name`. Owner sees an "Edit" button that toggles inline editing (input + Save/Cancel). Max 50 characters enforced with `maxLength` and validation.
  2. **Join code row**: Shows `household.joinCode` in monospace. Copy button with checkmark feedback (same pattern as ProfileDropdown: icon swaps to `ti-check` for 1.5s).
- **Members subsection**: Section label "Members" + member count. Each member row shows:
  - Avatar with deterministic color (new `getAvatarColor()` utility)
  - Full name + email
  - Badges: "Owner" (if `role === 'owner'`), "You" (if `member.userId === user.id`)

**Danger Zone Section**
- Owner view: "Close household" with red styling, description, and button that opens `CloseHouseholdSheet`
- Member view: "Leave household" with red styling, description, and button that opens `LeaveHouseholdSheet`

#### 3. New Component: `src/components/settings/CloseHouseholdSheet.tsx`
- Uses `BottomSheet` component (consistent with existing pattern)
- Title: "Close household"
- Warning banner: red background, shows "This action cannot be undone. All X members will lose access immediately."
- Input field: "Type **[household name]** to confirm"
- Confirm button disabled until typed name exactly matches `household.name` (case-sensitive)
- `useMutation` calling `deleteHousehold(householdId, userId)`
- On success: invalidates `queryKeys.households(userId)`, navigates to `/`

#### 4. New Component: `src/components/settings/LeaveHouseholdSheet.tsx`
- Uses `BottomSheet` component
- Title: "Leave household"
- Description: "You'll lose access to shared menus and shopping lists. The household continues for other members."
- "Leave" and "Cancel" buttons
- `useMutation` calling `leaveHousehold(householdId, userId)`
- On success: invalidates `queryKeys.households(userId)`, navigates to `/`

#### 5. New Utility: `src/utils/avatar.ts`
Deterministic color mapping based on first letter of display name:

```ts
const AVATAR_COLORS = [
  { bg: '#FAECE7', text: '#712B13' },  // A-C: Coral
  { bg: '#EAF3DE', text: '#27500A' },  // D-F: Green
  { bg: '#FAEEDA', text: '#633806' },  // G-I: Amber
  { bg: '#E1F5EE', text: '#085041' },  // J-L: Teal
  { bg: '#E6F1FB', text: '#0C447C' },  // M-O: Blue
  { bg: '#EEEDFE', text: '#534AB7' },  // P-R: Purple
  { bg: '#FBEAF0', text: '#72243E' },  // S-U: Pink
  { bg: '#EEEDFE', text: '#534AB7' },  // V-Z: Dark Blue (accent)
]

export const getAvatarColor = (name: string): { bg: string; text: string } => {
  const first = name.charAt(0).toUpperCase()
  const code = first.charCodeAt(0)
  // A=65, C=67 → index 0; D=68, F=70 → index 1; etc.
  const index = Math.min(Math.floor((code - 65) / 3), AVATAR_COLORS.length - 1)
  // Handle non-alpha characters (map to last color)
  if (code < 65 || code > 90) return AVATAR_COLORS[AVATAR_COLORS.length - 1]
  return AVATAR_COLORS[index]
}
```

#### 6. Modified Component: `src/components/ProfileDropdown.tsx`
- Add `onSelect` handler to the Settings menu item to navigate to `/settings`
- Close the dropdown before navigating

#### 7. Modified Component: `src/components/Avatar.tsx`
- Extend to accept optional `color` prop: `{ bg: string; text: string }`
- When `color` is provided, use it as background and text color instead of the accent defaults
- Keep existing behavior as fallback when no `color` prop

#### 8. Modified Component: `src/components/household/CreateHouseholdSheet.tsx`
- Add `maxLength={50}` to the name input
- Add validation: show error if name exceeds 50 characters (unlikely with maxLength, but defensive)

---

### Backend / Supabase

#### 1. New Function in `src/lib/households.ts`: `getHouseholdMembers(householdId)`
Fetches all members of a household with their profile data:

```ts
export const getHouseholdMembers = async (
  householdId: string,
): Promise<HouseholdMemberWithProfile[]> => {
  const { data, error } = await supabase
    .from('household_members')
    .select(`
      id,
      household_id,
      user_id,
      role,
      joined_at,
      profile:profiles(display_name, email, avatar_url)
    `)
    .eq('household_id', householdId)

  if (error) throw error

  return data.map((row) => ({
    id: row.id,
    householdId: row.household_id,
    userId: row.user_id,
    role: row.role as 'owner' | 'member',
    joinedAt: row.joined_at,
    displayName: (row.profile as any)?.display_name ?? '',
    email: (row.profile as any)?.email ?? '',
    avatarUrl: (row.profile as any)?.avatar_url ?? '',
  }))
}
```

#### 2. New Function in `src/lib/households.ts`: `updateHouseholdName(householdId, name)`
Updates the household name (owner only, enforced by RLS):

```ts
export const updateHouseholdName = async (
  householdId: string,
  name: string,
): Promise<void> => {
  const { error } = await supabase
    .from('households')
    .update({ name })
    .eq('id', householdId)

  if (error) throw error
}
```

#### 3. New Function in `src/lib/households.ts`: `deleteHousehold(householdId, userId)`
Deletes the household and all members. Only the owner should be able to do this (RLS). Cascading deletes handle child records (menu_days, shopping_list_items, etc. via DB foreign keys):

```ts
export const deleteHousehold = async (
  householdId: string,
  userId: string,
): Promise<void> => {
  // Verify the user is the owner
  const { data: member, error: memberError } = await supabase
    .from('household_members')
    .select('role')
    .eq('household_id', householdId)
    .eq('user_id', userId)
    .single()

  if (memberError) throw memberError
  if (member?.role !== 'owner') throw new Error('Only the owner can close the household')

  // Delete all members first (RLS may not cascade)
  const { error: deleteMembersError } = await supabase
    .from('household_members')
    .delete()
    .eq('household_id', householdId)

  if (deleteMembersError) throw deleteMembersError

  // Delete the household
  const { error: deleteHouseholdError } = await supabase
    .from('households')
    .delete()
    .eq('id', householdId)

  if (deleteHouseholdError) throw deleteHouseholdError
}
```

#### 4. New Function in `src/lib/households.ts`: `leaveHousehold(householdId, userId)`
Removes the user from the household. If the user is the owner, ownership transfers to the next member:

```ts
export const leaveHousehold = async (
  householdId: string,
  userId: string,
): Promise<void> => {
  // Check if the user is the owner
  const { data: member, error: memberError } = await supabase
    .from('household_members')
    .select('role')
    .eq('household_id', householdId)
    .eq('user_id', userId)
    .single()

  if (memberError) throw memberError

  // If owner, transfer ownership to the next member
  if (member?.role === 'owner') {
    // Find the next member (by joined_at order)
    const { data: nextMember, error: nextError } = await supabase
      .from('household_members')
      .select('user_id')
      .eq('household_id', householdId)
      .neq('user_id', userId)
      .order('joined_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (nextError) throw nextError

    if (nextMember) {
      // Transfer ownership
      const { error: transferError } = await supabase
        .from('household_members')
        .update({ role: 'owner' })
        .eq('household_id', householdId)
        .eq('user_id', nextMember.user_id)

      if (transferError) throw transferError
    }
  }

  // Remove the user from the household
  const { error: deleteError } = await supabase
    .from('household_members')
    .delete()
    .eq('household_id', householdId)
    .eq('user_id', userId)

  if (deleteError) throw deleteError
}
```

#### 5. Type Update: `src/types/household.ts`
Add a new type for members with profile data:

```ts
export type HouseholdMemberWithProfile = HouseholdMember & {
  displayName: string
  email: string
  avatarUrl: string
}
```

Keep existing `HouseholdMember` type unchanged for backward compatibility.

#### 6. Query Key Addition: `src/lib/queryKeys.ts`
Add a new key for household members:

```ts
householdMembers: (householdId: string) => ['householdMembers', householdId] as const,
```

#### 7. DB Schema Note
The `profiles` table needs to have an `email` column. Checking the schema... the current schema shows `profiles` has `id`, `display_name`, `avatar_url`, `created_at` — no `email` column. However, the user's email comes from `auth.users` and is available via the Supabase auth session. Two options:
- **Option A**: Join with `auth.users` for email (requires service role or a view)
- **Option B**: Store email in `profiles` table (cleaner for queries)

**Recommendation**: Since we're using the `anon` key and can't access `auth.users` directly from the frontend, the email should come from the `auth.users` table. The cleanest approach is to store the email in `profiles` and keep it synced. For now, we can use the current user's email from `useAuth()` for the "You" row, and for other members we need to either:
1. Add an `email` column to `profiles` and populate it on first login
2. Or use a Supabase database view that joins `profiles` with `auth.users`

**Decision**: Add `email` column to `profiles` table. This is a simple migration and aligns with the existing pattern.

---

## API Contracts

### Supabase Queries

| Operation | Function | Query Shape |
|-----------|----------|-------------|
| Get members | `getHouseholdMembers(householdId)` | `supabase.from('household_members').select('..., profile:profiles(display_name, email, avatar_url)').eq('household_id', householdId)` |
| Update name | `updateHouseholdName(householdId, name)` | `supabase.from('households').update({ name }).eq('id', householdId)` |
| Delete household | `deleteHousehold(householdId, userId)` | Verify role → delete members → delete household |
| Leave household | `leaveHousehold(householdId, userId)` | Check role → optionally transfer ownership → delete membership |

### TanStack Query Keys

| Key | Parameters | Purpose |
|-----|------------|---------|
| `householdMembers(householdId)` | householdId: string | Cache for member list |
| `households(userId)` | userId: string | Already exists — invalidated after close/leave |

### Component Props

| Component | Props |
|-----------|-------|
| `SettingsPage` | None (uses hooks internally) |
| `CloseHouseholdSheet` | `{ open: boolean; onOpenChange: (open: boolean) => void; household: Household; memberCount: number }` |
| `LeaveHouseholdSheet` | `{ open: boolean; onOpenChange: (open: boolean) => void; household: Household }` |

---

## Essential Tests

### Frontend

| Test | File | Description |
|------|------|-------------|
| Settings page renders | `SettingsPage.test.tsx` | Renders account section, household section, and danger zone |
| Account section shows user info | `SettingsPage.test.tsx` | Displays user displayName and email (read-only) |
| Household name editable by owner | `SettingsPage.test.tsx` | Owner sees Edit button, can toggle inline edit |
| Household name not editable by member | `SettingsPage.test.tsx` | Member does NOT see Edit button |
| Join code copy works | `SettingsPage.test.tsx` | Clicking copy writes to clipboard, icon changes to checkmark |
| Member list renders | `SettingsPage.test.tsx` | All members shown with avatar, name, email, badges |
| Owner badge shown | `SettingsPage.test.tsx` | Member with role 'owner' gets "Owner" badge |
| You badge shown | `SettingsPage.test.tsx` | Current user gets "You" badge |
| Avatar colors deterministic | `avatar.test.ts` | Same first letter always produces same color |
| Close household sheet validation | `CloseHouseholdSheet.test.tsx` | Confirm button disabled until exact name match |
| Close household mutation | `CloseHouseholdSheet.test.tsx` | Calls deleteHousehold, invalidates query, navigates |
| Leave household sheet | `LeaveHouseholdSheet.test.tsx` | Shows confirmation, calls leaveHousehold, navigates |
| Close household owner-only | `CloseHouseholdSheet.test.tsx` | Error if non-owner somehow triggers |
| Name max length enforced | `CreateHouseholdSheet.test.tsx` | Input limited to 50 characters |
| ProfileDropdown navigates to settings | `ProfileDropdown.test.tsx` | Settings item navigates to /settings |

### Backend (Lib Functions)

| Test | File | Description |
|------|------|-------------|
| getHouseholdMembers returns members | `households.test.ts` | Returns array of members with profile data |
| getHouseholdMembers empty for no members | `households.test.ts` | Returns empty array |
| updateHouseholdName updates name | `households.test.ts` | Name changed in DB |
| updateHouseholdName throws on error | `households.test.ts` | Error propagated |
| deleteHousehold removes all | `households.test.ts` | Household and members deleted |
| deleteHousehold throws for non-owner | `households.test.ts` | Non-owner cannot delete |
| leaveHousehold removes membership | `households.test.ts` | User removed from household |
| leaveHousehold transfers ownership | `households.test.ts` | Owner leave → next member becomes owner |
| leaveHousehold last member leaves | `households.test.ts` | Household remains (empty) or gets cleaned up |
