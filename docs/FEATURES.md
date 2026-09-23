# mealWise — Features

High-level feature index for the app. **Detailed session guidance** lives in [`docs/features/`](./features/README.md) — open the matching file there when changing a feature.

---

## 1. Authentication

- Email + password sign-in and registration (Supabase Auth)
- Profile created on signup; session persists across refresh
- Sign out from profile menu

> **Guidance**: [features/auth.md](./features/auth.md)

---

## 2. Dark Mode

- Auto-detect system preference; manual override persists

> **Guidance**: [features/dark-mode.md](./features/dark-mode.md)

---

## 3. Internationalization (i18n)

- EN / ES / FR; Spanish default; UI-only translation

> **Guidance**: [features/i18n.md](./features/i18n.md)

---

## 4. Application Layout

- Header + mobile tabs / desktop sidebar; profile dropdown; 640px breakpoint

> **Guidance**: [features/app-layout.md](./features/app-layout.md)

---

## 5. Household Management

- Create or join household before using the app; join codes `XXX-XXX`

> **Guidance**: [features/household-management.md](./features/household-management.md)

---

## 6. Household Settings

- Members, join code, rename (owner), close / leave

> **Guidance**: [features/household-settings.md](./features/household-settings.md)

---

## 7. Manage Meals

- Household meal library, ingredient library + per-meal quantities, create/edit/delete

> **Guidance**: [features/meal-management.md](./features/meal-management.md)

---

## 8. Weekly Menu Planner

- Assign meals to days for any week

> **Guidance**: [features/weekly-planner.md](./features/weekly-planner.md)

---

## 9. Shopping List

- Generated from planned meals; grouped, aggregated, checkable

> **Guidance**: [features/shopping-list.md](./features/shopping-list.md)

---

## 10. Button Component

- Primary / secondary / icon-only; loading & disabled

> **Guidance**: [features/button.md](./features/button.md)

---

## 11. UI / UX Considerations

- Mobile-first; desktop secondary
- Fast interactions — optimistic updates where possible
- SPA navigation throughout
