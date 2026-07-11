import { useTranslation } from '@/hooks/useTranslation'
import { Button } from '@/components/ui/button'
import { CategoryBadge } from '@/components/meals/CategoryBadge'
import type { TemporaryIngredient, IngredientCategory } from '@/types/meals'

type IngredientReviewStepProps = {
  ingredients: TemporaryIngredient[]
  onRemoveIngredient: (id: string) => void
  onAddMore: () => void
  onCreateMeal: () => void
  onBack: () => void
  isLoading: boolean
}

export const IngredientReviewStep = ({
  ingredients,
  onRemoveIngredient,
  onAddMore,
  onCreateMeal,
  onBack,
  isLoading,
}: IngredientReviewStepProps) => {
  const { t } = useTranslation()

  return (
    <div className="space-y-4">

      <h3 className="text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
        {t('meals.wizardIngredientsAdded', { count: ingredients.length })}
      </h3>

      {/* Ingredient list */}
      <div className="space-y-2">
        {ingredients.map((ing) => (
          <div
            key={ing.id}
            className="flex items-center gap-2 rounded-[var(--radius-md)] border-[0.5px] border-[var(--color-border-default)] bg-[var(--color-bg-primary)] p-3"
          >
            <CategoryBadge category={ing.category as IngredientCategory} />
            <span className="flex-1 text-[13px] font-medium text-[var(--color-text-primary)]">
              {ing.name}
            </span>
            <span className="text-[12px] text-[var(--color-text-secondary)]">
              {ing.quantity} {t(`units.${ing.unit}`)}
            </span>
            <button
              onClick={() => onRemoveIngredient(ing.id)}
              className="flex size-7 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)]"
            >
              <i className="ti ti-trash text-[14px]" />
            </button>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button variant="ghost" onClick={onBack} className="flex-1">
          {t('meals.wizardBack')}
        </Button>
        <Button
          variant="success"
          onClick={onCreateMeal}
          disabled={ingredients.length === 0}
          isLoading={isLoading}
          className="flex-1"
        >
          <i className="ti ti-check text-[14px]" />
          {t('meals.wizardCreateMeal')}
        </Button>
      </div>
    </div>
  )
}
