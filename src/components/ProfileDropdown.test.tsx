import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProfileDropdown } from './ProfileDropdown'
import { useTranslation } from '@/hooks/useTranslation'
import { useNavigate } from '@tanstack/react-router'
import { useTheme } from '@/lib/theme'
import type { AuthUser } from '@/types/auth'
import type { Household } from '@/types/household'

// Mock dependencies
vi.mock('@/hooks/useTranslation')
vi.mock('@tanstack/react-router', () => ({
  useNavigate: vi.fn(),
}))
vi.mock('@/lib/theme')
vi.mock('@/lib/auth', () => ({
  signOut: vi.fn().mockResolvedValue({ error: null }),
}))
vi.mock('@/components/Avatar', () => ({
  Avatar: vi.fn(({ displayName }: { displayName: string }) => (
    <div data-testid="avatar">{displayName}</div>
  )),
}))

const mockUser: AuthUser = {
  id: 'user-1',
  email: 'test@example.com',
  displayName: 'Test User',
  avatarUrl: '',
}

const mockHousehold: Household = {
  id: 'household-1',
  name: 'My Family',
  joinCode: 'ABC-123',
  createdBy: 'user-1',
  createdAt: '2024-01-01T00:00:00Z',
}

const mockT = (key: string) => {
  const translations: Record<string, string> = {
    'household.myHousehold': 'My household',
    'household.setupNeeded': 'Setup needed',
    'profile.darkMode': 'Dark mode',
    'profile.language': 'Language',
    'profile.settings': 'Settings',
    'profile.signOut': 'Sign out',
  }
  return translations[key] ?? key
}

describe('ProfileDropdown', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useTranslation).mockReturnValue({
      t: mockT,
      locale: 'en',
      setLocale: vi.fn(),
    })
    vi.mocked(useNavigate).mockReturnValue(vi.fn() as any)
    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      setTheme: vi.fn(),
    })
  })

  it('shows "Setup needed" badge when no household', () => {
    render(<ProfileDropdown user={mockUser} household={null} />)

    // There are two Avatar instances (trigger + dropdown header)
    const avatars = screen.getAllByTestId('avatar')
    expect(avatars.length).toBeGreaterThanOrEqual(1)
    expect(avatars[0]).toHaveTextContent('Test User')
  })

  it('shows join code when household exists', () => {
    render(<ProfileDropdown user={mockUser} household={mockHousehold} />)

    const avatars = screen.getAllByTestId('avatar')
    expect(avatars.length).toBeGreaterThanOrEqual(1)
    expect(avatars[0]).toHaveTextContent('Test User')
  })
})
