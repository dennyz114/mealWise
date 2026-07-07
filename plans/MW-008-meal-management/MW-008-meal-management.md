# MW-008 — Manage Meals — Technical Plan

## Technical Details

### Types (`src/types/meals.ts`)

Define the core data types mapping to the Supabase tables:

```ts
type Meal = {
  id: string
  householdId: string
  name: string
  icon: string        // Tabler icon name from fixed list
  createdBy: string
  createdAt: string
  updatedAt: string
}

type MealIngredient = {
  id: string
  mealId: string
  name: string
  quantity: number
  unit: string        // 'units' | 'kg' | 'l' | 'pack' | 'bunch' | 'can'
  category: string    // 'vegetables' | 'proteins' | 'pantry' | 'fruits' | 'spices' | 'cleaning'
  createdAt: string
}

type IngredientUnit = 'units' | 'kg' | 'l' | 'pack' | 'bunch' | 'can'

type IngredientCategory = 'vegetables' | 'proteins' | 'pantry' | 'fruits' | 'spices' | 'cleaning'

// For the ingredient library picker — aggregated across all meals
type LibraryIngredient = {
  name: string
  unit: string
  category: string
}
```

Add to `src/lib/queryKeys.ts`:
```ts
mealDetail: (mealId: string) => ['mealDetail', mealId] as const,
ingredientLibrary: (householdId: string) => ['ingredientLibrary', householdId] as const,
```

---

### Backend / Supabase

#### Lib: `src/lib/meals.ts`

All Supabase operations for meals and meal_ingredients.

| Function | Supabase Query | Notes |
|---|---|---|
| `getMeals(householdId)` | `meals` select `*`, eq `household_id`, order `updated_at` desc | Returns `Meal[]` |
| `getMealById(mealId)` | `meals` select `*, meal_ingredients(*)`, eq `id`, single | Returns `MealWithIngredients` (joined type) |
| `createMeal(householdId, name, icon, userId)` | `meals` insert | Returns created `Meal` |
| `updateMealName(mealId, name)` | `meals` update `name`, eq `id` | Updates `updated_at` via trigger or manual |
| `deleteMeal(mealId)` | `meals` delete, eq `id` | Cascades to `meal_ingredients` via FK |
| `addIngredient(mealId, ingredient)` | `meal_ingredients` insert | Returns created `MealIngredient` |
| `updateIngredient(ingredientId, updates)` | `meal_ingredients` update, eq `id` | Partial update |
| `deleteIngredient(ingredientId)` | `meal_ingredients` delete, eq `id` | |
| `getIngredientLibrary(householdId)` | `meal_ingredients` select `name, unit, category`, join via `meals.household_id`, deduplicate by name | Returns `LibraryIngredient[]` |

