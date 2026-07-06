import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getHouseholdByUserId, createHousehold, joinHousehold } from './households'
import { supabase } from './supabase'

// Mock the supabase module
vi.mock('./supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

// Helper to create a mock chain
const createMockChain = (returnValue: unknown) => {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(returnValue),
    maybeSingle: vi.fn().mockResolvedValue(returnValue),
    insert: vi.fn().mockReturnThis(),
  }

  // Make select return the chain
  chain.select.mockReturnValue(chain)
  chain.eq.mockReturnValue(chain)
  chain.limit.mockReturnValue(chain)
  chain.insert.mockReturnValue(chain)

  return chain
}

describe('getHouseholdByUserId', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns a household when the user is a member', async () => {
    const mockHousehold = {
      id: 'household-1',
      name: 'My Family',
      join_code: 'ABC-123',
      created_by: 'user-1',
      created_at: '2024-01-01T00:00:00Z',
    }

    const mockChain = createMockChain({
      data: { household: mockHousehold },
      error: null,
    })
    vi.mocked(supabase.from).mockReturnValue(mockChain as any)

    const result = await getHouseholdByUserId('user-1')

    expect(result).toEqual({
      id: 'household-1',
      name: 'My Family',
      joinCode: 'ABC-123',
      createdBy: 'user-1',
      createdAt: '2024-01-01T00:00:00Z',
    })

    expect(supabase.from).toHaveBeenCalledWith('household_members')
    expect(mockChain.select).toHaveBeenCalledWith('household:households(id, name, join_code, created_by, created_at)')
    expect(mockChain.eq).toHaveBeenCalledWith('user_id', 'user-1')
  })

  it('returns null when the user has no membership', async () => {
    const mockChain = createMockChain({
      data: null,
      error: null,
    })
    vi.mocked(supabase.from).mockReturnValue(mockChain as any)

    const result = await getHouseholdByUserId('user-no-household')
    expect(result).toBeNull()
  })

  it('throws on Supabase error', async () => {
    const mockError = new Error('Database error')
    const mockChain = createMockChain({
      data: null,
      error: mockError,
    })
    vi.mocked(supabase.from).mockReturnValue(mockChain as any)

    await expect(getHouseholdByUserId('user-1')).rejects.toThrow('Database error')
  })
})

describe('createHousehold', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates a household and adds the creator as owner', async () => {
    const mockHousehold = {
      id: 'new-household',
      name: 'My Family',
      join_code: 'ABC-123',
      created_by: 'user-1',
      created_at: '2024-01-01T00:00:00Z',
    }

    // Mock the households insert chain
    const householdChain = createMockChain({
      data: mockHousehold,
      error: null,
    })

    // Mock the household_members insert chain (no select needed)
    const memberChain = {
      insert: vi.fn().mockReturnThis(),
    }
    memberChain.insert.mockResolvedValue({ error: null })

    // First call returns household chain, second call returns member chain
    vi.mocked(supabase.from)
      .mockReturnValueOnce(householdChain as any)
      .mockReturnValueOnce(memberChain as any)

    const result = await createHousehold('My Family', 'ABC-123', 'user-1')

    expect(result).toEqual({
      id: 'new-household',
      name: 'My Family',
      joinCode: 'ABC-123',
      createdBy: 'user-1',
      createdAt: '2024-01-01T00:00:00Z',
    })

    expect(supabase.from).toHaveBeenNthCalledWith(1, 'households')
    expect(supabase.from).toHaveBeenNthCalledWith(2, 'household_members')

    expect(householdChain.insert).toHaveBeenCalledWith({
      name: 'My Family',
      join_code: 'ABC-123',
      created_by: 'user-1',
    })

    expect(memberChain.insert).toHaveBeenCalledWith({
      household_id: 'new-household',
      user_id: 'user-1',
      role: 'owner',
    })
  })

  it('throws when household insert fails', async () => {
    const mockError = new Error('duplicate key value violates unique constraint "households_join_code_key"')
    const householdChain = createMockChain({
      data: null,
      error: mockError,
    })
    vi.mocked(supabase.from).mockReturnValue(householdChain as any)

    await expect(
      createHousehold('My Family', 'ABC-123', 'user-1'),
    ).rejects.toThrow('duplicate key value violates unique constraint')
  })

  it('throws when member insert fails', async () => {
    const mockHousehold = {
      id: 'new-household',
      name: 'My Family',
      join_code: 'ABC-123',
      created_by: 'user-1',
      created_at: '2024-01-01T00:00:00Z',
    }

    const householdChain = createMockChain({
      data: mockHousehold,
      error: null,
    })

    const memberChain = {
      insert: vi.fn().mockResolvedValue({ error: new Error('Membership insert failed') }),
    }

    vi.mocked(supabase.from)
      .mockReturnValueOnce(householdChain as any)
      .mockReturnValueOnce(memberChain as any)

    await expect(
      createHousehold('My Family', 'ABC-123', 'user-1'),
    ).rejects.toThrow('Membership insert failed')
  })
})

describe('joinHousehold', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('joins a household with a valid code', async () => {
    const mockHousehold = {
      id: 'existing-household',
      name: 'The Smiths',
      join_code: 'XYZ-789',
      created_by: 'owner-1',
      created_at: '2024-01-01T00:00:00Z',
    }

    const householdChain = createMockChain({
      data: mockHousehold,
      error: null,
    })

    const memberChain = {
      insert: vi.fn().mockResolvedValue({ error: null }),
    }

    vi.mocked(supabase.from)
      .mockReturnValueOnce(householdChain as any)
      .mockReturnValueOnce(memberChain as any)

    const result = await joinHousehold('XYZ-789', 'new-user-1')

    expect(result).toEqual({
      id: 'existing-household',
      name: 'The Smiths',
      joinCode: 'XYZ-789',
      createdBy: 'owner-1',
      createdAt: '2024-01-01T00:00:00Z',
    })

    expect(supabase.from).toHaveBeenNthCalledWith(1, 'households')
    expect(householdChain.eq).toHaveBeenCalledWith('join_code', 'XYZ-789')

    expect(supabase.from).toHaveBeenNthCalledWith(2, 'household_members')
    expect(memberChain.insert).toHaveBeenCalledWith({
      household_id: 'existing-household',
      user_id: 'new-user-1',
      role: 'member',
    })
  })

  it('throws when code is not found', async () => {
    const lookupError = new Error('No rows found')
    const householdChain = createMockChain({
      data: null,
      error: lookupError,
    })
    vi.mocked(supabase.from).mockReturnValue(householdChain as any)

    await expect(joinHousehold('INVALID', 'user-1')).rejects.toThrow()
  })

  it('throws when user is already a member', async () => {
    const mockHousehold = {
      id: 'existing-household',
      name: 'The Smiths',
      join_code: 'XYZ-789',
      created_by: 'owner-1',
      created_at: '2024-01-01T00:00:00Z',
    }

    const householdChain = createMockChain({
      data: mockHousehold,
      error: null,
    })

    const memberChain = {
      insert: vi.fn().mockResolvedValue({
        error: new Error('duplicate key value violates unique constraint'),
      }),
    }

    vi.mocked(supabase.from)
      .mockReturnValueOnce(householdChain as any)
      .mockReturnValueOnce(memberChain as any)

    await expect(joinHousehold('XYZ-789', 'existing-user-1')).rejects.toThrow(
      'duplicate key value violates unique constraint',
    )
  })
})
