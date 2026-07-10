# MW-008 — Add Meal Flow

## Overview

Redesign the add meal flow to use a 3-step wizard with progress indicators, ingredient review, and a success confirmation screen. The flow supports adding multiple ingredients before creation, saves drafts if interrupted, and provides clear visual feedback at each step.

---

## User Stories

1. As a user, I want to create a meal by entering a name first, then adding ingredients, so I can organize my cooking plans.
2. As a user, I want to add multiple ingredients in one session before finalizing the meal, so I don't have to open the picker repeatedly.
3. As a user, I want to see my progress through the creation flow, so I know how many steps remain.
4. As a user, I want to review all ingredients before creating the meal, so I can catch mistakes.
5. As a user, I want to see a confirmation screen after creation, so I know the meal was saved successfully.
6. As a user, if I close the wizard early, I want my progress saved as a draft, so I can resume later.

---

## Flow Description

### Mobile Flow (Bottom Sheet)

#### Step 1 — Meal Name
1. User taps FAB (floating action button) at bottom-right
2. Bottom sheet opens with:
   - Title: "New meal"
   - Progress dots (3 dots, 1st active) in top-right
   - Meal name input with placeholder "e.g. Ají de gallina"
   - Helper text: "Give your meal a clear name. You'll add ingredients next."
   - "Continue" button (primary, full-width)
   - "Cancel" button (secondary, full-width)
3. User enters name and taps "Continue"
4. Sheet transitions to Step 2 (no close/reopen)

#### Step 2 — Add Ingredients
1. Sheet content updates to ingredient picker
2. Header shows:
   - Meal name as title (e.g., "Ají de gallina")
   - Progress dots (2nd active)
3. Search bar: "Search ingredients..."
4. **FROM YOUR LIBRARY** section:
   - List of existing household ingredients
   - Each row: category badge + name + unit + purple "+" button
   - Tapping "+" opens **inline quantity expansion** below the row:
     - "Unit: {unit} — how many do you need?"
     - Quantity input (default: 1)
     - "Add to meal" and "Cancel" buttons
     - On confirm: ingredient added to temporary list, expansion closes
5. **OR ADD NEW INGREDIENT** section:
   - Name input: "Type a new ingredient..."
   - Tapping into the input (or after typing) reveals full form:
     - Name (pre-filled if typed)
     - Quantity + Unit (side by side)
     - AI suggests category with "tap to change" chip
     - "Add to meal" and "Cancel" buttons
6. User can add **multiple ingredients** (each add returns to Step 2 view)
7. "Next" button at bottom (enabled when ≥1 ingredient added)
8. "Cancel" button to exit (saves draft)

#### Step 2a — Inline Qty Prompt (Existing Ingredient)
- Expands below the tapped ingredient row
- Shows: ingredient name, category badge, unit info
- Quantity input with default value of 1
- "Add to meal" confirms and collapses expansion
- "Cancel" collapses without adding

#### Step 2b — New Ingredient Form
- Expands below the "OR ADD NEW" section
- Fields: Name, Quantity, Unit (side by side)
- AI category suggestion with tap-to-change
- "Add to meal" adds to temporary list and collapses form
- "Cancel" collapses without adding

#### Step 3 — Review
1. Sheet content updates to review screen
2. Header shows:
   - Meal name as title
   - Progress dots (3rd active)
3. "INGREDIENTS ADDED — {count}" label
4. Ingredient list:
   - Each row: category badge + name + quantity + unit + trash icon
   - Tapping trash removes ingredient from list
5. "+ Add another ingredient" button (returns to Step 2)
6. "Create meal" button (teal/green color, distinct from purple)
7. "Back" button (returns to Step 2, ingredients preserved)

#### Success Screen
1. Green checkmark icon (large, centered)
2. "{Meal name} added" heading
3. "{count} ingredients saved." subtext
4. Ingredient name badges (color-coded, horizontal wrap)
5. Two buttons:
   - "Back to meals" (secondary)
   - "→ View meal" (primary)
6. Tapping "View meal" navigates to `/meals/{mealId}`
7. Tapping "Back to meals" closes sheet and stays on meal list

---

### Desktop Flow (Centered Modal)

#### Step 1 — Meal Name
1. User clicks "New Meal" button in page header
2. Centered modal opens with:
   - Title: "New meal"
   - Progress dots (3 dots, 1st active) + close (X) button in top-right
   - Same content as mobile Step 1
