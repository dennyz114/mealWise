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

### 5. `src/components/Avatar.tsx` — Reusable avatar
Renders user's profile image or first-letter fallback.
- Size prop: `'sm'` (32px, header) | `'md'` (40px, profile dropdown)
- Border-radius: `50%`
- Background: `var(--color-accent-subtle)`
- Text color: `var(--color-accent)`
- Accepts optional `className` for the accent ring state

### 6. `src/components/ProfileDropdown.tsx` — Profile menu
Uses `@radix-ui/react-dropdown-menu` (already installed):
- Trigger: Avatar component
- Content: floating panel with:
  - User info section (larger avatar + displayName + email)
  - "My household" row with join code badge + copy button
  - "Dark mode" toggle row (uses `useTheme()`)
  - "Settings" row (placeholder, non-functional)
  - "Sign out" row (calls `signOut()` from `@/lib/auth`)

### 7. `src/components/Sidebar.tsx` — Desktop navigation
Vertical nav rail on the left side:
- Collapsed: 48px, icon-only
- Expanded: 148px, icon + label
- Toggle button at top (chevron icon)
- 3 nav items: Meals, Planner, Shopping
- Active item: purple background highlight (`var(--color-accent-subtle)`) + accent text
- Uses `NavLink` from TanStack Router for active state detection

### 8. `src/components/BottomTabBar.tsx` — Mobile navigation
Fixed bottom tab bar:
- 3 tabs: Meals, Planner, Shopping
- Each tab: icon (20px) + label (12px) below
- Active tab: purple underline indicator (`2px solid var(--color-accent)`) + accent text
- Height: ~60px
- Safe-area padding for iOS (`env(safe-area-inset-bottom)`)
- Uses `NavLink` from TanStack Router

### 9. `src/components/AppLayout.tsx` — Layout orchestrator
The main layout wrapper that composes all pieces.

### 10. Route structure
- `src/routes/__root.tsx` — Keep minimal (providers only)
- `src/routes/_authenticated.tsx` — Layout route with auth guard + AppLayout
- `src/routes/_authenticated/meals.tsx` — Placeholder
- `src/routes/_authenticated/planner.tsx` — Placeholder
- `src/routes/_authenticated/shopping.tsx` — Placeholder

### 11. Delete `src/components/ThemeToggle.tsx`
Dark mode toggle moves to ProfileDropdown.

### 12. Update `src/routes/__root.tsx`
Remove `<ThemeToggle />` import and render.
