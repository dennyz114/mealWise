import { describe, expect, it, vi } from 'vitest'
import {
  assertRowsDeleted,
  clearAccountHouseholds,
  createSupabaseCleanupClient,
  type CleanupClient,
} from './cleanup'

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

describe('assertRowsDeleted', () => {
  it('throws when no row was deleted', () => {
    expect(() => assertRowsDeleted([], 'household home-1')).toThrow(
      'household home-1: no row was deleted',
    )
    expect(() => assertRowsDeleted(null, 'household home-1')).toThrow(
      'household home-1: no row was deleted',
    )
  })

  it('accepts a deleted row', () => {
    expect(() => assertRowsDeleted([{ id: 'home-1' }], 'household home-1')).not.toThrow()
  })
})

describe('createSupabaseCleanupClient deletes', () => {
  it('throws when a household delete matches no row', async () => {
    const supabase = {
      from: () => ({
        delete: () => ({
          eq: () => ({
            select: async () => ({ data: [], error: null }),
          }),
        }),
      }),
    }
    const cleanup = createSupabaseCleanupClient(supabase as never)
    await expect(cleanup.deleteHousehold('home-1')).rejects.toThrow(
      'household home-1: no row was deleted',
    )
  })
})

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

  it('redacts the password when sign-in throws', async () => {
    const fake = client({
      signIn: vi.fn(async () => {
        throw new Error(`network down ${password}`)
      }),
    })
    try {
      await clearAccountHouseholds(fake, 'cook@example.com', password)
      expect.fail('expected cleanup to throw')
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
