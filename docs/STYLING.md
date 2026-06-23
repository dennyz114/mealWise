# WeeklyMenu — Design System

> Single source of truth for colors, typography, spacing, and components.
> All values are defined as CSS custom properties in `globals.css` and toggled via the `[data-theme="dark"]` attribute on `<html>`.

---

## 1. Brand accent — Purple ramp

The primary brand color. Used for buttons, active states, links, progress bars, FABs, and focus rings.

| Stop | Hex | Usage |
|------|-----|-------|
| 50 | `#EEEDFE` | Light fills, ghost button bg, icon bg (light) |
| 100 | `#CECBF6` | Hover fills, subtle highlights |
| 200 | `#AFA9EC` | Borders on colored surfaces, dark mode strokes |
| 400 | `#7F77DD` | Mid-tone accent, dark mode icon color |
| **600** | **`#534AB7`** | **Primary accent — buttons, active tabs, links** |
| 800 | `#3C3489` | Text on light purple fills, dark mode hero text |
| 900 | `#26215C` | Darkest text on light fills |

> **Rule:** Light mode accent = `600`. Dark mode accent = `400`. Never use `900` on dark backgrounds.

---

## 2. Category colors

Each ingredient category has a dedicated color ramp. Always use `50` for the fill and `800` for text in light mode, `800` fill and `100` text in dark mode.

| Category | Ramp | Fill (light) | Text (light) | Fill (dark) | Text (dark) | Icon |
|----------|------|-------------|-------------|------------|------------|------|
| Vegetables | Green | `#EAF3DE` | `#27500A` | `#27500A` | `#C0DD97` | `ti-plant-2` |
| Proteins | Coral | `#FAECE7` | `#712B13` | `#712B13` | `#F5C4B3` | `ti-meat` |
| Pantry / dry goods | Amber | `#FAEEDA` | `#633806` | `#633806` | `#FAC775` | `ti-package` |
| Fruits | Teal | `#E1F5EE` | `#085041` | `#085041` | `#9FE1CB` | `ti-apple` |
| Spices & condiments | Blue | `#E6F1FB` | `#0C447C` | `#0C447C` | `#B5D4F4` | `ti-sparkles` |
| Cleaning supplies | Pink | `#FBEAF0` | `#72243E` | `#72243E` | `#F4C0D1` | `ti-droplet` |

---

## 3. Neutral / surface ramp (Gray)

Used for all backgrounds, borders, and text.

| Stop | Hex | Light mode usage | Dark mode usage |
|------|-----|-----------------|----------------|
| 50 | `#F1EFE8` | bg-secondary (surfaces, inputs) | — |
| 100 | `#D3D1C7` | border-default | — |
| 200 | `#B4B2A9` | text-tertiary (hints) | — |
| 400 | `#888780` | text-secondary (muted) | text-secondary |
| 600 | `#5F5E5A` | text-secondary | text-tertiary |
| 800 | `#444441` | — | border-default |
| 900 | `#2C2C2A` | — | bg-secondary |

---

## 4. CSS custom properties

Define these in `globals.css`. Swap via `[data-theme="dark"]` on `<html>`.

