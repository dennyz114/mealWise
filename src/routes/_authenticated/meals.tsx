import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/meals')({
  component: MealsPage,
})

function MealsPage() {
  return (
    <div className="p-4">
      <h1 className="text-lg font-medium text-[var(--color-text-primary)]">Meals</h1>
      <p className="mt-2 text-sm text-[var(--color-text-secondary)]">Coming soon.</p>
    </div>
  )
}
