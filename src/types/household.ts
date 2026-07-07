export type Household = {
  id: string
  name: string
  joinCode: string
  createdBy: string
  createdAt: string
}

export type HouseholdMember = {
  id: string
  householdId: string
  userId: string
  role: 'owner' | 'member'
  joinedAt: string
}

export type HouseholdMemberWithProfile = HouseholdMember & {
  displayName: string
  email: string
  avatarUrl: string
}