```css
:root {
  /* Brand */
  --color-accent:           #534AB7;
  --color-accent-hover:     #3C3489;
  --color-accent-subtle:    #EEEDFE;
  --color-accent-text:      #3C3489;

  /* Backgrounds */
  --color-bg-page:          #E8E6DE;
  --color-bg-primary:       #ffffff;
  --color-bg-secondary:     #F1EFE8;
  --color-bg-tertiary:      #E8E6DE;

  /* Text */
  --color-text-primary:     #111110;
  --color-text-secondary:   #5F5E5A;
  --color-text-tertiary:    #B4B2A9;

  /* Borders */
  --color-border-default:   #D3D1C7;
  --color-border-strong:    #B4B2A9;
  --color-border-accent:    #534AB7;

  /* Categories */
  --color-cat-veg-bg:       #EAF3DE;
  --color-cat-veg-text:     #27500A;
  --color-cat-protein-bg:   #FAECE7;
  --color-cat-protein-text: #712B13;
  --color-cat-pantry-bg:    #FAEEDA;
  --color-cat-pantry-text:  #633806;
  --color-cat-fruit-bg:     #E1F5EE;
  --color-cat-fruit-text:   #085041;
  --color-cat-spice-bg:     #E6F1FB;
  --color-cat-spice-text:   #0C447C;
  --color-cat-clean-bg:     #FBEAF0;
  --color-cat-clean-text:   #72243E;

  /* Radius */
  --radius-sm:  4px;
  --radius-md:  8px;
  --radius-lg:  12px;
  --radius-xl:  16px;
  --radius-2xl: 22px;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
}

[data-theme="dark"] {
  --color-accent:           #7F77DD;
  --color-accent-hover:     #AFA9EC;
  --color-accent-subtle:    #26215C;
  --color-accent-text:      #CECBF6;

  --color-bg-page:          #222220;
  --color-bg-primary:       #1a1a18;
  --color-bg-secondary:     #2C2C2A;
  --color-bg-tertiary:      #222220;

  --color-text-primary:     #F1EFE8;
  --color-text-secondary:   #888780;
  --color-text-tertiary:    #5F5E5A;

  --color-border-default:   #444441;
  --color-border-strong:    #5F5E5A;
  --color-border-accent:    #7F77DD;

  --color-cat-veg-bg:       #27500A;
  --color-cat-veg-text:     #C0DD97;
  --color-cat-protein-bg:   #712B13;
  --color-cat-protein-text: #F5C4B3;
  --color-cat-pantry-bg:    #633806;
  --color-cat-pantry-text:  #FAC775;
  --color-cat-fruit-bg:     #085041;
  --color-cat-fruit-text:   #9FE1CB;
  --color-cat-spice-bg:     #0C447C;
  --color-cat-spice-text:   #B5D4F4;
  --color-cat-clean-bg:     #72243E;
  --color-cat-clean-text:   #F4C0D1;
}
```

---

## 5. Typography

Font: **Inter** (from Google Fonts). Fallback: `system-ui, -apple-system, sans-serif`.
Weights: `400` (regular) and `500` (medium) only. Never use 600 or 700.

```css
/* globals.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap');

body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.6;
  color: var(--color-text-primary);
  background: var(--color-bg-page);
}
```

| Role | Size | Weight | Color token | Notes |
|------|------|--------|-------------|-------|
| Page title | 22px | 500 | `text-primary` | Nav bar, modal title |
| Section heading | 17px | 500 | `text-primary` | Card headers |
| Card title | 15px | 500 | `text-primary` | Meal name, list name |
| Body | 13–14px | 400 | `text-primary` | Default prose |
| Secondary | 12px | 400 | `text-secondary` | Subtitles, meta |
| Section label | 11px | 500 | `text-tertiary` | ALL CAPS + letter-spacing: 0.06em |
| Caption / hint | 10–11px | 400 | `text-tertiary` | Placeholder, footer |

---

## 6. Spacing

Use the `--space-*` tokens. Prefer `px` for component-internal gaps and `rem` for page-level rhythm.

| Token | Value | Common usage |
|-------|-------|-------------|
| `--space-1` | 4px | Icon-to-label gap |
| `--space-2` | 8px | Inline element gap |
| `--space-3` | 12px | Card internal padding |
| `--space-4` | 16px | Page horizontal padding, section padding |
| `--space-6` | 24px | Between sections inside a page |
| `--space-8` | 32px | Between major page sections |

---

## 7. Border radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Badges, pills, small chips |
| `--radius-md` | 8px | Buttons, inputs, small cards |
| `--radius-lg` | 12px | Cards, bottom sheets, dropdowns |
| `--radius-xl` | 16px | Modals, overlays |
| `--radius-2xl` | 22px | Phone frames, large containers |
| `50%` | — | Avatars, FABs, checkboxes |

---

## 8. Borders & elevation

No drop shadows. Depth is communicated through border weight only.

