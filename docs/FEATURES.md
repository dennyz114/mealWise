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
- Manual toggle in bottom right corner to switch themes
- Preference persists across sessions
- Both light and dark themes fully supported

> **Requirements**: [MW-002 — Dark Mode](../features/MW-002-dark-mode/MW-002-dark-mode.md)

---

## 3. Household Management

A household is the core unit — all meals, menus, and shopping lists belong to a household.

- User can create a household (becomes the owner)
- Owner can share a `join_code` to invite other members
- Any authenticated user can join a household using a valid `join_code`
- A user can only belong to one household at a time
- Owner can remove members
- Owner can delete the household

---

## 3. Meal Library

A shared library of meals within a household.

- View all meals in the household
- Create a new meal with a name
- Edit or delete an existing meal
- Each meal has a list of ingredients (see section 4)

---

## 4. Ingredient Management

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

## 5. Weekly Menu Planner

Plan meals for any week, not just the current one.

- View the meal plan for any given week (navigate forward/backward by week)
- Assign a meal to each day of the week (Monday–Sunday)
- A day can have no meal assigned (left empty)
- Change or remove the meal assigned to a specific day
- The planner works for past, current, and future weeks

---

## 6. Shopping List

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

## 7. UI / UX Considerations

- **Mobile-first**: all screens must be fully functional and comfortable on a phone
- Desktop is supported but secondary
- Fast interactions — optimistic updates where possible (check off items, drag assignments)
- Minimal page reloads — SPA navigation throughout