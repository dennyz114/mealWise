import type { MealIngredient } from '@/types/meals'
import { useTranslation } from '@/hooks/useTranslation'
import { CategoryBadge } from './CategoryBadge'

type IngredientRowProps = {
  ingredient: MealIngredient
  onEdit: (ingredient: MealIngredient) => void
  onDelete: (ingredientId: string) => void
}

export const IngredientRow = ({
  ingredient,
  onEdit,
  onDelete,
}: IngredientRowProps) => {
  const { t } = useTranslation()

  return (
    <div
      className="flex items-center gap-[var(--space-3)] border-b border-[var(--color-border-default)] py-3"
      onClick={() => onEdit(ingredient)}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-medium text-[var(--color-text-primary)]">
            {ingredient.name}
          </span>
          <span className="text-[13px] text-[var(--color-text-secondary)]">
            {ingredient.quantity} {t(`units.${ingredient.unit}`)}
          </span>
        </div>
        <div className="mt-1">
          <CategoryBadge
            category={
              ingredient.category as
                | 'vegetables'
                | 'proteins'
                | 'pantry'
                | 'fruits'
                | 'spices'
                | 'cleaning'
            }
          />
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete(ingredient.id)
        }}
        className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-cat-protein-text)]"
        aria-label="Delete ingredient"
      >
        <i className="ti ti-trash text-[18px]" />
      </button>
    </div>
  )
}
