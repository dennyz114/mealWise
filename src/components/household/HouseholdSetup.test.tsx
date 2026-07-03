import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HouseholdSetup } from './HouseholdSetup'
import { useTranslation } from '@/hooks/useTranslation'
import { useAuth } from '@/hooks/useAuth'
import type { AuthUser } from '@/types/auth'

// Mock dependencies
vi.mock('@/hooks/useTranslation')
vi.mock('@/hooks/useAuth')

// Mock the child sheets
vi.mock('./CreateHouseholdSheet', () => ({
  CreateHouseholdSheet: vi.fn(
    ({ open }: { open: boolean }) =>
      open ? <div data-testid="create-sheet">Create Sheet</div> : null,
  ),
}))
vi.mock('./JoinHouseholdSheet', () => ({
  JoinHouseholdSheet: vi.fn(
    ({ open }: { open: boolean }) =>
      open ? <div data-testid="join-sheet">Join Sheet</div> : null,
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
    'household.setupTitle': 'Set up your household',
    'household.setupDescription': 'You need a household to start planning meals.',
    'household.createTitle': 'Create a household',
    'household.joinTitle': 'Join a household',
  }
  return translations[key] ?? key
}

describe('HouseholdSetup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useTranslation).mockReturnValue({
      t: mockT,
      locale: 'en',
      setLocale: vi.fn(),
    })
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
      session: null,
    })
  })

  it('renders the setup screen with title and description', () => {
    render(<HouseholdSetup user={mockUser} />)

    expect(screen.getByText('Set up your household')).toBeDefined()
    expect(screen.getByText('You need a household to start planning meals.')).toBeDefined()
  })

  it('renders create and join action buttons', () => {
    render(<HouseholdSetup user={mockUser} />)

    // Buttons render duplicate due to StrictMode, use getAllByRole
    const createButtons = screen.getAllByRole('button', { name: 'Create a household' })
    expect(createButtons.length).toBeGreaterThanOrEqual(1)

    const joinButtons = screen.getAllByRole('button', { name: 'Join a household' })
    expect(joinButtons.length).toBeGreaterThanOrEqual(1)
  })

  it('opens create sheet when Create a household is clicked', async () => {
    const user = userEvent.setup()
    render(<HouseholdSetup user={mockUser} />)

    const createButtons = screen.getAllByRole('button', { name: 'Create a household' })
    await user.click(createButtons[0]!)

    expect(screen.getByTestId('create-sheet')).toBeDefined()
  })

  it('opens join sheet when Join a household is clicked', async () => {
    const user = userEvent.setup()
    render(<HouseholdSetup user={mockUser} />)

    const joinButtons = screen.getAllByRole('button', { name: 'Join a household' })
    await user.click(joinButtons[0]!)

    expect(screen.getByTestId('join-sheet')).toBeDefined()
  })
})
