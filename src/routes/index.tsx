import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { Utensils, LogOut } from 'lucide-react'
import { getSession, signOut } from '@/lib/auth'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const session = await getSession()
    if (!session) {
      throw redirect({ to: '/login' as const })
    }
  },
  component: HomePage,
})

function HomePage() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate({ to: '/login' })
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
      <Utensils className="h-12 w-12 text-neutral-400" />
      <h1 className="text-2xl font-semibold tracking-tight">mealWise</h1>
      <p className="text-sm text-neutral-500">Coming soon.</p>
      <button
        type="button"
        onClick={handleLogout}
        className="mt-4 flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-transparent px-4 py-2 text-[14px] font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-bg-secondary)]"
      >
        <LogOut className="size-4" />
        Sign out
      </button>
    </main>
  )
}
