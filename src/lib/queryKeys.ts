export const queryKeys = {
  auth: {
    session: ['auth', 'session'] as const,
  },
  households: (userId: string) => ['households', userId] as const,
  meals: (householdId: string) => ['meals', householdId] as const,
  weeklyMenu: (householdId: string, weekStart: string) =>
    ['weeklyMenu', householdId, weekStart] as const,
  shoppingList: (weeklyMenuId: string) => ['shoppingList', weeklyMenuId] as const,
}
