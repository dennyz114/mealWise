import type { Meal } from '@/types/meals'
import { useTranslation } from '@/hooks/useTranslation'
import { MealCard } from './MealCard'
import { SwipeableCard } from './SwipeableCard'

type MealListProps = {
  meals: Meal[]
  ingredientCounts: Record<string, number>
  isLoading: boolean
  isDesktop: boolean
  onMealClick: (meal: Meal) => void
  onDeleteMeal: (meal: Meal) => void
}

export const MealList = ({
  meals,
  ingredientCounts,
  isLoading,
  isDesktop,
  onMealClick,
  onDeleteMeal,
}: MealListProps) => {
  const { t } = useTranslation()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="size-6 animate-spin rounded-full border-2 border-[var(--color-border-default)] border-t-[var(--color-accent)]" />
      </div>
    )
  }

  if (meals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <i className="ti ti-tools-kitchen-2 mb-3 text-[40px] text-[var(--color-text-tertiary)]" />
        <p className="text-[15px] font-medium text-[var(--color-text-primary)]">
          {t('meals.emptyTitle')}
        </p>
        <p className="mt-1 text-[13px] text-[var(--color-text-secondary)]">
          {t('meals.emptyDescription')}
        </p>
      </div>
    )
  }

  return (
    <div>
      <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--color-text-tertiary)]">
        {t('meals.recipeCount', { count: meals.length })}
      </p>

      <div
        className={
          isDesktop
            ? 'grid grid-cols-2 gap-3'
            : 'flex flex-col gap-2'
        }
      >
        {meals.map((meal) => {
          const count = ingredientCounts[meal.id] ?? 0
          const card = (
            <MealCard
              key={meal.id}
              meal={meal}
              ingredientCount={count}
              onClick={() => onMealClick(meal)}
              onDelete={() => onDeleteMeal(meal)}
              isDesktop={isDesktop}
            />
          )

          if (isDesktop) return card

          return (
            <SwipeableCard
              key={meal.id}
              onDelete={() => onDeleteMeal(meal)}
            >
              {card}
            </SwipeableCard>
          )
        })}
      </div>
    </div>
  )
}
