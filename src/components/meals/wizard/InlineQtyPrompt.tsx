import { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { Button } from '@/components/ui/button'
import { CategoryBadge } from '@/components/meals/CategoryBadge'
import type { LibraryIngredient, IngredientCategory } from '@/types/meals'

type InlineQtyPromptProps = {
  ingredient: LibraryIngredient
  onAdd: (quantity: number) => void
  onCancel: () => void
}

export const InlineQtyPrompt = ({
  ingredient,
  onAdd,
  onCancel,
}: InlineQtyPromptProps) => {
  const { t } = useTranslation()
  const [quantity, setQuantity] = useState(1)

  const handleAdd = () => {
    if (quantity > 0) {
      onAdd(quantity)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && quantity > 0) {
      handleAdd()
    }
  }

  return (
    <div className="mt-2 rounded-[var(--radius-md)] border-[0.5px] border-[var(--color-border-default)] bg-[var(--color-bg-secondary)] p-3">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-[13px] font-medium text-[var(--color-text-primary)]">
          {ingredient.name}
        </span>
        <CategoryBadge category={ingredient.category as IngredientCategory} />
      </div>

      <p className="mb-3 text-[12px] text-[var(--color-text-secondary)]">
        {t('meals.wizardQtyPrompt', { unit: ingredient.unit })}
      </p>

      <div className="mb-3">
        <label className="mb-1 block text-[12px] text-[var(--color-text-secondary)]">
          {t('meals.wizardQuantity')}
        </label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          onKeyDown={handleKeyDown}
          min="0.1"
          step="0.5"
          className="w-full rounded-[var(--radius-md)] border-[0.5px] border-[var(--color-border-default)] bg-[var(--color-bg-primary)] px-3 py-2 text-[13px] text-[var(--color-text-primary)] outline-none focus:border-[1.5px] focus:border-[var(--color-accent)]"
          autoFocus
        />
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleAdd}
          disabled={quantity <= 0}
          className="flex-1"
        >
          {t('meals.wizardAddToMeal')}
        </Button>
        <Button
          variant="ghost"
          onClick={onCancel}
          className="flex-1"
        >
          {t('meals.wizardCancel')}
        </Button>
      </div>
    </div>
  )
}
