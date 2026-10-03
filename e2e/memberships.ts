export type Membership = {
  householdId: string
  role: 'owner' | 'member'
}

export type CleanupPlan = {
  householdIdsToDelete: string[]
  membershipsToDelete: { householdId: string; userId: string }[]
}

export function planHouseholdCleanup(
  userId: string,
  memberships: Membership[],
): CleanupPlan {
  const householdIdsToDelete: string[] = []
  const membershipsToDelete: { householdId: string; userId: string }[] = []
  for (const membership of memberships) {
    if (membership.role === 'owner') {
      householdIdsToDelete.push(membership.householdId)
    } else {
      membershipsToDelete.push({ householdId: membership.householdId, userId })
    }
  }
  return { householdIdsToDelete, membershipsToDelete }
}
