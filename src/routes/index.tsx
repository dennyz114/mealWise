import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { Utensils, LogOut } from 'lucide-react'
import { getSession, signOut } from '@/lib/auth'
import { Button } from '@/components/ui/button'

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
      <Button variant="secondary" icon={LogOut} onClick={handleLogout} className="mt-4">
        Sign out
      </Button>
    </main>
  )
}
