# MW-004 — Application Layout

## Description
The application layout defines the global shell structure for mealWise — including the header, sidebar (desktop), bottom tabs (mobile), and profile menu. This layout provides consistent navigation across all screens and adapts responsively between mobile and desktop viewports.

## Requirements

### Global Breakpoint
- Use `640px` as the global breakpoint to switch between mobile and desktop layouts
- All components throughout the application must respect this breakpoint for responsive behavior

### Header (Always Visible)
- Displays on all screen sizes at the top of the viewport
- Left side: App icon (calendar) + "mealWise" text
- Right side: User avatar (first letter of display name as fallback when no profile image)
- Avatar is clickable and triggers the profile dropdown menu
- When the profile menu is open, the avatar displays a purple accent ring

### Mobile Layout (< 640px)
- **Header**: Fixed at top (logo + avatar)
- **Navigation**: Fixed bottom tab bar with 3 items:
  - Meals (fork/knife icon)
  - Planner (calendar icon)
  - Shopping (cart icon)
- Active tab shows a purple underline indicator
- Tab labels are always visible below their icons

### Desktop Layout (≥ 640px)
- **Header**: Fixed at top (logo + avatar)
- **Sidebar**: Left-side vertical navigation with 3 items:
  - Meals (fork/knife icon)
  - Planner (calendar icon)
  - Shopping (cart icon)
- **Collapsed state**: 48px wide, icon-only
- **Expanded state**: 148px wide, icon + text label
- User can manually toggle between collapsed and expanded states
- Sidebar preference (collapsed/expanded) persists across sessions (localStorage)
- Active item shows purple background highlight

### Profile Dropdown Menu
- Triggered by clicking/tapping the avatar in the header
- **Desktop**: Floating panel anchored to top-right of avatar, overlays content
- **Mobile**: Floating panel anchored to avatar, full-width minus horizontal padding/borders
- Contains the following items:
  - User info: Avatar (larger) + display name + email
  - "My household" row with join code displayed inline (badge style)
  - "Dark mode" toggle switch (reflects current theme state)
  - "Settings" link (placeholder — no destination yet)
  - "Sign out" link (red/accent text color)
- Clicking outside the dropdown closes it
- The dropdown has a subtle border/shadow to distinguish it from background content

### Household Join Code
- Displayed inline next to "My household" label in the profile dropdown
- Includes a copy-to-clipboard button/icon
- On copy, provide visual feedback (e.g., brief "Copied!" tooltip or icon change)

### Navigation
- Meals, Planner, and Shopping are the three primary navigation destinations
- Clicking a navigation item routes to the corresponding page
- The current active page is highlighted in both the sidebar (desktop) and bottom tabs (mobile)
