import { createFileRoute } from '@tanstack/react-router'
import { MealsPage } from '@/components/meals/MealsPage'

export const Route = createFileRoute('/_authenticated/meals/')({
  component: MealsPage,
})