| State | Border style |
|-------|-------------|
| Default card | `0.5px solid var(--color-border-default)` |
| Hover | `0.5px solid var(--color-border-strong)` |
| Selected / active | `1.5px solid var(--color-border-accent)` |
| Focused input | `1.5px solid var(--color-accent)` + no outline |
| Disabled / muted | `0.5px solid var(--color-border-default)` + `bg-secondary` fill |

---

## 9. Component patterns

### Primary button
```css
background: var(--color-accent);
color: #ffffff;
border: none;
border-radius: var(--radius-md);
padding: 10px 18px;
font-size: 14px;
font-weight: 500;
```

### Secondary button
```css
background: transparent;
color: var(--color-text-primary);
border: 0.5px solid var(--color-border-strong);
border-radius: var(--radius-md);
padding: 10px 18px;
font-size: 14px;
font-weight: 500;
```

### Ghost accent button
```css
background: var(--color-accent-subtle);
color: var(--color-accent);
border: none;
border-radius: var(--radius-md);
```

### FAB (floating action button)
```css
background: var(--color-accent);
color: #ffffff;
border-radius: 24px;          /* pill shape */
padding: 0 18px;
height: 44px;
min-width: 44px;
```

### Card
```css
background: var(--color-bg-primary);
border: 0.5px solid var(--color-border-default);
border-radius: var(--radius-lg);
padding: 12px 14px;
```

### Category badge
```css
font-size: 11px;
font-weight: 500;
padding: 3px 10px;
border-radius: 20px;
display: inline-flex;
align-items: center;
gap: 4px;
/* Fill and text color from category token table above */
```

### Input field
```css
padding: 9px 12px;
border-radius: var(--radius-md);
border: 0.5px solid var(--color-border-default);
background: var(--color-bg-primary);
font-size: 13px;
color: var(--color-text-primary);
outline: none;
/* On focus: */
border: 1.5px solid var(--color-accent);
```

### Bottom sheet
```css
background: var(--color-bg-primary);
border-radius: 20px 20px 0 0;
padding: 16px;
/* Handle bar: */
width: 36px; height: 4px;
background: var(--color-border-strong);
border-radius: 2px;
margin: 0 auto 16px;
```

---

## 10. Icons

Library: **Tabler Icons** (outline only). Load via CDN:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css" />
```

Usage: `<i class="ti ti-{name}"></i>`

| Context | Size |
|---------|------|
| Inline text | 16px |
| List item / card | 18–20px |
| Tab bar | 20px |
| FAB | 20px |
| Hero / decorative | 24px max |

Key icons used in WeeklyMenu:

| Element | Icon |
|---------|------|
| Meals tab | `ti-tools-kitchen-2` |
| Planner tab | `ti-calendar-week` |
| Shopping tab | `ti-shopping-cart` |
| History tab | `ti-history` |
| Add | `ti-plus` |
| Delete | `ti-trash` |
| Edit | `ti-edit` |
| Check | `ti-check` |
| Search | `ti-search` |
| AI suggest | `ti-sparkles` |
| Back | `ti-arrow-left` |
| Close | `ti-x` |
| Lock / secure | `ti-lock` |
| Drag handle | `ti-grip-vertical` |

---

## 11. Dark mode implementation (Next.js)

Use `next-themes` for zero-flash dark mode:

```tsx
// app/layout.tsx
import { ThemeProvider } from 'next-themes'

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

Toggle button:
```tsx
import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      <i className={`ti ${theme === 'dark' ? 'ti-sun' : 'ti-moon'}`} />
    </button>
  )
}
```

---

## 12. Breakpoints (mobile-first)

```css
/* Mobile first — base styles target mobile */
/* Tablet */
@media (min-width: 640px) { }
/* Desktop */
@media (min-width: 1024px) { }
```

| Breakpoint | Layout change |
|-----------|---------------|
| < 640px | Single column, bottom tab bar, full-width sheets |
| 640–1024px | Two-column grids, side panels begin |
| > 1024px | Login split-panel, sidebar nav, wider cards |

---

*To change the brand palette in the future: update only the `--color-accent*` tokens and the Purple ramp references in Section 1. All components inherit automatically.*