3. User enters name and clicks "Continue"
4. Modal transitions to Step 2

#### Step 2 — Add Ingredients
1. Modal content updates (same centered modal, taller if needed)
2. Header: meal name + progress dots (2nd active) + close (X)
3. Same content as mobile Step 2, but:
   - Library list fully visible (no sub-modal for qty)
   - Tapping "+" opens **inline expansion below the row** (same as mobile)
   - No bottom sheet handle bar
4. "Next" and "Cancel" buttons at bottom

#### Step 3 — Review
1. Modal content updates
2. Header: meal name + progress dots (3rd active) + close (X)
3. Same content as mobile Step 3
4. "Create meal" button is teal with checkmark icon

#### Success Screen
1. Same content as mobile success
2. Two buttons: "Back to meals" + "→ View meal"
3. URL updates to `/meals/{mealId}` when "View meal" is clicked
4. Clicking "Back to meals" closes modal, URL remains `/meals`

---

## Draft Handling

When user closes the wizard before completing (at Step 2 or Step 3):

1. A draft is saved to `localStorage` with key `mealDraft_{householdId}`
2. Draft contains:
   - `mealName`: string
   - `ingredients`: Array of temporary ingredient objects
   - `step`: current step (2 or 3)
   - `createdAt`: timestamp
3. When user reopens the "New meal" wizard:
   - Check for existing draft
   - If draft exists and is < 24 hours old, offer to resume or start fresh
   - If user resumes, restore name and ingredients to the appropriate step
   - If user starts fresh or draft is > 24 hours old, clear draft
4. Draft is cleared when:
   - Meal is successfully created
   - User explicitly chooses "Start fresh"
   - Draft is older than 24 hours

---

## Component Requirements

### New/Modified Components

| Component | Purpose | Location |
|-----------|---------|----------|
| `CreateMealWizard.tsx` | Main wizard container, manages step state and transitions | `src/components/meals/` |
| `MealNameStep.tsx` | Step 1: meal name input | `src/components/meals/` |
| `IngredientPickerStep.tsx` | Step 2: ingredient library + add new | `src/components/meals/` |
| `IngredientReviewStep.tsx` | Step 3: review added ingredients | `src/components/meals/` |
| `MealSuccessScreen.tsx` | Success confirmation after creation | `src/components/meals/` |
| `StepProgress.tsx` | 3-dot progress indicator | `src/components/ui/` |
| `InlineQtyPrompt.tsx` | Quantity input for existing ingredients | `src/components/meals/` |

### Existing Components (Modified)

| Component | Changes |
|-----------|---------|
| `MealsPage.tsx` | Update FAB/button to open `CreateMealWizard` instead of `CreateMealSheet` |
| `BottomSheet.tsx` | Add `step` prop support for step transitions without close/reopen |
| `IngredientPickerSheet.tsx` | Refactor to work within wizard context, remove standalone mode |

### Retired Components

| Component | Reason |
|-----------|--------|
| `CreateMealSheet.tsx` | Replaced by `CreateMealWizard` |

---

## State Management

### Wizard State (in `CreateMealWizard.tsx`)

```typescript
type WizardStep = 'name' | 'ingredients' | 'review' | 'success'

interface WizardState {
  step: WizardStep
  mealName: string
  ingredients: TemporaryIngredient[]
  createdMealId: string | null
}

interface TemporaryIngredient {
  id: string // client-generated UUID for temp tracking
  name: string
  quantity: number
  unit: IngredientUnit
  category: IngredientCategory
  isExisting: boolean // true if picked from library
  libraryId?: string // original library ingredient id
}
```

### Draft State (localStorage)

```typescript
interface MealDraft {
  mealName: string
  ingredients: TemporaryIngredient[]
  step: 'ingredients' | 'review'
  createdAt: number
}
```

---

## Supabase Changes

### New Function: `createMealWithIngredients`

Create meal and all ingredients in a single transaction:

```typescript
export const createMealWithIngredients = async (
  householdId: string,
  name: string,
  userId: string,
  ingredients: Omit<MealIngredient, 'id' | 'meal_id' | 'created_at'>[]
): Promise<MealWithIngredients> => {
  // 1. Create meal
  // 2. Create all ingredients in parallel
  // 3. Return meal with ingredients
}
```

