# MW-004 — Technical Plan: Application Layout

## Technical Details

### Overview
Build the global app shell: Header, Sidebar (desktop), BottomTabBar (mobile), and ProfileDropdown. The root route wraps all authenticated pages in this layout. The `640px` breakpoint is extracted as a global constant.

### Approach
1. **Global breakpoint constant** — Define `BREAKPOINT = 640` in `src/lib/constants.ts` so every responsive component references a single source of truth
2. **Layout component** — A `<AppLayout>` wrapper that conditionally renders Sidebar (≥ 640px) or BottomTabBar (< 640px), with Header always on top
3. **Profile dropdown** — Reuses the installed `@radix-ui/react-dropdown-menu` primitive, anchored to the avatar
4. **Sidebar state** — `useState` initialized from `localStorage`, persisted on toggle. Desktop-only.
5. **Remove ThemeToggle FAB** — The dark mode toggle moves into the ProfileDropdown; the floating FAB is removed
6. **Route stubs** — Create placeholder routes for `/meals`, `/planner`, `/shopping` so navigation links work

---

## Files to Create/Modify

### 1. `src/lib/constants.ts` — Global breakpoint + nav items
Create a constants file with:
- `BREAKPOINT = 640` (px)
- `NAV_ITEMS` array: `{ path, label, icon }` for Meals, Planner, Shopping
- `SIDEBAR_WIDTH_COLLAPSED = 48` (px)
- `SIDEBAR_WIDTH_EXPANDED = 148` (px)
- `SIDEBAR_STORAGE_KEY = 'mealwise-sidebar'`

```ts
export const BREAKPOINT = 640
export const SIDEBAR_WIDTH_COLLAPSED = 48
export const SIDEBAR_WIDTH_EXPANDED = 148
export const SIDEBAR_STORAGE_KEY = 'mealwise-sidebar'

export const NAV_ITEMS = [
  { path: '/meals', label: 'Meals', icon: 'ti-tools-kitchen-2' },
  { path: '/planner', label: 'Planner', icon: 'ti-calendar-week' },
  { path: '/shopping', label: 'Shopping', icon: 'ti-shopping-cart' },
] as const
```

### 2. `src/hooks/useBreakpoint.ts` — Media query hook
Custom hook that returns `isDesktop: boolean` based on `BREAKPOINT`. Uses `window.matchMedia` with a listener for live updates.

```ts
type UseBreakpointReturn = { isDesktop: boolean }

const useBreakpoint: () => UseBreakpointReturn
```

Logic:
- Initialize from `window.matchMedia(`(min-width: ${BREAKPOINT}px)`).matches`
- Listen for `change` events and update state
- Clean up listener on unmount

### 3. `src/hooks/useSidebar.ts` — Sidebar state hook
Custom hook managing collapsed/expanded state with localStorage persistence.

```ts
type UseSidebarReturn = {
  isExpanded: boolean
  toggle: () => void
}

const useSidebar: () => UseSidebarReturn
```

Logic:
- Initialize from `localStorage.getItem(SIDEBAR_STORAGE_KEY)`
- Default: collapsed (`false`)
- `toggle()` flips state and writes to localStorage

### 4. `src/components/Header.tsx` — Top bar
Fixed header with:
- Left: App icon (calendar) + "mealWise" text
- Right: User avatar (initial letter fallback)
- Avatar triggers ProfileDropdown
- Height: ~56px
- Background: `var(--color-bg-primary)`
- Border-bottom: `0.5px solid var(--color-border-default)`

Props: `{ onMenuToggle?: () => void }` — optional hamburger for mobile if needed later

### 5. `src/components/Avatar.tsx` — Reusable avatar
Renders user's profile image or first-letter fallback.
- Size prop: `'sm'` (32px, header) | `'md'` (40px, profile dropdown)
- Border-radius: `50%`
- Background: `var(--color-accent-subtle)`
- Text color: `var(--color-accent)`
- Accepts optional `className` for the accent ring state

```ts
type AvatarProps = {
  user: AuthUser
  size?: 'sm' | 'md'
  showRing?: boolean
  className?: string
}
```

