export const queryKeys = {
  households: (userId: string) => ['households', userId] as const,
  meals: (householdId: string) => ['meals', householdId] as const,
  weeklyMenu: (householdId: string, weekStart: string) =>
    ['weeklyMenu', householdId, weekStart] as const,
  shoppingList: (weeklyMenuId: string) => ['shoppingList', weeklyMenuId] as const,
}
