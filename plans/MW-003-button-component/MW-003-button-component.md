# MW-003 — Button Component Technical Plan

## Technical Details

### Frontend

#### Overview
Extend shadcn/ui's Button component using `class-variance-authority` (cva) to create a flexible, accessible Button component with three variants (primary, secondary, icon-only) and multiple states (disabled, loading, hover).

#### Files to Create/Modify

| File | Purpose |
|------|---------|
| `src/lib/utils.ts` | Create `cn()` utility (clsx + tailwind-merge) for className merging |
| `src/components/ui/button.tsx` | Create extended Button component |
| `src/components/ui/tooltip.tsx` | Create Tooltip component for icon-only buttons |

#### Dependencies (Already Installed)
- `class-variance-authority` - For variant definitions
- `@radix-ui/react-slot` - For polymorphic `asChild` prop
- `clsx` + `tailwind-merge` - For className utilities

#### Component Architecture

**`src/lib/utils.ts`**
```ts
// cn utility for merging classnames
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))
```

**`src/components/ui/button.tsx`**

Props Interface:
```ts
import { type ButtonHTMLAttributes } from 'react'
import { type LucideIcon } from 'lucide-react'

type ButtonProps = {
  variant: 'primary' | 'secondary' | 'icon-only'
  icon?: LucideIcon
  isLoading?: boolean
  tooltip?: string
  disabled?: boolean
} & ButtonHTMLAttributes<HTMLButtonElement>
```

Variant Styles (cva):
```ts
// Primary: Accent bg, white text, icon on left
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] transition-colors',
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-50',
        secondary:
          'border border-[var(--color-border-strong)] bg-transparent text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] disabled:opacity-50',
        'icon-only':
          'size-10 bg-transparent text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] disabled:opacity-50',
      },
    },
  }
)
```

**`src/components/ui/tooltip.tsx`**
- Simple tooltip using CSS `:hover` pseudo-class
- Positioned above the button
- Shows on hover, hidden by default
- Uses `aria-label` for screen readers

#### Implementation Steps

1. **Create `src/lib/utils.ts`**
   - Export `cn` function combining clsx + tailwind-merge

2. **Create `src/components/ui/tooltip.tsx`**
   - Wrapper component with hover tooltip
   - Accepts `content` (tooltip text) and `children` (trigger element)

3. **Create `src/components/ui/button.tsx`**
   - Import `cva` from class-variance-authority
   - Import `cn` from `@/lib/utils`
   - Define variants with cva
   - Handle loading state: swap icon for spinner, disable button
   - Handle icon-only variant with tooltip
   - Support `asChild` prop via `@radix-ui/react-slot`

4. **Update `GoogleButton` (optional refactor)**
   - Consider refactoring to use the new Button component
   - Keep as separate component since it has specific Google branding

#### Loading Spinner
- Use `Loader2` from lucide-react with `animate-spin` class
- Replace the original icon with spinner when `isLoading=true`
- Keep button text visible during loading
- Button becomes disabled during loading

#### Accessibility
- `aria-label` for icon-only buttons
- `aria-disabled` for disabled state
- Focus ring using design system accent color
- `role="button"` for semantic correctness

#### Styling Notes
- Use design system tokens (`--color-accent`, `--color-border-strong`, etc.)
- Border radius: `--radius-md` (8px)
- Minimum tap target: 44x44px
- Transition: `transition-colors` for smooth hover
- Disabled: `opacity-50` + `cursor-not-allowed`

---

## API Contracts

### Button Component Interface

```ts
// src/components/ui/button.tsx
import { type ButtonHTMLAttributes } from 'react'
import { type LucideIcon } from 'lucide-react'

type ButtonVariant = 'primary' | 'secondary' | 'icon-only'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Button visual style */
  variant: ButtonVariant
  /** Icon component from lucide-react (optional, left-aligned) */
  icon?: LucideIcon
  /** Show loading spinner, disables button */
  isLoading?: boolean
  /** Tooltip text for icon-only variant */
  tooltip?: string
  /** Render as child element (polymorphic) */
  asChild?: boolean
}

declare const Button: React.FC<ButtonProps>
export default Button
```

### Usage Examples

```tsx
// Primary button with icon
<Button variant="primary" icon={Plus} onClick={handleAdd}>
  Add Meal
</Button>

// Secondary button with icon
<Button variant="secondary" icon={Edit} onClick={handleEdit}>
  Edit
</Button>

// Icon-only button with tooltip
<Button variant="icon-only" icon={Trash} tooltip="Delete" onClick={handleDelete} />

// Loading state
<Button variant="primary" icon={Save} isLoading={isSaving} onClick={handleSave}>
  Save Changes
</Button>

// Disabled state
<Button variant="primary" disabled onClick={handleAction}>
  Submit
</Button>
```

---

## Essential Tests

### Frontend

#### Unit Tests

1. **Renders primary variant correctly**
   - Button displays with accent background color
   - Text is visible and correctly styled

2. **Renders secondary variant correctly**
   - Button has transparent background with border
   - Text is visible and correctly styled

3. **Renders icon-only variant correctly**
   - Button is square/round (10 width, 10 height)
   - No text visible
   - Shows tooltip on hover

4. **Displays icon on left when provided**
   - Icon appears before button text
   - Proper spacing between icon and text

5. **Shows loading spinner when isLoading=true**
   - Original icon is replaced with Loader2 spinner
   - Spinner has `animate-spin` class
   - Button text remains visible
   - Button is disabled

6. **Disables button when disabled prop is true**
   - Button has `disabled` attribute
   - Opacity is reduced to 50%
   - Cursor changes to not-allowed
   - onClick handler is not called

7. **Disables button during loading state**
   - Button is disabled while loading
   - No pointer events

8. **Shows tooltip on hover for icon-only buttons**
   - Tooltip text appears when hovering
   - Tooltip is positioned above button
   - Tooltip disappears when not hovering

9. **Calls onClick handler when clicked**
   - Handler is called with click event
   - Handler is not called when disabled or loading

10. **Passes through HTML button attributes**
    - `type`, `aria-label`, `data-*` attributes work
    - `className` is merged with variant styles

#### Integration Tests

11. **Works within form submissions**
    - Button with `type="submit"` triggers form submit
    - Loading state prevents multiple submissions

#### Accessibility Tests

12. **Icon-only button has accessible label**
    - `aria-label` is set for screen readers
    - Tooltip provides visual label for sighted users

13. **Focus ring is visible**
    - Button shows focus ring when tabbed to
    - Focus ring uses accent color

---

## Notes for Implementation

- The `GoogleButton` component can remain separate as it has Google-specific branding
- Consider creating a `Spinner` component in `src/components/ui/spinner.tsx` if reusing elsewhere
- Tooltip component should be lightweight - can use CSS-only approach with `:hover` pseudo-class
- Follow existing patterns: arrow functions, strict TypeScript, early returns
- All colors should use design system tokens from `globals.css`
