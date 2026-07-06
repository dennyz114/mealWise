import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { JoinHouseholdSheet } from './JoinHouseholdSheet'
import { useTranslation } from '@/hooks/useTranslation'
import { useNavigate } from '@tanstack/react-router'
import { joinHousehold } from '@/lib/households'
import type { AuthUser } from '@/types/auth'
import type { ReactNode } from 'react'

// Mock dependencies
vi.mock('@/hooks/useTranslation')
vi.mock('@tanstack/react-router', () => ({
  useNavigate: vi.fn(),
}))
vi.mock('@/lib/households')
vi.mock('@/components/ui/bottom-sheet', () => ({
  BottomSheet: vi.fn(
    ({ open, title, children }: { open: boolean; title?: string; children: ReactNode }) =>
      open ? (
        <div data-testid="bottom-sheet">
          {title && <h2>{title}</h2>}
          {children}
        </div>
      ) : null,
  ),
}))

const mockUser: AuthUser = {
  id: 'user-1',
  email: 'test@example.com',
  displayName: 'Test User',
  avatarUrl: '',
}

const mockT = (key: string): string => {
  const translations: Record<string, string> = {
    'household.joinTitle': 'Join a household',
    'household.joinSubtitle': 'Enter the 6-character code shared by the household owner.',
    'household.joinInputLabel': 'Household code',
    'household.joinInputPlaceholder': 'e.g. XXX-XXX',
    'household.joinButton': 'Join',
    'household.cancel': 'Cancel',
    'household.errorInvalidCode': 'Invalid code format.',
    'household.errorGeneric': 'Something went wrong.',
  }
  return translations[key] ?? key
}

const mockSetOpen = vi.fn()

const createWrapper = (): React.FC<{ children: ReactNode }> => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('JoinHouseholdSheet', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useTranslation).mockReturnValue({
      t: mockT,
      locale: 'en',
      setLocale: vi.fn(),
    })
    vi.mocked(useNavigate).mockReturnValue(vi.fn() as any)
  })

  it('disables join button when code is empty', () => {
    render(
      <JoinHouseholdSheet open={true} onOpenChange={mockSetOpen} user={mockUser} />,
      { wrapper: createWrapper() },
    )

    const [firstJoinButton] = screen.getAllByRole('button', { name: 'Join' })
    expect(firstJoinButton).toBeDisabled()
  })

  it('enables join button when valid code is entered', () => {
    render(
      <JoinHouseholdSheet open={true} onOpenChange={mockSetOpen} user={mockUser} />,
      { wrapper: createWrapper() },
    )

    const firstCodeInput = screen.getAllByLabelText('Household code')[0]!
    fireEvent.input(firstCodeInput, { target: { value: 'ABC-123' } })

    const firstJoinButton = screen.getAllByRole('button', { name: 'Join' })[0]!
    expect(firstJoinButton).not.toBeDisabled()
  })

  it('calls joinHousehold on submit with valid code', async () => {
    vi.mocked(joinHousehold).mockResolvedValue({
      id: 'household-1',
      name: 'Test Household',
      joinCode: 'ABC-123',
      createdBy: 'user-1',
      createdAt: '2024-01-01T00:00:00Z',
    })

    render(
      <JoinHouseholdSheet open={true} onOpenChange={mockSetOpen} user={mockUser} />,
      { wrapper: createWrapper() },
    )

    const firstCodeInput = screen.getAllByLabelText('Household code')[0]!
    fireEvent.input(firstCodeInput, { target: { value: 'ABC-123' } })

    const firstJoinButton = screen.getAllByRole('button', { name: 'Join' })[0]!
    fireEvent.click(firstJoinButton)

    // Mutation is async — wait for the mutationFn to be called
    await waitFor(() => {
      expect(joinHousehold).toHaveBeenCalledWith('ABC-123', 'user-1')
    })
  })

  it('shows error on invalid code submission', async () => {
    vi.mocked(joinHousehold).mockRejectedValue(new Error('No household found with that code.'))

    render(
      <JoinHouseholdSheet open={true} onOpenChange={mockSetOpen} user={mockUser} />,
      { wrapper: createWrapper() },
    )

    const firstCodeInput = screen.getAllByLabelText('Household code')[0]!
    fireEvent.input(firstCodeInput, { target: { value: 'ABC-123' } })

    const firstJoinButton = screen.getAllByRole('button', { name: 'Join' })[0]!
    fireEvent.click(firstJoinButton)

    const errors = await screen.findAllByText('No household found with that code.')
    expect(errors.length).toBeGreaterThanOrEqual(1)
  })
})
