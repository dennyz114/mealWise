# Review — MW-008 — Manage Meals

## Bugs

1. **[BLOCKING] Missing i18n key `meals.editIngredientTitle`** — `src/components/meals/IngredientForm.tsx:122` calls `t('meals.editIngredientTitle')` but this key does not exist in `en.json`, `es.json`, or `fr.json`. Will render the raw key string as fallback.

2. **[BLOCKING] Edit ingredient is a noop** — `src/components/meals/MealDetailPage.tsx:156` passes `onEdit={() => {}}` to `IngredientRow`. Tapping an ingredient row does nothing. The requirement (Req 9) states: "Tapping an existing ingredient in the detail view opens the same 'new ingredient' component, pre-filled with the current values." This is a fully missing feature.

3. **[BLOCKING] `updated_at` not updated on ingredient mutations** — When `addIngredient` or `deleteIngredient` are called in `src/lib/meals.ts:136-181`, the parent meal's `updated_at` is not touched. The "Updated X ago" on the meal card will be stale after ingredient changes. There is no DB trigger for this either (no migration with a trigger was found). `updateMealName` (line 118) manually sets `updated_at`, but the ingredient mutations do not.

4. **[BLOCKING] `SwipeableCard` transition class uses ref that doesn't trigger re-render** — `src/components/meals/SwipeableCard.tsx:81` conditionally applies `transition-transform` based on `!isSwiping.current`. Since `isSwiping` is a `useRef`, mutating it doesn't cause a re-render, so this class toggle will be stale. The transition will always be present or never present depending on the initial render state, rather than toggling during swipes.

5. **[NON-BLOCKING] `getMealIngredientCounts` N+1 query** — `src/lib/meals.ts:184-204` iterates over every meal and fires a separate `select` with `count: 'exact'` per meal. With 20 meals, this is 21 queries. Should use a single grouped query or a Supabase RPC.

## Duplicated Code

1. **Category type assertion pattern** — `src/components/meals/IngredientRow.tsx:34-42` and `src/components/meals/IngredientPickerSheet.tsx:133-141` both cast `item.category as 'vegetables' | 'proteins' | 'pantry' | 'fruits' | 'spices' | 'cleaning'`. This inline union should be `IngredientCategory` (already imported in `IngredientRow` but not in `IngredientPickerSheet`). The cast is unnecessary if `LibraryIngredient.category` were typed as `IngredientCategory` instead of `string`.

2. **Input styling classes** — The same long Tailwind class string for form inputs is repeated in `CreateMealSheet.tsx:72`, `IngredientForm.tsx:140,156,167`, `IngredientPickerSheet.tsx:104,181`, `MealsPage.tsx:98`. Should be extracted into a shared utility class or a reusable `<Input>` component.

## Orphaned / Unused Code

1. **`updateIngredient` function** — `src/lib/meals.ts:158-173` exports `updateIngredient` but it is never imported or called anywhere in the codebase. Dead code.

2. **`formatPrompt` in `prompts.ts`** — `src/lib/prompts.ts:13-18` is exported and used only once by `ai.ts`. Not orphaned per se, but worth noting the function has no usage in any other context.

3. **`getMealIngredientCounts` may become dead code** — If the N+1 issue is refactored into a grouped query, this function would be orphaned. Currently still used by `MealsPage.tsx:7`.

## Guideline Violations

1. **Hardcoded strings not using `t()` from useTranslation** — The coding guideline states: "All text uses `t()` from useTranslation". The following are hardcoded English strings:

   - `src/components/meals/IngredientForm.tsx:189` — `"Detecting category..."`
   - `src/components/meals/IngredientPickerSheet.tsx:121` — `'No matching ingredients.'`
   - `src/components/meals/IngredientPickerSheet.tsx:194` — `"Add"` (button text)
   - `src/components/meals/MealDetailPage.tsx:90` — `"Meal not found."`
   - `src/components/meals/MealCard.tsx:11-27` — All relative time strings (`"just now"`, `"m ago"`, `"h ago"`, `"d ago"`, `"w ago"`, `"mo ago"`, `"y ago"`)

2. **Import order inconsistency** — The guideline says: "Imports order: React → third-party → internal (`@/`) → relative". Several files mix the ordering:

   - `src/components/meals/MealCard.tsx:1-3` — `@/types` (internal) comes before `@/hooks` and `@/lib`, which are also internal. The `@/types` import should come after `@/hooks` since it's not in the correct group order.
   - `src/components/meals/IngredientForm.tsx:1-9` — React → `@/hooks` → `@/lib` → `@/types` → `@/components`. Types and components are both internal but the order is inconsistent with other files.

