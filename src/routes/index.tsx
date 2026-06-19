import { createFileRoute } from '@tanstack/react-router'
import { Utensils } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
      <Utensils className="h-12 w-12 text-neutral-400" />
      <h1 className="text-2xl font-semibold tracking-tight">mealWise</h1>
      <p className="text-sm text-neutral-500">Coming soon.</p>
    </main>
  )
}
