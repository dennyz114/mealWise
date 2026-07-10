import { useTranslation } from '@/hooks/useTranslation'
import { Button } from '@/components/ui/button'
import { CategoryBadge } from '@/components/meals/CategoryBadge'
import type { TemporaryIngredient, IngredientCategory } from '@/types/meals'

type MealSuccessScreenProps = {
  mealName: string
  ingredients: TemporaryIngredient[]
  onViewMeal: () => void
  onBackToMeals: () => void
}

export const MealSuccessScreen = ({
  mealName,
  ingredients,
  onViewMeal,
  onBackToMeals,
}: MealSuccessScreenProps) => {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center py-6 text-center">
      {/* Success icon */}
      <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-[#0D9488]">
        <i className="ti ti-check text-[32px] text-white" />
      </div>

      {/* Title */}
      <h2 className="mb-1 text-[17px] font-medium text-[var(--color-text-primary)]">
        {t('meals.wizardSuccessTitle', { name: mealName })}
      </h2>

      {/* Subtitle */}
      <p className="mb-4 text-[13px] text-[var(--color-text-secondary)]">
        {t('meals.wizardSuccessSubtitle', { count: ingredients.length })}
      </p>

      {/* Ingredient badges */}
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {ingredients.map((ing) => (
          <CategoryBadge
            key={ing.id}
            category={ing.category as IngredientCategory}
            name={ing.name}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex w-full gap-2">
        <Button
          variant="secondary"
          onClick={onBackToMeals}
          className="flex-1"
        >
          {t('meals.wizardBackToMeals')}
        </Button>
        <Button onClick={onViewMeal} className="flex-1">
          {t('meals.wizardViewMeal')}
        </Button>
      </div>
    </div>
  )
}
