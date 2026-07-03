import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CreateHouseholdSheet } from './CreateHouseholdSheet'
import { useTranslation } from '@/hooks/useTranslation'
import { useNavigate } from '@tanstack/react-router'
import { createHousehold } from '@/lib/households'
import { generateJoinCode } from '@/utils/joinCode'
import type { AuthUser } from '@/types/auth'
import type { ReactNode } from 'react'

// Mock dependencies
vi.mock('@/hooks/useTranslation')
vi.mock('@tanstack/react-router', () => ({
  useNavigate: vi.fn(),
}))
vi.mock('@/lib/households')
vi.mock('@/utils/joinCode')
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
    'household.createTitle': 'Create a household',
    'household.createSubtitle': "Give your household a name. You'll get a code to share with others.",
    'household.createNameLabel': 'Household name',
    'household.createNamePlaceholder': 'e.g. My Family',
    'household.createCodeHelper': 'Share this code with anyone you want to invite.',
    'household.createButton': 'Create household',
    'household.cancel': 'Cancel',
    'household.copyCode': 'Copy code',
    'household.codeCopied': 'Code copied!',
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

describe('CreateHouseholdSheet', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useTranslation).mockReturnValue({
      t: mockT,
      locale: 'en',
      setLocale: vi.fn(),
    })
    vi.mocked(useNavigate).mockReturnValue(vi.fn() as any)
    vi.mocked(generateJoinCode).mockReturnValue('ABC-123')
    vi.mocked(createHousehold).mockResolvedValue({
      id: 'household-1',
      name: 'My Family',
      joinCode: 'ABC-123',
      createdBy: 'user-1',
      createdAt: '2024-01-01T00:00:00Z',
    })
  })

  it('disables create button when name is empty', () => {
    render(
      <CreateHouseholdSheet open={true} onOpenChange={mockSetOpen} user={mockUser} />,
      { wrapper: createWrapper() },
    )

    // First button is the real rendered instance (React 19 dev mode may
    // accumulate extra DOM nodes from multiple renders via mocked children)
    const createButton = screen.getAllByRole('button', { name: 'Create household' })[0]
    expect(createButton).toBeDisabled()
  })

  it('enables create button when name is entered', () => {
    render(
      <CreateHouseholdSheet open={true} onOpenChange={mockSetOpen} user={mockUser} />,
      { wrapper: createWrapper() },
    )

    const firstInput = screen.getAllByLabelText('Household name')[0]!
    fireEvent.input(firstInput, { target: { value: 'My Family' } })

    const createButton = screen.getAllByRole('button', { name: 'Create household' })[0]!
    expect(createButton).not.toBeDisabled()
  })

  it('shows generated join code', () => {
    render(
      <CreateHouseholdSheet open={true} onOpenChange={mockSetOpen} user={mockUser} />,
      { wrapper: createWrapper() },
    )

    const codeElements = screen.getAllByText('ABC-123')
    expect(codeElements.length).toBeGreaterThanOrEqual(1)
  })

  it('copies code on copy button click', () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
      writable: true,
    })

    render(
      <CreateHouseholdSheet open={true} onOpenChange={mockSetOpen} user={mockUser} />,
      { wrapper: createWrapper() },
    )

    const firstCopyButton = screen.getAllByLabelText('Copy code')[0]!
    fireEvent.click(firstCopyButton)

    expect(writeText).toHaveBeenCalledWith('ABC-123')
  })

  it('calls createHousehold on submit', async () => {
    render(
      <CreateHouseholdSheet open={true} onOpenChange={mockSetOpen} user={mockUser} />,
      { wrapper: createWrapper() },
    )

    const firstInput = screen.getAllByLabelText('Household name')[0]!
    fireEvent.input(firstInput, { target: { value: 'My Family' } })

    const firstCreateButton = screen.getAllByRole('button', { name: 'Create household' })[0]!
    fireEvent.click(firstCreateButton)

    // Mutation is async — wait for the mutationFn to be called
    await waitFor(() => {
      expect(createHousehold).toHaveBeenCalledWith('My Family', 'ABC-123', 'user-1')
    })
  })

  it('shows error message on failure', async () => {
    vi.mocked(createHousehold).mockRejectedValue(new Error('Failed to create household'))

    render(
      <CreateHouseholdSheet open={true} onOpenChange={mockSetOpen} user={mockUser} />,
      { wrapper: createWrapper() },
    )

    const firstInput = screen.getAllByLabelText('Household name')[0]!
    fireEvent.input(firstInput, { target: { value: 'Test' } })

    const firstCreateButton = screen.getAllByRole('button', { name: 'Create household' })[0]!
    fireEvent.click(firstCreateButton)

    const errorMessages = await screen.findAllByText('Failed to create household')
    expect(errorMessages.length).toBeGreaterThanOrEqual(1)
  })
})
