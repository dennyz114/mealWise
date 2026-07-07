import { createFileRoute } from '@tanstack/react-router'
import { MealDetailPage } from '@/components/meals/MealDetailPage'

export const Route = createFileRoute('/_authenticated/meals/$mealId')({
  component: MealDetailPage,
})
