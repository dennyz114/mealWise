export type Meal = {
  id: string
  householdId: string
  name: string
  icon: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export type MealIngredient = {
  id: string
  mealId: string
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

export type LibraryIngredient = {
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
}

export type MealDraft = {
  mealName: string
  ingredients: TemporaryIngredient[]
  step: 'ingredients' | 'review'
  createdAt: number
}
