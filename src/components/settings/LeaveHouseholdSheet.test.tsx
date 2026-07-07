import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LeaveHouseholdSheet } from './LeaveHouseholdSheet'
import { useAuth } from '@/hooks/useAuth'
import { useTranslation } from '@/hooks/useTranslation'
import { leaveHousehold } from '@/lib/households'
import { useNavigate } from '@tanstack/react-router'
import type { AuthUser } from '@/types/auth'
import type { Household } from '@/types/household'
import type { ReactNode } from 'react'

vi.mock('@/hooks/useAuth')
vi.mock('@/hooks/useTranslation')
vi.mock('@/lib/households')
vi.mock('@tanstack/react-router', () => ({
  useNavigate: vi.fn(),
}))
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
  id: 'user-2',
  email: 'maria@gmail.com',
  displayName: 'Marla García',
  avatarUrl: '',
}

const mockHousehold: Household = {
  id: 'household-1',
  name: 'The García family',
  joinCode: 'XK4-92T',
  createdBy: 'user-1',
  createdAt: '2024-01-01T00:00:00Z',
}

const mockT = (key: string): string => {
  const translations: Record<string, string> = {
    'settings.leaveHousehold': 'Leave household',
    'settings.leaveHouseholdModalBody': "You'll lose access to shared menus and shopping lists.",
    'settings.leaveError': 'Failed to leave household.',
    'settings.cancel': 'Cancel',
  }
  return translations[key] ?? key
}

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

describe('LeaveHouseholdSheet', () => {
  const mockOnOpenChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      session: null,
      isLoading: false,
      isAuthenticated: true,
    })
    vi.mocked(useTranslation).mockReturnValue({
      t: mockT,
      locale: 'en',
      setLocale: vi.fn(),
    })
    vi.mocked(useNavigate).mockReturnValue(vi.fn() as any)
    vi.mocked(leaveHousehold).mockResolvedValue(undefined)
  })

  it('renders when open', () => {
    render(
      <LeaveHouseholdSheet
        open={true}
        onOpenChange={mockOnOpenChange}
        household={mockHousehold}
      />,
      { wrapper: createWrapper() },
    )

    expect(screen.getByText('Leave household')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(
      <LeaveHouseholdSheet
        open={false}
        onOpenChange={mockOnOpenChange}
        household={mockHousehold}
      />,
      { wrapper: createWrapper() },
    )

    expect(screen.queryByRole('button', { name: 'Leave household' })).not.toBeInTheDocument()
  })

  it('displays warning message', () => {
    render(
      <LeaveHouseholdSheet
        open={true}
        onOpenChange={mockOnOpenChange}
        household={mockHousehold}
      />,
      { wrapper: createWrapper() },
    )

    expect(screen.getByText(/lose access/)).toBeInTheDocument()
  })

  it('calls leaveHousehold on confirm', async () => {
    render(
      <LeaveHouseholdSheet
        open={true}
        onOpenChange={mockOnOpenChange}
        household={mockHousehold}
      />,
      { wrapper: createWrapper() },
    )

    const leaveButtons = screen.getAllByRole('button', { name: 'Leave household' })
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    fireEvent.click(leaveButtons[0]!)

    await waitFor(() => {
      expect(leaveHousehold).toHaveBeenCalledWith('household-1', 'user-2')
    })
  })

  it('calls onOpenChange with false when cancel is clicked', () => {
    render(
      <LeaveHouseholdSheet
        open={true}
        onOpenChange={mockOnOpenChange}
        household={mockHousehold}
      />,
      { wrapper: createWrapper() },
    )

    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)

    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })
})
