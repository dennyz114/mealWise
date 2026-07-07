export const queryKeys = {
  auth: {
    session: ['auth', 'session'] as const,
  },
  households: (userId: string) => ['households', userId] as const,
  household: (userId: string) => ['household', userId] as const,
  householdMembers: (householdId: string) => ['householdMembers', householdId] as const,
  meals: (householdId: string) => ['meals', householdId] as const,
  weeklyMenu: (householdId: string, weekStart: string) =>
    ['weeklyMenu', householdId, weekStart] as const,
  shoppingList: (weeklyMenuId: string) => ['shoppingList', weeklyMenuId] as const,
  mealDetail: (mealId: string) => ['mealDetail', mealId] as const,
  ingredientLibrary: (householdId: string) =>
    ['ingredientLibrary', householdId] as const,
  mealIngredientCounts: (householdId: string) =>
    ['mealIngredientCounts', householdId] as const,
}
