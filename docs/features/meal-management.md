# Meal management

Session guidance for meals UI **and** product/data rules. Schema columns → `docs/DATABASE.md`.  
Mockups (optional): `docs/features/assets/meal-management/`.

---

## Scope
- Meals belong to a **household**; all members can view/edit the meal library.
- Meals are reused later by the weekly planner and shopping list.

---

## List
- Cards: name, ingredient count, “Updated X ago”, icon from creation.
- Search by **meal name only**.
- Mobile: swipe-to-delete; desktop: trash on card.
- FAB / “New meal” entry points.

---

## Create
- **Quick create**: name → persist meal (`create_meal` RPC) → detail (picker may open). Empty ingredients OK.
- **Wizard**: name → ingredients → review → create → success.
- Icon assigned **once** at creation from a fixed Tabler list (not user-editable).
- Creating/updating ingredients bumps meal `updated_at`.

---

## Detail
- Editable name; ingredient rows (category badge, name, qty, unit, trash).
- Add: library pick (qty-only) or new ingredient form.

---

## Delete meal
- Confirm Cancel / Delete (no typing).
- Removes meal + `meal_ingredients` links.
- Keeps `ingredient_library` rows.
- Does not rewrite weekly menus that still reference the meal id.

---

## Ingredient model (M:N)

```
Household
  └── ingredient_library   ← name, unit, category (unique name per household)
  └── meals
        └── meal_ingredients  ← meal_id + ingredient_id + quantity
```

### `ingredient_library`
- Canonical catalog for the household.
- New ingredient → **upsert** on `(household_id, name)`.
- Pick existing → reuse `id` (no duplicate).
- Edit **name / unit / category** → updates the **library row** (shared across all meals using it).
- Unused library rows are not auto-cleaned today.

### `meal_ingredients`
- Link table only; **quantity is per meal**.
- Unique `(meal_id, ingredient_id)` — one link per library item per meal.
- Delete from a meal → remove link only; library entry stays.
- UI shows flattened row: library fields + quantity.

### Categories
`vegetables` | `proteins` | `pantry` | `fruits` | `spices` | `cleaning`

### Units
`units` | `kg` | `l` | `pack` | `bunch` | `can` (i18n labels)

---

## AI category detection
- Flag: `aiCategoryDetection` in `src/config/systemSettings.ts` (`isFeatureEnabled`).
- **Off** (default): manual category chips; default `pantry`; no API call.
- **On**: debounced suggest; user can override. Only the final category string is stored (no AI provenance).
- Fail soft → user picks manually.

---

## Access
- Only household members can read/write that household’s meals and library.
- Meal create uses `create_meal` RPC (membership-checked).

---

## Downstream
- **Planner** assigns meals (not raw ingredients).
- **Shopping list** aggregates ingredients from planned meals (sum qty when the same ingredient appears in multiple meals).
