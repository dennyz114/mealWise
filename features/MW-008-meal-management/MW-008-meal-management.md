# MW-008 — Manage Meals

## Description
Lets users build and maintain their recipe library — browse all meals, view a single meal's ingredients, add new meals, and delete meals they no longer need. Meals are scoped to the household and each contains a name, an icon, and a list of ingredients.

## Requirements

### Meal List
- Display all meals in the household as cards showing: name, ingredient count, and "Updated X ago" timestamp
- Search bar filters meals by name (no ingredient search)
- Mobile: single-column card layout with swipe-to-delete (swipe left reveals trash icon in red tint; tap trash to confirm)
- Desktop: two-column card grid with trash icon visible on each card footer
- "+ New meal" button (FAB on mobile, inline button on desktop)

### Meal Card Icon
- Each meal has a randomly assigned icon from a fixed list (meat, fish, vegetables, soup, etc.)
- Icon is assigned once at creation and does not change

### Create Meal
- Tapping "+ New meal" prompts for a meal name first
- After entering the name, the user is taken to the meal detail page with the ingredient picker open, so they can start adding ingredients immediately
- Meal is created (with name and icon) as soon as the user enters the name — even if they add no ingredients yet

### Meal Detail
- Shows the meal name (editable via an "Edit name" button) and the full ingredient list
- Each ingredient row displays: name, quantity, unit, category badge, and a trash icon for removal
- "+ Add ingredient" button at the bottom opens the ingredient picker

### Delete Meal
- Mobile: swipe-to-delete on the list card (swipe left → tap trash icon)
- Desktop: trash icon on the card footer
- Confirmation dialog: "Delete [meal name]? This meal will be removed from your library. Any menus using it won't be affected."
- Two buttons: Cancel and Delete (no typing required)
- Deleting a meal does not affect existing weekly menus that reference it

### Add Ingredient — Pick Existing
- Bottom sheet (mobile) or modal (desktop) opens with a search bar at the top
- "FROM YOUR LIBRARY" section shows previously used ingredients in the household, each with: category badge, name, unit, and a "+" button
- Tapping "+" on an existing ingredient opens a minimal quantity-only prompt (name, unit, and category are pre-filled)
- Search filters the library list by ingredient name

### Add Ingredient — New
- Below the library list, "OR ADD NEW" section with a name input field
- When the user types a new ingredient name:
  - AI auto-classifies the category via Anthropic API
  - Category appears as a tappable chip ("AI suggests: Vegetables — tap to change")
  - User confirms quantity and selects unit from a fixed list
- Unit list: `units`, `kg`, `l`, `pack`, `bunch`, `can` (translatable via i18n)
- "Save ingredient" button adds the ingredient to the meal

### Edit Ingredient
- Tapping an existing ingredient in the detail view opens the same "new ingredient" component, pre-filled with the current values
- User can update name, quantity, unit, or category
- If the name is changed, AI re-classifies the category (with the same tappable override)

### Ingredient Storage
- Each ingredient is stored per-meal (no cross-meal sharing at the database level)
- Editing an ingredient in one meal does not affect other meals
- Ingredients in the "FROM YOUR LIBRARY" picker are derived from all ingredients across all meals in the household
