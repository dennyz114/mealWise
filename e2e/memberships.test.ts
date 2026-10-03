import { describe, expect, it } from 'vitest'
import { planHouseholdCleanup } from './memberships'

describe('planHouseholdCleanup', () => {
  it('deletes a household the account owns', () => {
    expect(
      planHouseholdCleanup('user-1', [{ householdId: 'home-1', role: 'owner' }]),
    ).toEqual({
      householdIdsToDelete: ['home-1'],
      membershipsToDelete: [],
    })
  })

  it('removes a member-only membership and does not delete that household', () => {
    expect(
      planHouseholdCleanup('user-1', [{ householdId: 'home-2', role: 'member' }]),
    ).toEqual({
      householdIdsToDelete: [],
      membershipsToDelete: [{ householdId: 'home-2', userId: 'user-1' }],
    })
  })
})
