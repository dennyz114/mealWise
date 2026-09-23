import { supabase } from './supabase'
import type {
  Meal,
  MealWithIngredients,
  MealIngredient,
  LibraryIngredient,
  TemporaryIngredient,
  IngredientCategory,
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

type MealIngredientRow = {
  id: string
  meal_id: string
  ingredient_id: string
  quantity: number
  created_at: string
  ingredient:
    | {
        id: string
        name: string
        unit: string
        category: string
      }
    | {
        id: string
        name: string
        unit: string
        category: string
      }[]
    | null
}

const unwrapIngredient = (row: MealIngredientRow) => {
  const linked = Array.isArray(row.ingredient)
    ? (row.ingredient[0] ?? null)
    : row.ingredient

  if (!linked) {
    throw new Error('Meal ingredient is missing library data')
  }

  return linked
}

const mapMealIngredient = (row: MealIngredientRow): MealIngredient => {
  const linked = unwrapIngredient(row)

  return {
    id: row.id,
    mealId: row.meal_id,
    ingredientId: row.ingredient_id,
    name: linked.name,
    quantity: Number(row.quantity),
    unit: linked.unit,
    category: linked.category,
    createdAt: row.created_at,
  }
}

const MEAL_INGREDIENT_SELECT =
  'id, meal_id, ingredient_id, quantity, created_at, ingredient:ingredient_library(id, name, unit, category)'

const upsertLibraryIngredient = async (
  householdId: string,
  ingredient: { name: string; unit: string; category: string },
): Promise<{ id: string; name: string; unit: string; category: string }> => {
  const { data, error } = await supabase
    .from('ingredient_library')
    .upsert(
      {
        household_id: householdId,
        name: ingredient.name.trim(),
        unit: ingredient.unit,
        category: ingredient.category,
      },
      { onConflict: 'household_id,name' },
    )
    .select('id, name, unit, category')
    .single()

  if (error) throw error
  if (!data) throw new Error('Failed to upsert ingredient library item')

  return data
}

const getMealHouseholdId = async (mealId: string): Promise<string> => {
  const { data, error } = await supabase
    .from('meals')
    .select('household_id')
    .eq('id', mealId)
    .single()

  if (error) throw error
  if (!data) throw new Error('Meal not found')

  return data.household_id
}

export const getMeals = async (householdId: string): Promise<Meal[]> => {
  const { data, error } = await supabase
    .from('meals')
    .select('id, household_id, name, icon, created_by, created_at, updated_at')
    .eq('household_id', householdId)
    .order('updated_at', { ascending: false })

  if (error) throw error

  return data.map(mapMeal)
}

export const getMealById = async (
  mealId: string,
): Promise<MealWithIngredients> => {
  const { data: meal, error: mealError } = await supabase
    .from('meals')
    .select('id, household_id, name, icon, created_by, created_at, updated_at')
    .eq('id', mealId)
    .single()

  if (mealError) throw mealError
  if (!meal) throw new Error('Meal not found')

  const { data: ingredients, error: ingredientsError } = await supabase
    .from('meal_ingredients')
    .select(MEAL_INGREDIENT_SELECT)
    .eq('meal_id', mealId)

  if (ingredientsError) throw ingredientsError

  return {
    ...mapMeal(meal),
    ingredients: (ingredients ?? []).map((row) =>
      mapMealIngredient(row as MealIngredientRow),
    ),
  }
}

export const createMeal = async (
  householdId: string,
  name: string,
  _userId: string,
): Promise<Meal> => {
  const icon = getRandomIcon()

  const { data, error } = await supabase.rpc('create_meal', {
    p_household_id: householdId,
    p_name: name,
    p_icon: icon,
  })

  if (error) throw error
  if (!data) throw new Error('Failed to create meal')

  return mapMeal(data)
}

export const createMealWithIngredients = async (
  householdId: string,
  name: string,
  userId: string,
  ingredients: TemporaryIngredient[],
): Promise<MealWithIngredients> => {
  const meal = await createMeal(householdId, name, userId)

  if (ingredients.length === 0) {
    return { ...meal, ingredients: [] }
  }

  const libraryIds: string[] = []

  for (const ing of ingredients) {
    if (ing.libraryIngredientId) {
      libraryIds.push(ing.libraryIngredientId)
      continue
    }

    const libraryItem = await upsertLibraryIngredient(householdId, {
      name: ing.name,
      unit: ing.unit,
      category: ing.category,
    })
    libraryIds.push(libraryItem.id)
  }

  const linkInserts = ingredients.map((ing, index) => ({
    meal_id: meal.id,
    ingredient_id: libraryIds[index],
    quantity: ing.quantity,
  }))

  const { data: insertedLinks, error: linksError } = await supabase
    .from('meal_ingredients')
    .insert(linkInserts)
    .select(MEAL_INGREDIENT_SELECT)

  if (linksError) throw linksError

  return {
    ...meal,
    ingredients: (insertedLinks ?? []).map((row) =>
      mapMealIngredient(row as MealIngredientRow),
    ),
  }
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

const touchMeal = async (mealId: string): Promise<void> => {
  const { error } = await supabase
    .from('meals')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', mealId)

  if (error) throw error
}

export const addIngredient = async (
  mealId: string,
  ingredient: {
    name: string
    quantity: number
    unit: string
    category: string
    libraryIngredientId?: string
  },
): Promise<MealIngredient> => {
  const householdId = await getMealHouseholdId(mealId)

  const libraryItem = ingredient.libraryIngredientId
    ? { id: ingredient.libraryIngredientId }
    : await upsertLibraryIngredient(householdId, ingredient)

  const { data, error } = await supabase
    .from('meal_ingredients')
    .insert({
      meal_id: mealId,
      ingredient_id: libraryItem.id,
      quantity: ingredient.quantity,
    })
    .select(MEAL_INGREDIENT_SELECT)
    .single()

  if (error) throw error
  if (!data) throw new Error('Failed to add ingredient')

  await touchMeal(mealId)

  return mapMealIngredient(data as MealIngredientRow)
}

export const updateIngredient = async (
  mealIngredientId: string,
  updates: Partial<{
    name: string
    quantity: number
    unit: string
    category: string
  }>,
): Promise<void> => {
  const { data: link, error: fetchError } = await supabase
    .from('meal_ingredients')
    .select('id, meal_id, ingredient_id')
    .eq('id', mealIngredientId)
    .single()

  if (fetchError) throw fetchError
  if (!link) throw new Error('Ingredient link not found')

  if (updates.quantity !== undefined) {
    const { error } = await supabase
      .from('meal_ingredients')
      .update({ quantity: updates.quantity })
      .eq('id', mealIngredientId)

    if (error) throw error
  }

  const libraryUpdates: Partial<{ name: string; unit: string; category: string }> =
    {}
  if (updates.name !== undefined) libraryUpdates.name = updates.name.trim()
  if (updates.unit !== undefined) libraryUpdates.unit = updates.unit
  if (updates.category !== undefined) libraryUpdates.category = updates.category

  if (Object.keys(libraryUpdates).length > 0) {
    const { error } = await supabase
      .from('ingredient_library')
      .update(libraryUpdates)
      .eq('id', link.ingredient_id)

    if (error) throw error
  }

  await touchMeal(link.meal_id)
}

export const deleteIngredient = async (
  mealIngredientId: string,
): Promise<void> => {
  const { data: link, error: fetchError } = await supabase
    .from('meal_ingredients')
    .select('meal_id')
    .eq('id', mealIngredientId)
    .single()

  if (fetchError) throw fetchError

  const { error } = await supabase
    .from('meal_ingredients')
    .delete()
    .eq('id', mealIngredientId)

  if (error) throw error

  if (link) {
    await touchMeal(link.meal_id)
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

  const mealIds = (meals ?? []).map((meal) => meal.id)
  const counts: Record<string, number> = {}
  for (const mealId of mealIds) {
    counts[mealId] = 0
  }

  if (mealIds.length === 0) return counts

  const { data: links, error: linksError } = await supabase
    .from('meal_ingredients')
    .select('meal_id')
    .in('meal_id', mealIds)

  if (linksError) throw linksError

  for (const link of links ?? []) {
    if (counts[link.meal_id] !== undefined) {
      counts[link.meal_id]++
    }
  }

  return counts
}

export const getIngredientLibrary = async (
  householdId: string,
): Promise<LibraryIngredient[]> => {
  const { data, error } = await supabase
    .from('ingredient_library')
    .select('id, name, unit, category')
    .eq('household_id', householdId)
    .order('name')

  if (error) throw error

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    unit: row.unit,
    category: row.category as IngredientCategory,
  }))
}

export const addToIngredientLibrary = async (
  householdId: string,
  ingredient: { name: string; unit: string; category: string },
): Promise<LibraryIngredient> => {
  const row = await upsertLibraryIngredient(householdId, ingredient)

  return {
    id: row.id,
    name: row.name,
    unit: row.unit,
    category: row.category as IngredientCategory,
  }
}