### Modified Functions

| Function | Change |
|----------|--------|
| `createMeal` | Keep for backward compatibility, but new flow uses `createMealWithIngredients` |
| `addIngredient` | No change (still used for editing existing meals) |

---

## Edge Cases & Error Handling

| Scenario | Handling |
|----------|----------|
| User closes wizard at Step 1 | No draft saved, sheet closes |
| User closes wizard at Step 2/3 | Save draft to localStorage |
| Draft exists but > 24 hours old | Show "Start fresh" option, clear old draft |
| Network error during creation | Show error toast, keep wizard open, allow retry |
| AI category detection fails | Default to 'pantry', show manual category picker |
| User tries to create meal with 0 ingredients | Disable "Create meal" button, show hint |
| User removes all ingredients in Step 3 | Disable "Create meal" button, show "+ Add another ingredient" prompt |
| Duplicate ingredient name in list | Allow (user may need same ingredient twice with different quantities) |
| Extremely long meal name | Truncate display in header with ellipsis, allow full name in input |
| Sheet resize during step transition | Animate height change smoothly |

---

## Acceptance Criteria

### Step 1 — Meal Name
- [ ] FAB (mobile) / Button (desktop) opens wizard
- [ ] Sheet/modal shows meal name input with placeholder
- [ ] Progress dots show 1 of 3 active
- [ ] "Continue" disabled when name is empty
- [ ] "Continue" transitions to Step 2 without closing sheet
- [ ] "Cancel" closes sheet without saving

### Step 2 — Add Ingredients
- [ ] Meal name displayed as title
- [ ] Progress dots show 2 of 3 active
- [ ] Search bar filters library ingredients by name
- [ ] Library ingredients show category badge, name, unit, "+" button
- [ ] Tapping "+" opens inline quantity expansion
- [ ] Qty expansion shows unit info and quantity input (default: 1)
- [ ] "Add to meal" adds ingredient to temporary list and collapses expansion
- [ ] "Cancel" collapses expansion without adding
- [ ] "OR ADD NEW" section allows typing new ingredient name
- [ ] New ingredient form shows name, qty, unit, AI category suggestion
- [ ] AI category suggestion can be tapped to override
- [ ] "Add to meal" adds new ingredient and collapses form
- [ ] Multiple ingredients can be added in sequence
- [ ] "Next" button enabled when ≥1 ingredient added
- [ ] "Cancel" saves draft and closes

### Step 3 — Review
- [ ] Meal name displayed as title
- [ ] Progress dots show 3 of 3 active
- [ ] Ingredient count displayed (e.g., "INGREDIENTS ADDED — 4")
- [ ] Each ingredient shows category badge, name, qty + unit, trash icon
- [ ] Tapping trash removes ingredient from list
- [ ] "+ Add another ingredient" returns to Step 2
- [ ] Ingredients preserved when returning from Step 2
- [ ] "Create meal" button is teal/green (not purple)
- [ ] "Create meal" disabled when 0 ingredients
- [ ] "Back" returns to Step 2 with ingredients intact

### Success Screen
- [ ] Green checkmark icon displayed
- [ ] Meal name shown in heading
- [ ] Ingredient count shown
- [ ] Ingredient badges displayed
- [ ] "→ View meal" navigates to meal detail
- [ ] "Back to meals" closes wizard, stays on list
- [ ] Desktop: URL updates to meal route on "View meal"

### Draft Handling
- [ ] Draft saved when closing at Step 2 or 3
- [ ] Draft includes meal name, ingredients, step, timestamp
- [ ] Resuming draft restores state correctly
- [ ] Drafts > 24 hours old are cleared
- [ ] Draft cleared on successful meal creation

### Responsive Behavior
- [ ] Mobile: bottom sheet with handle bar
- [ ] Desktop: centered modal with close (X) button
- [ ] Step transitions animate smoothly
- [ ] Inline qty expansion works on both mobile and desktop
- [ ] Min tap target 44x44px for all interactive elements

---

## Related Documents

- Current feature spec: [MW-008 — Manage Meals](../MW-008-meal-management/MW-008-meal-management.md)
- Database schema: [DATABASE.md](../../docs/DATABASE.md)
- Coding guidelines: [CODING_GUIDELINES.md](../../docs/CODING_GUIDELINES.md)
