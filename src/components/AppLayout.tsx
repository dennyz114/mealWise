import { Outlet } from '@tanstack/react-router'
import { Header } from '@/components/Header'
import { Sidebar } from '@/components/Sidebar'
import { BottomTabBar } from '@/components/BottomTabBar'
import { useBreakpoint } from '@/hooks/useBreakpoint'

export const AppLayout = () => {
  const { isDesktop } = useBreakpoint()

  return (
    <div className="flex h-dvh flex-col">
      <Header />

      <div className="flex flex-1 pt-14">
        {isDesktop && <Sidebar />}

        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <Outlet />
        </main>
      </div>

      {!isDesktop && <BottomTabBar />}
    </div>
  )
}
