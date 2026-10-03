import { describe, expect, it, vi } from 'vitest'
import { clearAccountHouseholds, type CleanupClient } from './cleanup'

const password = 'p@ss-should-not-leak'

function client(overrides: Partial<CleanupClient> = {}): CleanupClient {
  return {
    signIn: vi.fn(async () => ({ userId: 'user-1' })),
    listMemberships: vi.fn(async () => []),
    deleteHousehold: vi.fn(async () => undefined),
    deleteMembership: vi.fn(async () => undefined),
    ...overrides,
  }
}

describe('clearAccountHouseholds', () => {
  it('deletes an owned household and does not delete that membership', async () => {
    const fake = client({
      listMemberships: vi.fn(async () => [{ householdId: 'home-1', role: 'owner' as const }]),
    })
    await clearAccountHouseholds(fake, 'cook@example.com', password)
    expect(fake.deleteHousehold).toHaveBeenCalledWith('home-1')
    expect(fake.deleteMembership).not.toHaveBeenCalled()
  })

  it('deletes a member membership and does not delete that household', async () => {
    const fake = client({
      listMemberships: vi.fn(async () => [{ householdId: 'home-2', role: 'member' as const }]),
    })
    await clearAccountHouseholds(fake, 'cook@example.com', password)
    expect(fake.deleteMembership).toHaveBeenCalledWith('home-2', 'user-1')
    expect(fake.deleteHousehold).not.toHaveBeenCalled()
  })

  it('redacts the password when sign-in fails', async () => {
    const fake = client({
      signIn: vi.fn(async () => ({ error: `bad password ${password}` })),
    })
    await expect(clearAccountHouseholds(fake, 'cook@example.com', password)).rejects.toThrow(
      /Test account sign-in failed/,
    )
    await expect(clearAccountHouseholds(fake, 'cook@example.com', password)).rejects.toThrow(
      /\[redacted\]/,
    )
    try {
      await clearAccountHouseholds(fake, 'cook@example.com', password)
    } catch (error) {
      expect(String(error)).not.toContain(password)
    }
  })

  it('redacts the password when a delete fails', async () => {
    const fake = client({
      listMemberships: vi.fn(async () => [{ householdId: 'home-1', role: 'owner' as const }]),
      deleteHousehold: vi.fn(async () => {
        throw new Error(`delete failed ${password}`)
      }),
    })
    await expect(clearAccountHouseholds(fake, 'cook@example.com', password)).rejects.toThrow(
      /Failed to delete household home-1/,
    )
    try {
      await clearAccountHouseholds(fake, 'cook@example.com', password)
    } catch (error) {
      expect(String(error)).not.toContain(password)
    }
  })
})
