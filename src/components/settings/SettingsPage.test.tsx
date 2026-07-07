import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SettingsPage } from './SettingsPage'
import { useAuth } from '@/hooks/useAuth'
import { useHousehold } from '@/hooks/useHousehold'
import { useTranslation } from '@/hooks/useTranslation'
import { getHouseholdMembers, updateHouseholdName } from '@/lib/households'
import type { AuthUser } from '@/types/auth'
import type { Household } from '@/types/household'
import type { HouseholdMemberWithProfile } from '@/types/household'
import type { ReactNode } from 'react'

vi.mock('@/hooks/useAuth')
vi.mock('@/hooks/useHousehold')
vi.mock('@/hooks/useTranslation')
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

const mockMembers: HouseholdMemberWithProfile[] = [
  {
    id: 'member-1',
    householdId: 'household-1',
    userId: 'user-1',
    role: 'owner',
    joinedAt: '2024-01-01T00:00:00Z',
    displayName: 'Dennis García',
    email: 'dennis@gmail.com',
    avatarUrl: '',
  },
  {
    id: 'member-2',
    householdId: 'household-1',
    userId: 'user-2',
    role: 'member',
    joinedAt: '2024-01-02T00:00:00Z',
    displayName: 'Marla García',
    email: 'maria@gmail.com',
    avatarUrl: '',
  },
]

const mockT = (key: string, params?: Record<string, string | number>): string => {
  const translations: Record<string, string> = {
    'settings.title': 'Settings',
    'settings.accountSection': 'Account',
    'settings.householdSection': 'Household',
    'settings.membersSection': 'Members',
    'settings.nameLabel': 'Name',
    'settings.emailLabel': 'Email',
    'settings.edit': 'Edit',
    'settings.save': 'Save',
    'settings.saving': 'Saving...',
    'settings.cancel': 'Cancel',
    'settings.copy': 'Copy',
    'settings.ownerBadge': 'Owner',
    'settings.youBadge': 'You',
    'settings.dangerZone': 'Danger Zone',
    'settings.closeHousehold': 'Close household',
    'settings.closeHouseholdDescription': 'Permanently deletes this household.',
    'settings.leaveHousehold': 'Leave household',
    'settings.leaveHouseholdDescription': "You'll lose access to shared menus.",
    'common.copied': 'Copied!',
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

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      session: null,
      isLoading: false,
      isAuthenticated: true,
    })
    vi.mocked(useHousehold).mockReturnValue({
      household: mockHousehold,
      isLoading: false,
      error: null,
    })
    vi.mocked(useTranslation).mockReturnValue({
      t: mockT,
      locale: 'en',
      setLocale: vi.fn(),
    })
    vi.mocked(getHouseholdMembers).mockResolvedValue(mockMembers)
    vi.mocked(updateHouseholdName).mockResolvedValue(undefined)
  })

  it('renders settings title', async () => {
    render(<SettingsPage />, { wrapper: createWrapper() })
    expect(await screen.findByText('Settings')).toBeInTheDocument()
  })

  it('displays user account info', async () => {
    render(<SettingsPage />, { wrapper: createWrapper() })
    expect(await screen.findByText('Dennis García')).toBeInTheDocument()
    expect(screen.getByText('dennis@gmail.com')).toBeInTheDocument()
  })

  it('displays household name', async () => {
    render(<SettingsPage />, { wrapper: createWrapper() })
    expect(await screen.findByText('The García family')).toBeInTheDocument()
  })

  it('displays join code', async () => {
    render(<SettingsPage />, { wrapper: createWrapper() })
    expect(await screen.findByText('XK4-92T')).toBeInTheDocument()
  })

  it('shows edit button for owner', async () => {
    render(<SettingsPage />, { wrapper: createWrapper() })
    expect(await screen.findByText('Edit')).toBeInTheDocument()
  })

  it('displays member list', async () => {
    render(<SettingsPage />, { wrapper: createWrapper() })
    expect(await screen.findByText('Dennis García')).toBeInTheDocument()
    expect(screen.getByText('Marla García')).toBeInTheDocument()
  })

  it('shows owner badge', async () => {
    render(<SettingsPage />, { wrapper: createWrapper() })
    const ownerBadges = await screen.findAllByText('Owner')
    expect(ownerBadges.length).toBeGreaterThanOrEqual(1)
  })

  it('shows danger zone for owner', async () => {
    render(<SettingsPage />, { wrapper: createWrapper() })
    expect(await screen.findByText('Danger Zone')).toBeInTheDocument()
    expect(screen.getByText('Close household')).toBeInTheDocument()
  })

  it('copies join code on copy button click', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
      writable: true,
    })

    render(<SettingsPage />, { wrapper: createWrapper() })
    const copyButtons = await screen.findAllByText('Copy')
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    fireEvent.click(copyButtons[0]!)
    expect(writeText).toHaveBeenCalledWith('XK4-92T')
  })

  it('shows save button when editing name', async () => {
    render(<SettingsPage />, { wrapper: createWrapper() })
    const editButton = await screen.findByText('Edit')
    fireEvent.click(editButton)
    expect(screen.getByText('Save')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })
})