3. **`useEffect` for debounced API call** — `src/components/meals/IngredientForm.tsx:82-87` uses `useEffect` to trigger AI category detection when the ingredient name changes. The guideline says: "Never use `useEffect` for data fetching — use TanStack Query instead." While this is a debounced side-effect rather than traditional data fetching, the idiomatic approach would be to use `useQuery` with a debounced input or a mutation triggered by a callback.

## Missing Test Coverage

No test files exist under `src/components/meals/` or `src/lib/meals.test.ts`. The plan specified:

| Missing Test File | What It Should Cover |
|---|---|
| `MealsPage.test.tsx` | Renders meal list from query; shows empty state; search filters meals; FAB visible on mobile; click FAB opens create sheet |
| `MealCard.test.tsx` | Renders icon, name, ingredient count, relative time; tap navigates to detail; trash icon visible on desktop |
| `MealDetailPage.test.tsx` | Renders meal name and ingredients; edit name button works; add ingredient button opens picker; ingredient rows show category badge |
| `DeleteMealDialog.test.tsx` | Renders meal name in confirmation; cancel closes dialog; delete calls mutation and navigates back |
| `IngredientPickerSheet.test.tsx` | Renders library section; search filters library; tapping "+" opens quantity prompt; add new section renders form; save calls mutation |
| `IngredientForm.test.tsx` | Renders pre-filled values on edit; unit select works; AI category chip appears on new name; manual category override works; save button disabled when required fields empty |
| `CategoryBadge.test.tsx` | Renders correct color for each category; renders correct icon |
| `SwipeableCard.test.tsx` | Swipe left reveals delete area; tap delete triggers callback; swipe right resets |
| `meals.test.ts` | All lib functions: CRUD, library dedup, error handling |

## Requirement Gaps

1. **[Req 9] Edit Ingredient — NOT IMPLEMENTED** — Requirement states: "Tapping an existing ingredient in the detail view opens the same 'new ingredient' component, pre-filled with the current values. User can update name, quantity, unit, or category. If the name is changed, AI re-classifies." The `IngredientForm` component supports the `ingredient` prop for pre-filling, but `MealDetailPage` passes a noop `onEdit` handler. The `IngredientPickerSheet` is never opened for edit mode.

2. **[Req 9] AI re-classification on name change during edit** — Even if edit were wired up, the current `IngredientForm` AI detection only auto-sets the category for new ingredients (`if (!ingredient)` at line 69). For edits, it sets `aiSuggestion` but doesn't auto-apply it, which is correct per the requirement ("tap to change"), but needs the edit flow to be implemented first.

3. **[Req 3] Create meal → navigate to detail with ingredient picker open** — Requirement: "After entering the name, the user is taken to the meal detail page with the ingredient picker open." `CreateMealSheet.tsx:41` navigates to `/meals/$mealId` but does NOT open the ingredient picker. The `isPickerOpen` state is local to `MealDetailPage` and defaults to `false`. Should use a search param like `?addIngredient=true` to signal the picker should be open.

4. **[DATABASE.md] Schema documentation not updated** — `docs/DATABASE.md:53-64` does not list the `icon` column on the `meals` table, despite the migration adding it. Should be updated for documentation accuracy.

## Suggested Enhancements

1. **Refactor `getMealIngredientCounts` into a single query** — Use a Supabase RPC or a grouped/aggregated query instead of N+1 queries:
   ```sql
   SELECT meal_id, count(*) as count
   FROM meal_ingredients
   WHERE meal_id IN (SELECT id FROM meals WHERE household_id = $1)
   GROUP BY meal_id
   ```

2. **Type `LibraryIngredient.category` as `IngredientCategory`** — Currently `string`, which forces inline type casts in `IngredientRow` and `IngredientPickerSheet`. Changing it to `IngredientCategory` eliminates the casts and provides type safety.

3. **Extract shared input component** — The repeated input Tailwind classes should be extracted into a reusable `<Input>` component in `src/components/ui/`.

4. **Add `editIngredientTitle` i18n key** — Add to all three locale files (`en.json`, `es.json`, `fr.json`).

5. **Add i18n for hardcoded strings** — Add keys for `Detecting category...`, `No matching ingredients.`, `Add` button, `Meal not found.`, and the relative time strings.

6. **Fix the `SwipeableCard` transition toggle** — Either use state instead of ref for `isSwiping`, or use a `data-swiping` attribute to toggle the transition class via CSS.

7. **Pass `openPicker` via route search params** — To fulfill the requirement of opening the ingredient picker after meal creation, add a search param (e.g., `?addIngredient=true`) and read it in `MealDetailPage`.

8. **Add error toasts for mutation failures** — `CreateMealSheet`, `IngredientPickerSheet`, `MealDetailPage` all catch errors with `console.error` but don't surface them to the user.

9. **Update `DATABASE.md`** — Add the `icon` column to the `meals` table documentation.

10. **Add tests** — All 9 component test files and 1 lib test file specified in the plan are missing.
