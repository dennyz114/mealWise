import { Outlet } from '@tanstack/react-router'
import { Header } from '@/components/Header'
import { Sidebar } from '@/components/Sidebar'
import { BottomTabBar } from '@/components/BottomTabBar'
import { HouseholdSetup } from '@/components/household/HouseholdSetup'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { useAuth } from '@/hooks/useAuth'
import { useHousehold } from '@/hooks/useHousehold'
import type { AuthUser } from '@/types/auth'

export const AppLayout = () => {
  const { isDesktop } = useBreakpoint()
  const { user } = useAuth()
  const { household, isLoading } = useHousehold()

  // Show loading skeleton while fetching household
  if (isLoading) {
    return (
      <div className="flex h-dvh flex-col">
        <Header household={null} />
        <div className="flex flex-1 items-center justify-center pt-14">
          <div className="flex flex-col items-center gap-3">
            <svg className="size-6 animate-spin text-[var(--color-accent)]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        </div>
      </div>
    )
  }

  // If user has no household, show the setup gate
  if (!household) {
    return (
      <div className="flex h-dvh flex-col">
        <Header household={null} />
        <div className="flex flex-1 pt-14">
          <main className="flex-1 overflow-y-auto">
            {user && <HouseholdSetup user={user as AuthUser} />}
          </main>
        </div>
      </div>
    )
  }

  // Normal app layout with household
  return (
    <div className="flex h-dvh flex-col">
      <Header household={household} />

      <div className="flex flex-1 pt-14">
        {isDesktop && <Sidebar household={household} />}

        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <Outlet />
        </main>
      </div>

      {!isDesktop && <BottomTabBar household={household} />}
    </div>
  )
}
