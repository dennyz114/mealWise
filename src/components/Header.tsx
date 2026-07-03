import { Link } from '@tanstack/react-router'
import { ProfileDropdown } from '@/components/ProfileDropdown'
import { useAuth } from '@/hooks/useAuth'
import type { AuthUser } from '@/types/auth'
import type { Household } from '@/types/household'

type HeaderProps = {
  household?: Household | null
}

export const Header = ({ household }: HeaderProps) => {
  const { user } = useAuth()

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-[var(--color-border-default)] bg-[var(--color-bg-primary)] px-4">
      <Link to="/meals" className="flex items-center gap-2 text-[var(--color-text-primary)]" activeOptions={{ exact: false }}>
        <i className="ti ti-calendar-week text-xl text-[var(--color-accent)]" />
        <span className="text-base font-medium">mealWise</span>
      </Link>

      {user && <ProfileDropdown user={user as AuthUser} household={household ?? null} />}
    </header>
  )
}
