import { supabase } from './supabase'
import type {
  Meal,
  MealWithIngredients,
  MealIngredient,
  LibraryIngredient,
} from '@/types/meals'

const MEAL_ICONS = [
  'ti-meat',
  'ti-fish',
  'ti-leaf',
  'ti-soup',
  'ti-chicken',
  'ti-egg',
  'ti-bread',
  'ti-cheese',
]

const getRandomIcon = (): string =>
  MEAL_ICONS[Math.floor(Math.random() * MEAL_ICONS.length)] ?? 'ti-soup'

const mapMeal = (row: {
  id: string
  household_id: string
  name: string
  icon: string
  created_by: string
  created_at: string
  updated_at: string
}): Meal => ({
  id: row.id,
  householdId: row.household_id,
  name: row.name,
  icon: row.icon,
  createdBy: row.created_by,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

const mapIngredient = (row: {
  id: string
  meal_id: string
  name: string
  quantity: number
  unit: string
  category: string
  created_at: string
}): MealIngredient => ({
  id: row.id,
  mealId: row.meal_id,
  name: row.name,
  quantity: row.quantity,
  unit: row.unit,
  category: row.category,
  createdAt: row.created_at,
})

export const getMeals = async (householdId: string): Promise<Meal[]> => {
  const { data, error } = await supabase
    .from('meals')
    .select('id, household_id, name, icon, created_by, created_at, updated_at')
    .eq('household_id', householdId)
    .order('updated_at', { ascending: false })

  if (error) throw error

  return data.map(mapMeal)
}

export const getMealById = async (mealId: string): Promise<MealWithIngredients> => {
  const { data: meal, error: mealError } = await supabase
    .from('meals')
    .select('id, household_id, name, icon, created_by, created_at, updated_at')
    .eq('id', mealId)
    .single()

  if (mealError) throw mealError
  if (!meal) throw new Error('Meal not found')

  const { data: ingredients, error: ingredientsError } = await supabase
    .from('meal_ingredients')
    .select('id, meal_id, name, quantity, unit, category, created_at')
    .eq('meal_id', mealId)

  if (ingredientsError) throw ingredientsError

  return {
    ...mapMeal(meal),
    ingredients: (ingredients ?? []).map(mapIngredient),
  }
}

export const createMeal = async (
  householdId: string,
  name: string,
  userId: string,
): Promise<Meal> => {
  const icon = getRandomIcon()

  const { data, error } = await supabase
    .from('meals')
    .insert({
      household_id: householdId,
      name,
      icon,
      created_by: userId,
    })
    .select('id, household_id, name, icon, created_by, created_at, updated_at')
    .single()

  if (error) throw error
  if (!data) throw new Error('Failed to create meal')

  return mapMeal(data)
}

export const updateMealName = async (
  mealId: string,
  name: string,
): Promise<void> => {
  const { error } = await supabase
    .from('meals')
    .update({ name, updated_at: new Date().toISOString() })
    .eq('id', mealId)

  if (error) throw error
}

export const deleteMeal = async (mealId: string): Promise<void> => {
  const { error } = await supabase.from('meals').delete().eq('id', mealId)

  if (error) throw error
}

const updateMealTimestamp = async (mealId: string): Promise<void> => {
  const { error } = await supabase
    .from('meals')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', mealId)

  if (error) throw error
}

export const addIngredient = async (
  mealId: string,
  ingredient: { name: string; quantity: number; unit: string; category: string },
): Promise<MealIngredient> => {
  const { data, error } = await supabase
    .from('meal_ingredients')
    .insert({
      meal_id: mealId,
      name: ingredient.name,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      category: ingredient.category,
    })
    .select('id, meal_id, name, quantity, unit, category, created_at')
    .single()

  if (error) throw error
  if (!data) throw new Error('Failed to add ingredient')

  await updateMealTimestamp(mealId)

  return mapIngredient(data)
}

export const updateIngredient = async (
  ingredientId: string,
  updates: Partial<{
    name: string
    quantity: number
    unit: string
    category: string
  }>,
): Promise<void> => {
  // Get the meal_id first to update the parent meal's timestamp
  const { data: ingredient, error: fetchError } = await supabase
    .from('meal_ingredients')
    .select('meal_id')
    .eq('id', ingredientId)
    .single()

  if (fetchError) throw fetchError

  const { error } = await supabase
    .from('meal_ingredients')
    .update(updates)
    .eq('id', ingredientId)

  if (error) throw error

  if (ingredient) {
    await updateMealTimestamp(ingredient.meal_id)
  }
}

export const deleteIngredient = async (ingredientId: string): Promise<void> => {
  // Get the meal_id first to update the parent meal's timestamp
  const { data: ingredient, error: fetchError } = await supabase
    .from('meal_ingredients')
    .select('meal_id')
    .eq('id', ingredientId)
    .single()

  if (fetchError) throw fetchError

  const { error } = await supabase
    .from('meal_ingredients')
    .delete()
    .eq('id', ingredientId)

  if (error) throw error

  if (ingredient) {
    await updateMealTimestamp(ingredient.meal_id)
  }
}

export const getMealIngredientCounts = async (
  householdId: string,
): Promise<Record<string, number>> => {
  const { data: meals, error: mealsError } = await supabase
    .from('meals')
    .select('id')
    .eq('household_id', householdId)

  if (mealsError) throw mealsError
  if (!meals || meals.length === 0) return {}

  const mealIds = meals.map((m) => m.id)

  const { data: ingredients, error: ingredientsError } = await supabase
    .from('meal_ingredients')
    .select('meal_id')
    .in('meal_id', mealIds)

  if (ingredientsError) throw ingredientsError

  const counts: Record<string, number> = {}
  for (const meal of meals) {
    counts[meal.id] = 0
  }
  for (const ing of ingredients ?? []) {
    counts[ing.meal_id] = (counts[ing.meal_id] ?? 0) + 1
  }
  return counts
}

export const getIngredientLibrary = async (
  householdId: string,
): Promise<LibraryIngredient[]> => {
  const { data, error } = await supabase
    .from('meal_ingredients')
    .select('name, unit, category, meal:meals!inner(household_id)')
    .eq('meal.household_id', householdId)

  if (error) throw error

  // Deduplicate by ingredient name, keeping the last occurrence
  const seen = new Map<string, LibraryIngredient>()

  for (const row of data ?? []) {
    seen.set(row.name, {
      name: row.name,
      unit: row.unit,
      category: row.category,
    })
  }

  return Array.from(seen.values())
}
