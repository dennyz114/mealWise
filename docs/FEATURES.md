# mealWise — Features

This document describes the features of the application. It is used as reference for development and AI-assisted coding sessions.

---

## 1. Authentication

- Sign in with Google via Supabase Auth
- On first login, a profile is automatically created
- Session persists across browser refreshes
- Sign out option available

> **Requirements**: [MW-001 — Login with Google](../features/MW-001-login/MW-001-login.md)

---

## 2. Dark Mode

- Auto-detect system color preference on first visit
- Manual toggle in profile dropdown to switch themes
- Preference persists across sessions
- Both light and dark themes fully supported

> **Requirements**: [MW-002 — Dark Mode](../features/MW-002-dark-mode/MW-002-dark-mode.md)

---

## 3. Internationalization (i18n)

Multi-language support for the application interface.

- UI labels translated: English, Spanish, French
- Language picker in profile dropdown (expands inline)
- Spanish is the default for new users
- Preference persists across sessions
- User-entered content is never translated
- System designed for easy addition of new languages

> **Requirements**: [MW-005 — Internationalization (i18n)](../features/MW-005-i18n/MW-005-i18n.md)

---

## 4. Application Layout

The global application shell that provides consistent navigation across all screens.

- Header with app logo and user avatar (always visible)
- Mobile: bottom tab bar with Meals, Planner, Shopping
- Desktop: collapsible sidebar with Meals, Planner, Shopping
- Profile dropdown menu triggered from avatar (user info, household code, dark mode toggle, settings, sign out)
- Household join code with copy-to-clipboard
- Global breakpoint at 640px for responsive layout switching
- Sidebar collapsed/expanded preference persists across sessions

> **Requirements**: [MW-004 — Application Layout](../features/MW-004-app-layout/MW-004-app-layout.md)

---

## 5. Household Management

A household is the core unit — all meals, menus, and shopping lists belong to a household.

- After login, if no household exists, user must create or join one before accessing the app
- "Set up your household" screen with create/join options replaces main content
- User can create a household (becomes the owner)
- Owner can share a `join_code` to invite other members
- Any authenticated user can join a household using a valid `join_code`
- Join code format: `XXX-XXX` (6 alphanumeric characters with hyphen)
- Profile dropdown shows "Setup needed" badge when no household exists
- After setup, profile dropdown shows join code (click to copy)
- Redirects to meals placeholder after successful create/join

> **Requirements**: [MW-006 — Household Management](../features/MW-006-household-management/MW-006-household-management.md)

---

## 6. Household Settings

Lets users manage their household from the Settings page — view members, share the join code, and either close or leave the household depending on their role.

- Settings page accessible from profile dropdown
- Account section: display name and email (read-only for now)
- Household section: editable name (owner only), join code with copy button, member list with color-coded avatars
- Owner sees "Close household" in danger zone; member sees "Leave household"
- Close household requires typing the exact name to confirm
- Both close and leave redirect to create/join household screen

> **Requirements**: [MW-007 — Household Settings](../features/MW-007-household-settings/MW-007-household-settings.md)

---

## 7. Manage Meals

Lets users build and maintain their recipe library — browse all meals, view a single meal's ingredients, add new meals, and delete meals they no longer need.

- Meal list shows all meals with name, ingredient count, and "Updated X ago" timestamp
- Search filters meals by name only
- Mobile: single-column cards with swipe-to-delete; Desktop: two-column grid with visible trash icon
- Create meal: enter name → navigate to detail page with ingredient picker open
- Each meal gets a randomly assigned icon from a fixed list
- Delete meal: simple two-button confirmation (no typing required)
- Add ingredient: pick from household library (qty-only prompt) or type new (AI auto-classifies category)
- Edit ingredient: reuse the same form, pre-filled with current values
- Unit list is fixed: `units`, `kg`, `l`, `pack`, `bunch`, `can` (translatable)
- Ingredients are stored per-meal (no cross-meal sharing)

> **Requirements**: [MW-008 — Manage Meals](../features/MW-008-meal-management/MW-008-meal-management.md)

---

## 9. Weekly Menu Planner

Plan meals for any week, not just the current one.

- View the meal plan for any given week (navigate forward/backward by week)
- Assign a meal to each day of the week (Monday–Sunday)
- A day can have no meal assigned (left empty)
- Change or remove the meal assigned to a specific day
- The planner works for past, current, and future weeks

---

## 10. Shopping List

Generated from the ingredients of all meals in a weekly menu.

- Generate the shopping list for a specific week from its planned meals
- Ingredients are **grouped by category** and **sorted alphabetically** within each group
- If the same ingredient appears in multiple meals, quantities are **aggregated**
- Manual items can be added directly to the list (not tied to any meal)
- Edit quantity of any item in the list
- Remove items from the list
- **Check off items** while shopping at the market
- Uncheck items if needed
- Visual distinction between checked and unchecked items

---

## 11. Button Component

A reusable Button component extending shadcn/ui with custom variants and states.

- Primary variant (with icon on left)
- Secondary variant (with icon on left)
- Icon-only variant (with tooltip for accessibility)
- Loading state (spinner replaces icon, button disabled)
- Disabled state (reduced opacity)
- Hover state (color transition only)

> **Requirements**: [MW-003 — Button Component](../features/MW-003-button-component/MW-003-button-component.md)

---

## 12. UI / UX Considerations

- **Mobile-first**: all screens must be fully functional and comfortable on a phone
- Desktop is supported but secondary
- Fast interactions — optimistic updates where possible (check off items, drag assignments)
- Minimal page reloads — SPA navigation throughout