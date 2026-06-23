# MW-002 — Technical Plan: Dark Mode

## Technical Details

### Overview
Implement dark mode for the mealWise SPA using CSS custom properties and the `data-theme` attribute on `<html>`. Since this is a Vite + React SPA (not Next.js), we'll create a custom theme hook instead of using `next-themes`.

### Approach
1. **CSS Custom Properties** — Define all theme tokens in `src/index.css` using `:root` (light) and `[data-theme="dark"]` (dark) selectors
2. **Theme Hook** — Custom `useTheme()` hook that manages system detection, localStorage persistence, and DOM updates
3. **FOUC Prevention** — Inline script in `index.html` runs before React to set the correct theme attribute, preventing flash of unstyled content
4. **Toggle Component** — FAB-style button fixed in bottom-right corner per STYLING.md patterns

---

## Files to Create/Modify

### 1. `index.html` — Add FOUC prevention script
Add an inline `<script>` in `<head>` that:
- Reads `localStorage.getItem('theme')`
- If not set, detects `prefers-color-scheme: dark`
- Sets `document.documentElement.setAttribute('data-theme', ...)` immediately

### 2. `src/index.css` — Add all CSS custom properties
Expand from current single-line import to include:
- Google Fonts import for Inter
- `:root` block with all light mode tokens from STYLING.md Section 4
- `[data-theme="dark"]` block with all dark mode tokens
- Base body styles (font, colors, background)
- No component-specific styles (use Tailwind utilities)

### 3. `src/lib/theme.ts` — Custom theme hook
Create a `useTheme()` hook that returns:
- `theme: 'light' | 'dark'` — current resolved theme
- `setTheme: (theme: 'light' | 'dark') => void` — manual setter
- `systemTheme: 'light' | 'dark'` — detected system preference

Logic:
- Initialize from `localStorage('mealwise-theme')`
- Fall back to `window.matchMedia('(prefers-color-scheme: dark)')` detection
- On `setTheme`, update localStorage + `data-theme` attribute
- Listen for system preference changes via `matchMedia` event listener
- **Key requirement**: Once user manually sets a theme, ignore system changes until they explicitly choose "system" again (but for MW-002, we only need light/dark toggle, not a "system" option — the system detection is only for first visit)

### 4. `src/components/ThemeToggle.tsx` — Toggle button
FAB-style floating button:
- Position: fixed bottom-right (`bottom-6 right-6`)
- Size: 44x44px minimum (accessibility)
- Icon: `ti-sun` when dark (click to go light), `ti-moon` when light (click to go dark)
- Style: `background: var(--color-accent)`, white icon, `border-radius: 50%`
- Uses `useTheme()` hook
- Accessible: proper `aria-label`, keyboard focusable

### 5. `src/routes/__root.tsx` — Mount ThemeToggle
Add `<ThemeToggle />` inside the root layout, after `<Outlet />`.

---

## API Contracts

### `useTheme()` Hook
```ts
type Theme = 'light' | 'dark'

type UseThemeReturn = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const useTheme: () => UseThemeReturn
```

### `ThemeToggle` Component
```tsx
type ThemeToggleProps = Record<string, never>

const ThemeToggle: React.FC<ThemeToggleProps> = () => JSX.Element
```

### CSS Token Contract
All components must use CSS custom properties (e.g., `var(--color-accent)`) instead of hardcoded colors. The theme switch happens by toggling `data-theme` on `<html>`, which swaps all variable values automatically.

---

## Essential Tests

### Frontend
1. **Theme Initialization**
   - On first visit with `prefers-color-scheme: dark`, page loads in dark mode
   - On first visit with `prefers-color-scheme: light`, page loads in light mode
   - No flash of wrong theme on initial load (FOUC prevention)

2. **Toggle Functionality**
   - Clicking toggle when in light mode switches to dark mode
   - Clicking toggle when in dark mode switches to light mode
   - Toggle icon changes correctly (moon in light, sun in dark)

3. **Persistence**
   - After toggling to dark, refreshing page keeps dark mode
   - After toggling to light, refreshing page keeps light mode
   - Clearing localStorage resets to system preference

4. **CSS Variables**
   - All `--color-*` tokens swap correctly between light/dark
   - Category colors (vegetables, proteins, etc.) use correct ramps
   - Accent color uses 600 (light) and 400 (dark) per STYLING.md rules

5. **Accessibility**
   - Toggle button has `aria-label="Switch to dark mode"` / `"Switch to light mode"`
   - Toggle button is keyboard focusable (Tab + Enter/Space)
   - Toggle button meets 44x44px tap target minimum

### Backend
No backend changes required — dark mode is purely a frontend concern managed via CSS and localStorage.
