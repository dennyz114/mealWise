# MW-003 — Button Component

## Description
A reusable Button component that extends shadcn/ui's Button. It provides consistent styling across the application with support for icons, loading states, and accessibility features like tooltips for icon-only buttons.

## Requirements

- Extend shadcn/ui Button component with custom variants
- Standard size only (no size prop needed)

### Variants

- **Primary**: Background fill with accent color, white text. Icon on the left when provided.
- **Secondary**: Transparent background with border, primary text. Icon on the left when provided.
- **Icon Only**: No text, square shape, same height as regular buttons. Displays only an icon. Includes a tooltip on hover for accessibility.

### States

- **Disabled**: Reduced opacity (50%), cursor not-allowed, no pointer events
- **Loading**: Show spinner icon replacing the original icon, keep button text, button becomes disabled
- **Hover**: Color transition only (no scale or shadow effects)

### Styling

- Border radius: `--radius-md` (8px)
- Follow design system tokens for colors (primary, secondary variants)
- Minimum tap target: 44x44px for accessibility

### Accessibility

- Icon-only buttons must have a tooltip on hover
- Proper aria-label for screen readers
- Focus states should follow design system accent colors
