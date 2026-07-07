import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CloseHouseholdSheet } from './CloseHouseholdSheet'
import { useAuth } from '@/hooks/useAuth'
import { useTranslation } from '@/hooks/useTranslation'
import { deleteHousehold } from '@/lib/households'
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
  id: 'user-1',
  email: 'dennis@gmail.com',
  displayName: 'Dennis García',
  avatarUrl: '',
}

const mockHousehold: Household = {
  id: 'household-1',
  name: 'The García family',
  joinCode: 'XK4-92T',
  createdBy: 'user-1',
  createdAt: '2024-01-01T00:00:00Z',
}

const mockT = (key: string, params?: Record<string, string | number>): string => {
  const translations: Record<string, string> = {
    'settings.closeHousehold': 'Close household',
    'settings.closeHouseholdModalBody': 'This will permanently delete {name} and remove all members.',
    'settings.closeHouseholdWarning': 'This action cannot be undone. All {count} members will lose access immediately.',
    'settings.typeToConfirm': 'Type {name} to confirm',
    'settings.householdNamePlaceholder': 'Household name',
    'settings.closeError': 'Failed to close household.',
    'settings.cancel': 'Cancel',
  }
  let value = translations[key] ?? key
  if (params) {
    for (const [paramKey, paramValue] of Object.entries(params)) {
      value = value.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue))
    }
  }
  return value
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

describe('CloseHouseholdSheet', () => {
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
    vi.mocked(deleteHousehold).mockResolvedValue(undefined)
  })

  it('renders when open', () => {
    render(
      <CloseHouseholdSheet
        open={true}
        onOpenChange={mockOnOpenChange}
        household={mockHousehold}
        memberCount={3}
      />,
      { wrapper: createWrapper() },
    )

    expect(screen.getByText('Close household')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(
      <CloseHouseholdSheet
        open={false}
        onOpenChange={mockOnOpenChange}
        household={mockHousehold}
        memberCount={3}
      />,
      { wrapper: createWrapper() },
    )

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('displays household name in warning', () => {
    render(
      <CloseHouseholdSheet
        open={true}
        onOpenChange={mockOnOpenChange}
        household={mockHousehold}
        memberCount={3}
      />,
      { wrapper: createWrapper() },
    )

    expect(screen.getByText(/The García family/)).toBeInTheDocument()
  })

  it('displays member count in warning', () => {
    render(
      <CloseHouseholdSheet
        open={true}
        onOpenChange={mockOnOpenChange}
        household={mockHousehold}
        memberCount={3}
      />,
      { wrapper: createWrapper() },
    )

    expect(screen.getByText(/3 members/)).toBeInTheDocument()
  })

  it('disables confirm button when name does not match', () => {
    render(
      <CloseHouseholdSheet
        open={true}
        onOpenChange={mockOnOpenChange}
        household={mockHousehold}
        memberCount={3}
      />,
      { wrapper: createWrapper() },
    )

    const input = screen.getByPlaceholderText('Household name')
    fireEvent.change(input, { target: { value: 'Wrong name' } })

    const confirmButtons = screen.getAllByRole('button', { name: 'Close household' })
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(confirmButtons[0]).toBeDisabled()
  })

  it('enables confirm button when name matches exactly', () => {
    render(
      <CloseHouseholdSheet
        open={true}
        onOpenChange={mockOnOpenChange}
        household={mockHousehold}
        memberCount={3}
      />,
      { wrapper: createWrapper() },
    )

    const input = screen.getByPlaceholderText('Household name')
    fireEvent.change(input, { target: { value: 'The García family' } })

    const confirmButtons = screen.getAllByRole('button', { name: 'Close household' })
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(confirmButtons[0]).not.toBeDisabled()
  })

  it('calls deleteHousehold on confirm', async () => {
    render(
      <CloseHouseholdSheet
        open={true}
        onOpenChange={mockOnOpenChange}
        household={mockHousehold}
        memberCount={3}
      />,
      { wrapper: createWrapper() },
    )

    const input = screen.getByPlaceholderText('Household name')
    fireEvent.change(input, { target: { value: 'The García family' } })

    const confirmButtons = screen.getAllByRole('button', { name: 'Close household' })
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    fireEvent.click(confirmButtons[0]!)

    await waitFor(() => {
      expect(deleteHousehold).toHaveBeenCalledWith('household-1', 'user-1')
    })
  })

  it('calls onOpenChange with false when cancel is clicked', () => {
    render(
      <CloseHouseholdSheet
        open={true}
        onOpenChange={mockOnOpenChange}
        household={mockHousehold}
        memberCount={3}
      />,
      { wrapper: createWrapper() },
    )

    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)

    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })
})
