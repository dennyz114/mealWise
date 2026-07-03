import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useHousehold } from './useHousehold'
import { useAuth } from './useAuth'
import { getHouseholdByUserId } from '@/lib/households'
import type { ReactNode } from 'react'

// Mock dependencies
vi.mock('./useAuth')
vi.mock('@/lib/households')

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  displayName: 'Test User',
  avatarUrl: '',
}

const mockHousehold = {
  id: 'household-1',
  name: 'My Family',
  joinCode: 'ABC-123',
  createdBy: 'user-1',
  createdAt: '2024-01-01T00:00:00Z',
}

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useHousehold', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      session: null,
      isLoading: false,
      isAuthenticated: true,
    })
  })

  it('returns household when user has membership', async () => {
    vi.mocked(getHouseholdByUserId).mockResolvedValue(mockHousehold)

    const { result } = renderHook(() => useHousehold(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.household).toEqual(mockHousehold)
    expect(result.current.error).toBeNull()
  })

  it('returns null when user has no household', async () => {
    vi.mocked(getHouseholdByUserId).mockResolvedValue(null)

    const { result } = renderHook(() => useHousehold(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.household).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('shows loading state during initial fetch', async () => {
    // Create a promise that never resolves to keep loading state
    vi.mocked(getHouseholdByUserId).mockReturnValue(new Promise(() => {}))

    const { result } = renderHook(() => useHousehold(), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.household).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('handles error gracefully', async () => {
    const testError = new Error('Failed to fetch household')
    vi.mocked(getHouseholdByUserId).mockRejectedValue(testError)

    const { result } = renderHook(() => useHousehold(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.household).toBeNull()
    expect(result.current.error).toBeTruthy()
  })
})
