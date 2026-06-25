import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/planner')({
  component: PlannerPage,
})

function PlannerPage() {
  return (
    <div className="p-4">
      <h1 className="text-lg font-medium text-[var(--color-text-primary)]">Planner</h1>
      <p className="mt-2 text-sm text-[var(--color-text-secondary)]">Coming soon.</p>
    </div>
  )
}