**Meal icon assignment**: Random selection from a fixed array at creation time:
```ts
const MEAL_ICONS = ['ti-meat', 'ti-fish', 'ti-leaf', 'ti-soup', 'ti-chicken', 'ti-egg', 'ti-bread', 'ti-cheese']
```
Pick one randomly when `createMeal` is called. Store in the `icon` column. (Note: the `meals` table in DATABASE.md doesn't have an `icon` column — this needs to be added via migration.)

**Ingredient library query**: A single query that gets all distinct ingredient names from all meals in the household. Use Supabase's `select` with a join:

```ts
const { data, error } = await supabase
  .from('meal_ingredients')
  .select('name, unit, category, meal:meals!inner(household_id)')
  .eq('meal.household_id', householdId)
```

Then deduplicate client-side by `name` (keep the most recent occurrence for unit/category).

#### Database Migration

Add `icon` column to `meals` table:
```sql
ALTER TABLE meals ADD COLUMN icon text NOT NULL DEFAULT 'ti-soup';
```

#### RLS Policies

Ensure RLS is enabled on `meals` and `meal_ingredients`. Users can only read/write data for households they belong to. The existing pattern from `households` RLS should be extended:
- `meals`: `WHERE household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())`
- `meal_ingredients`: `WHERE meal_id IN (SELECT id FROM meals WHERE household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid()))`

---

### Frontend

#### Route: `src/routes/_authenticated/meals.tsx`

Replace the placeholder with the full `MealsPage` component. The route stays as a single file that renders the page component:

```ts
export const Route = createFileRoute('/_authenticated/meals')({
  component: MealsPage,
})
```

#### Route: `src/routes/_authenticated/meals.$mealId.tsx`

New nested route for the meal detail view. Uses TanStack Router's `createFileRoute` with the `$mealId` param:

```ts
export const Route = createFileRoute('/_authenticated/meals/$mealId')({
  component: MealDetailPage,
})
```

#### Components

| Component | File | Description |
|---|---|---|
| `MealsPage` | `src/components/meals/MealsPage.tsx` | Top-level page: search bar + meal list + FAB. Uses `useQuery` with `queryKeys.meals(householdId)`. |
| `MealCard` | `src/components/meals/MealCard.tsx` | Card showing meal icon, name, ingredient count, "Updated X ago". Mobile: swipe-to-delete wrapper. Desktop: visible trash icon. |
| `MealList` | `src/components/meals/MealList.tsx` | Renders grid of `MealCard`s. Mobile: single column. Desktop: 2-column grid. Handles empty state. |
| `MealDetailPage` | `src/components/meals/MealDetailPage.tsx` | Meal name + ingredient list. Uses `useQuery` with `queryKeys.mealDetail(mealId)`. Edit name button, add ingredient button. |
| `IngredientRow` | `src/components/meals/IngredientRow.tsx` | Single ingredient row: name, quantity, unit, category badge, trash icon. Tap opens edit sheet. |
| `CategoryBadge` | `src/components/meals/CategoryBadge.tsx` | Colored badge for ingredient category. Uses CSS custom properties from `index.css` (`--color-cat-*-bg/text`). |
| `CreateMealSheet` | `src/components/meals/CreateMealSheet.tsx` | BottomSheet with name input. On submit, creates meal and navigates to detail page with ingredient picker open. |
| `DeleteMealDialog` | `src/components/meals/DeleteMealDialog.tsx` | Confirmation dialog: "Delete [meal name]?..." with Cancel/Delete buttons. |
| `IngredientPickerSheet` | `src/components/meals/IngredientPickerSheet.tsx` | BottomSheet with search bar, "FROM YOUR LIBRARY" list, "OR ADD NEW" section. Reuses `BottomSheet` from `src/components/ui/bottom-sheet.tsx`. |
| `IngredientForm` | `src/components/meals/IngredientForm.tsx` | Shared form for add/edit ingredient. Fields: name, quantity, unit (select), category (AI chip or manual select). Used inside `IngredientPickerSheet`. |
| `SwipeableCard` | `src/components/meals/SwipeableCard.tsx` | Touch-enabled swipe-left-to-reveal pattern. Uses CSS `transform` + `touch-action`. No external library needed. |

#### Key UI Patterns

**Swipe-to-delete (mobile)**:
- CSS-based swipe using `touch-action: pan-y` and `transform: translateX()` on touch move
- Reveals a red-tinted trash icon area behind the card
- On tap of trash icon, opens `DeleteMealDialog`
- Implemented in `SwipeableCard` wrapper component

**FAB (mobile)**:
- Fixed position bottom-right, above the `BottomTabBar`
- Uses accent color, pill shape, "+" icon
- Pattern from `STYLING.md`: `background: var(--color-accent)`, `border-radius: 24px`, `height: 44px`

**Category badge colors**:
- Map category strings to CSS variable pairs using a lookup object:
```ts
const CATEGORY_STYLES: Record<IngredientCategory, { bg: string; text: string; icon: string }> = {
  vegetables: { bg: 'var(--color-cat-veg-bg)', text: 'var(--color-cat-veg-text)', icon: 'ti-plant-2' },
  proteins:   { bg: 'var(--color-cat-protein-bg)', text: 'var(--color-cat-protein-text)', icon: 'ti-meat' },
  pantry:     { bg: 'var(--color-cat-pantry-bg)', text: 'var(--color-cat-pantry-text)', icon: 'ti-package' },
  fruits:     { bg: 'var(--color-cat-fruit-bg)', text: 'var(--color-cat-fruit-text)', icon: 'ti-apple' },
  spices:     { bg: 'var(--color-cat-spice-bg)', text: 'var(--color-cat-spice-text)', icon: 'ti-sparkles' },
  cleaning:   { bg: 'var(--color-cat-clean-bg)', text: 'var(--color-cat-clean-text)', icon: 'ti-droplet' },
}
```

**AI category detection**:
- New file: `src/lib/ai.ts` — wraps Anthropic API call
- New file: `src/lib/prompts.ts` — holds the prompt template
- Call happens in `IngredientForm` when user types a new ingredient name
- Debounce 500ms before calling AI
- Show loading spinner on the category chip while AI is running
- If AI fails, show manual category selector as fallback
- Never block the UI — allow user to override AI suggestion

#### AI Integration: `src/lib/ai.ts`

```ts
export const detectCategory = async (ingredientName: string): Promise<IngredientCategory> => {
  // POST to Anthropic API with the prompt from prompts.ts
  // Timeout: 10 seconds
  // On failure: return 'pantry' as default (user can override)
}
```

#### AI Prompt: `src/lib/prompts.ts`

```ts
export const CATEGORY_DETECTION_PROMPT = `
Given an ingredient name, classify it into one of these categories:
- vegetables
- proteins
- pantry
- fruits
- spices
- cleaning

Return ONLY the category name, nothing else.

Ingredient: {name}
`
```

#### i18n Keys

Add to `en.json`, `es.json`, `fr.json`:

```json
{
  "meals": {
    "title": "Meals",
    "searchPlaceholder": "Search meals...",
    "emptyTitle": "No meals yet",
    "emptyDescription": "Create your first meal to get started.",
    "newMeal": "New meal",
    "createTitle": "New meal",
    "nameLabel": "Meal name",
    "namePlaceholder": "e.g. Chicken stir-fry",
    "createButton": "Create meal",
    "ingredientCount": "{count} ingredients",
    "ingredientCount_one": "1 ingredient",
    "updatedAgo": "Updated {time}",
    "deleteTitle": "Delete {name}?",
    "deleteDescription": "This meal will be removed from your library. Any menus using it won't be affected.",
    "deleteButton": "Delete",
    "cancelButton": "Cancel",
    "editName": "Edit name",
    "addIngredient": "Add ingredient",
    "ingredientsTitle": "Ingredients",
    "noIngredients": "No ingredients yet. Tap below to add one.",
    "fromLibrary": "FROM YOUR LIBRARY",
    "orAddNew": "OR ADD NEW",
    "searchIngredients": "Search ingredients...",
    "ingredientName": "Ingredient name",
    "quantity": "Quantity",
    "unit": "Unit",
    "category": "Category",
    "aiSuggests": "AI suggests: {category}",
    "tapToChange": "Tap to change",
    "saveIngredient": "Save ingredient",
    "saving": "Saving...",
    "libraryEmpty": "No ingredients in your library yet."
  },
  "units": {
    "units": "units",
    "kg": "kg",
    "l": "L",
    "pack": "pack",
    "bunch": "bunch",
    "can": "can"
  },
  "categories": {
    "vegetables": "Vegetables",
    "proteins": "Proteins",
    "pantry": "Pantry",
    "fruits": "Fruits",
    "spices": "Spices & condiments",
    "cleaning": "Cleaning supplies"
  }
}
```

---

## API Contracts

### Supabase Queries (in `src/lib/meals.ts`)

```
getMeals(householdId: string) → Meal[]
  supabase.from('meals').select('*').eq('household_id', householdId).order('updated_at', { ascending: false })

getMealById(mealId: string) → MealWithIngredients
  supabase.from('meals').select('*, meal_ingredients(*)').eq('id', mealId).single()

createMeal(householdId, name, icon, userId) → Meal
  supabase.from('meals').insert({ household_id, name, icon, created_by }).select().single()

updateMealName(mealId, name) → void
  supabase.from('meals').update({ name, updated_at: new Date().toISOString() }).eq('id', mealId)

deleteMeal(mealId) → void
  supabase.from('meals').delete().eq('id', mealId)

addIngredient(mealId, ingredient: { name, quantity, unit, category }) → MealIngredient
  supabase.from('meal_ingredients').insert({ meal_id, ...ingredient }).select().single()

updateIngredient(ingredientId, updates: Partial<{ name, quantity, unit, category }>) → void
  supabase.from('meal_ingredients').update(updates).eq('id', ingredientId)

deleteIngredient(ingredientId) → void
  supabase.from('meal_ingredients').delete().eq('id', ingredientId)

getIngredientLibrary(householdId) → LibraryIngredient[]
  supabase.from('meal_ingredients')
    .select('name, unit, category, meal:meals!inner(household_id)')
    .eq('meal.household_id', householdId)
  // Deduplicate client-side by name
```

### AI API (in `src/lib/ai.ts`)

```
detectCategory(ingredientName: string) → Promise<IngredientCategory>
  POST https://api.anthropic.com/v1/messages
  Body: { model: "claude-sonnet-4-20250514", max_tokens: 20, messages: [{ role: "user", content: prompt }] }
  Timeout: 10s
  On error: return 'pantry' (fallback)
```

---

## Essential Tests

### Frontend

| Test File | What It Covers |
|---|---|
| `MealsPage.test.tsx` | Renders meal list from query; shows empty state; search filters meals; FAB visible on mobile; click FAB opens create sheet |
| `MealCard.test.tsx` | Renders icon, name, ingredient count, relative time; tap navigates to detail; trash icon visible on desktop |
| `MealDetailPage.test.tsx` | Renders meal name and ingredients; edit name button works; add ingredient button opens picker; ingredient rows show category badge |
| `DeleteMealDialog.test.tsx` | Renders meal name in confirmation; cancel closes dialog; delete calls mutation and navigates back |
| `IngredientPickerSheet.test.tsx` | Renders library section; search filters library; tapping "+" opens quantity prompt; add new section renders form; save calls mutation |
| `IngredientForm.test.tsx` | Renders pre-filled values on edit; unit select works; AI category chip appears on new name; manual category override works; save button disabled when required fields empty |
| `CategoryBadge.test.tsx` | Renders correct color for each category; renders correct icon |
| `SwipeableCard.test.tsx` | Swipe left reveals delete area; tap delete triggers callback; swipe right resets |

### Backend (Supabase lib functions)

| Test File | What It Covers |
|---|---|
| `meals.test.ts` | `getMeals` returns meals for household; `getMealById` returns meal with ingredients; `createMeal` inserts with icon; `updateMealName` updates name; `deleteMeal` removes meal and cascades; `getIngredientLibrary` returns deduplicated ingredients; error cases throw properly |

### Integration / Edge Cases

- Creating a meal with no ingredients still persists it
- Deleting a meal that is referenced in a weekly menu does not error (menu keeps its reference)
- AI category detection failure falls back to manual selection
- Swipe-to-delete works correctly on touch devices (no accidental triggers)
- Ingredient library shows ingredients from all meals in the household, deduplicated by name
- Search filters only by meal name, not by ingredient name
- Mobile layout: single column cards; Desktop layout: 2-column grid
- "Updated X ago" uses relative time formatting (e.g., "2 hours ago", "yesterday")

---

## Implementation Order

1. **Types** — `src/types/meals.ts` + query key additions
2. **Database migration** — Add `icon` column to `meals` table
3. **Lib functions** — `src/lib/meals.ts` (CRUD + library query)
4. **AI integration** — `src/lib/ai.ts` + `src/lib/prompts.ts`
5. **i18n keys** — Add to all 3 locale files
6. **UI components** — CategoryBadge → MealCard → MealList → SwipeableCard → MealsPage
7. **Meal detail** — MealDetailPage → IngredientRow → IngredientForm
8. **Sheets/dialogs** — CreateMealSheet → DeleteMealDialog → IngredientPickerSheet
9. **Routes** — Update `meals.tsx`, create `meals.$mealId.tsx`
10. **Tests** — Unit tests for components and lib functions
