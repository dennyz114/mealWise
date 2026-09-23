export type Meal = {
  id: string
  householdId: string
  name: string
  icon: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

/** A meal↔library link, flattened with library fields for UI. */
export type MealIngredient = {
  id: string
  mealId: string
  ingredientId: string
  name: string
  quantity: number
  unit: string
  category: string
  createdAt: string
}

export type MealWithIngredients = Meal & {
  ingredients: MealIngredient[]
}

export type IngredientUnit = 'units' | 'kg' | 'l' | 'pack' | 'bunch' | 'can'

export type IngredientCategory =
  | 'vegetables'
  | 'proteins'
  | 'pantry'
  | 'fruits'
  | 'spices'
  | 'cleaning'

/** Canonical household ingredient from ingredient_library. */
export type LibraryIngredient = {
  id: string
  name: string
  unit: string
  category: IngredientCategory
}

export type TemporaryIngredient = {
  id: string
  name: string
  quantity: number
  unit: IngredientUnit
  category: IngredientCategory
  isExisting: boolean
  /** Set when picking from the library so we can link by id. */
  libraryIngredientId?: string
}
