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

## 6. Meal Library

A shared library of meals within a household.

- View all meals in the household
- Create a new meal with a name
- Edit or delete an existing meal
- Each meal has a list of ingredients (see section 4)

---

## 7. Ingredient Management

Ingredients belong to a meal and have: `name`, `quantity`, `unit`, and `category`.

- Add ingredients to a meal
- When adding an ingredient, the user can:
  - Pick from previously used ingredients in the household (reuse)
  - Or type a new ingredient name
- **If a new ingredient name is entered, the category is auto-detected using the Anthropic API** (e.g. "potatoes" → "vegetables")
- The user can override the auto-detected category
- Available units: `g`, `kg`, `ml`, `l`, `units`, and other common units
- Edit or delete ingredients from a meal

---

## 8. Weekly Menu Planner

Plan meals for any week, not just the current one.

- View the meal plan for any given week (navigate forward/backward by week)
- Assign a meal to each day of the week (Monday–Sunday)
- A day can have no meal assigned (left empty)
- Change or remove the meal assigned to a specific day
- The planner works for past, current, and future weeks

---

## 9. Shopping List

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

## 10. Button Component

A reusable Button component extending shadcn/ui with custom variants and states.

- Primary variant (with icon on left)
- Secondary variant (with icon on left)
- Icon-only variant (with tooltip for accessibility)
- Loading state (spinner replaces icon, button disabled)
- Disabled state (reduced opacity)
- Hover state (color transition only)

> **Requirements**: [MW-003 — Button Component](../features/MW-003-button-component/MW-003-button-component.md)

---

## 11. UI / UX Considerations

- **Mobile-first**: all screens must be fully functional and comfortable on a phone
- Desktop is supported but secondary
- Fast interactions — optimistic updates where possible (check off items, drag assignments)
- Minimal page reloads — SPA navigation throughout