### 6. `src/components/ProfileDropdown.tsx` — Profile menu
Uses `@radix-ui/react-dropdown-menu` (already installed):
- Trigger: Avatar component
- Content: floating panel with:
  - User info section (larger avatar + displayName + email)
  - "My household" row with join code badge + copy button
  - "Dark mode" toggle row (uses `useTheme()`)
  - "Settings" row (placeholder, non-functional)
  - "Sign out" row (calls `signOut()` from `@/lib/auth`)
- Desktop: anchored top-right of avatar, min-width ~280px
- Mobile: full-width minus horizontal margins
- Styled with CSS tokens: `var(--color-bg-primary)`, `var(--color-border-default)`, `var(--radius-lg)`

```ts
type ProfileDropdownProps = {
  user: AuthUser
  household?: { joinCode: string } | null
}
```

Key behaviors:
- Click outside closes the dropdown (Radix handles this)
- Accent ring on avatar when open (controlled via `onOpenChange`)
- Copy button on join code shows brief "Copied!" feedback

### 7. `src/components/Sidebar.tsx` — Desktop navigation
Vertical nav rail on the left side:
- Collapsed: 48px, icon-only
- Expanded: 148px, icon + label
- Toggle button at top (chevron icon)
- 3 nav items: Meals, Planner, Shopping
- Active item: purple background highlight (`var(--color-accent-subtle)`) + accent text
- Inactive item: `var(--color-text-secondary)` text, hover shows `var(--color-bg-secondary)`
- Uses `NavLink` from TanStack Router for active state detection
- Width transitions smoothly (CSS transition on `width`)

```ts
type SidebarProps = {
  isExpanded: boolean
  onToggle: () => void
}
```

### 8. `src/components/BottomTabBar.tsx` — Mobile navigation
Fixed bottom tab bar:
- 3 tabs: Meals, Planner, Shopping
- Each tab: icon (20px) + label (12px) below
- Active tab: purple underline indicator (`2px solid var(--color-accent)`) + accent text
- Inactive tab: `var(--color-text-tertiary)` text
- Height: ~60px
- Background: `var(--color-bg-primary)`
- Border-top: `0.5px solid var(--color-border-default)`
- Safe-area padding for iOS (`env(safe-area-inset-bottom)`)
- Uses `NavLink` from TanStack Router

```ts
type BottomTabBarProps = Record<string, never>
```

### 9. `src/components/AppLayout.tsx` — Layout orchestrator
The main layout wrapper that composes all pieces:

```tsx
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { isDesktop } = useBreakpoint()
  const sidebar = useSidebar()
  const { user, household } = useAuthData() // combined hook

  return (
    <div className="flex min-h-dvh flex-col">
      <Header user={user} />
      <div className="flex flex-1 pt-[56px]">
        {isDesktop && (
          <Sidebar isExpanded={sidebar.isExpanded} onToggle={sidebar.toggle} />
        )}
        <main className="flex-1">{children}</main>
      </div>
      {!isDesktop && <BottomTabBar />}
    </div>
  )
}
```

Key decisions:
- Header is fixed at top; content gets `pt-[56px]` to avoid overlap
- Sidebar only renders on desktop; BottomTabBar only on mobile
- Sidebar width shifts content via `ml-[48px]` or `ml-[148px]`
- Uses Tailwind responsive classes where possible, but conditional rendering for sidebar/tabs

### 10. `src/routes/__root.tsx` — Update root layout
Wrap the `<Outlet>` in `<AppLayout>` for authenticated routes. The login route should NOT use the app layout.

Two approaches:
- **Option A**: Wrap `<Outlet>` in `<AppLayout>` directly in `__root.tsx` (simpler, but login page also gets the layout — not ideal)
- **Option B**: Create a layout route `_authenticated.tsx` that wraps authenticated children in `<AppLayout>`, and keep `__root.tsx` minimal

**Recommendation: Option B** — cleaner separation:
- `__root.tsx` → `QueryClientProvider` + `Outlet` (no layout)
- `routes/_authenticated.tsx` → `<AppLayout>` + `<Outlet>` + auth guard
- `routes/_authenticated/meals.tsx`, `planner.tsx`, `shopping.tsx` → child pages

