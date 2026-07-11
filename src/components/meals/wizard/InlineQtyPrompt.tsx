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
    <div className="space-y-4 rounded-[var(--radius-lg)] border-[0.5px] border-[var(--color-border-default)] bg-[var(--color-bg-primary)] p-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <h3 className="text-[17px] font-medium text-[var(--color-text-primary)]">
          {ingredient.name}
        </h3>
        <CategoryBadge category={ingredient.category as IngredientCategory} />
      </div>

      {/* Unit info */}
      <p className="text-[13px] text-[var(--color-text-secondary)]">
        {t('meals.wizardUnitInfo', { unit: ingredient.unit })}
      </p>

      {/* Quantity input */}
      <div>
        <label className="mb-1.5 block text-[13px] text-[var(--color-text-secondary)]">
          {t('meals.wizardQuantity')}
        </label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          onKeyDown={handleKeyDown}
          min="0.1"
          step="0.5"
          className="w-full rounded-[var(--radius-md)] border-[0.5px] border-[var(--color-border-default)] bg-[var(--color-bg-secondary)] px-3 py-2.5 text-[13px] text-[var(--color-text-primary)] outline-none focus:border-[1.5px] focus:border-[var(--color-accent)]"
          autoFocus
        />
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <Button
          onClick={handleAdd}
          disabled={quantity <= 0}
          className="w-full"
        >
          {t('meals.wizardAddToMeal')}
        </Button>
        <Button
          variant="ghost"
          onClick={onCancel}
          className="w-full"
        >
          {t('meals.wizardCancel')}
        </Button>
      </div>
    </div>
  )
}