### 11. Route stubs — Placeholder pages
Create minimal route files so navigation works:

- `src/routes/_authenticated.tsx` — Layout route with auth guard + AppLayout
- `src/routes/_authenticated/meals.tsx` — "Meals" placeholder
- `src/routes/_authenticated/planner.tsx` — "Planner" placeholder
- `src/routes/_authenticated/shopping.tsx` — "Shopping" placeholder

### 12. Remove `src/components/ThemeToggle.tsx`
Delete the FAB component. The dark mode toggle is now in the ProfileDropdown.

### 13. Update `src/routes/__root.tsx`
Remove `<ThemeToggle />` import and render. Keep only `<QueryClientProvider>` + `<Outlet>`.

---

## API Contracts

### `useBreakpoint()` Hook
```ts
type UseBreakpointReturn = {
  isDesktop: boolean
}

const useBreakpoint: () => UseBreakpointReturn
```

### `useSidebar()` Hook
```ts
type UseSidebarReturn = {
  isExpanded: boolean
  toggle: () => void
}

const useSidebar: () => UseSidebarReturn
```

### `Avatar` Component
```ts
type AvatarProps = {
  user: AuthUser
  size?: 'sm' | 'md'
  showRing?: boolean
  className?: string
}

const Avatar: React.FC<AvatarProps> = (props) => JSX.Element
```

### `ProfileDropdown` Component
```ts
type ProfileDropdownProps = {
  user: AuthUser
  household?: { joinCode: string } | null
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = (props) => JSX.Element
```

### `Header` Component
```ts
type HeaderProps = Record<string, never>
// User data fetched internally via useAuth()
const Header: React.FC<HeaderProps> = () => JSX.Element
```

### `Sidebar` Component
```ts
type SidebarProps = {
  isExpanded: boolean
  onToggle: () => void
}

const Sidebar: React.FC<SidebarProps> = (props) => JSX.Element
```

### `BottomTabBar` Component
```ts
type BottomTabBarProps = Record<string, never>
const BottomTabBar: React.FC<BottomTabBarProps> = () => JSX.Element
```

### `AppLayout` Component
```ts
type AppLayoutProps = {
  children: React.ReactNode
}

const AppLayout: React.FC<AppLayoutProps> = (props) => JSX.Element
```

---

## Essential Tests

### Frontend

1. **Responsive Breakpoint**
   - At viewport < 640px: bottom tab bar is visible, sidebar is hidden
   - At viewport ≥ 640px: sidebar is visible, bottom tab bar is hidden
   - Resizing across 640px boundary swaps navigation correctly

2. **Header**
   - Renders app icon + "mealWise" text on the left
   - Renders user avatar on the right (initial letter fallback)
   - Avatar is clickable and opens profile dropdown

3. **Sidebar (Desktop)**
   - Collapsed by default (48px, icon-only)
   - Toggle button expands to 148px with labels
   - Active nav item has purple highlight
   - State persists in localStorage across page reloads
   - Clicking a nav item navigates to the correct route

4. **BottomTabBar (Mobile)**
   - 3 tabs visible: Meals, Planner, Shopping
   - Active tab has purple underline
   - Tapping a tab navigates to the correct route
   - Minimum 44x44px tap targets

5. **ProfileDropdown**
   - Opens when clicking avatar
   - Shows user name and email
   - Shows household join code with copy button
   - Copy button copies code to clipboard and shows "Copied!" feedback
   - Dark mode toggle switches theme
   - Sign out button calls `signOut()` and redirects to `/login`
   - Clicking outside closes the dropdown
   - Avatar shows accent ring when dropdown is open

6. **ThemeToggle Removal**
   - FAB no longer appears in bottom-right corner
   - Dark mode toggle still works via profile dropdown

7. **Auth Guard**
   - Unauthenticated users are redirected to `/login`
   - Authenticated users see the app layout with header + navigation

### Backend
No backend changes required — this feature is purely frontend layout and navigation.
