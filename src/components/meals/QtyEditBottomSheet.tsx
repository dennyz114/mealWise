import { useState, useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { BottomSheet } from '@/components/ui/bottom-sheet'
import { Button } from '@/components/ui/button'
import { CategoryBadge } from './CategoryBadge'
import type { MealIngredient, IngredientCategory } from '@/types/meals'

type QtyEditBottomSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  ingredient: MealIngredient
  onUpdate: (quantity: number) => void
  isLoading?: boolean
}

export const QtyEditBottomSheet = ({
  open,
  onOpenChange,
  ingredient,
  onUpdate,
  isLoading,
}: QtyEditBottomSheetProps) => {
  const { t } = useTranslation()
  const [quantity, setQuantity] = useState(ingredient.quantity.toString())

  useEffect(() => {
    if (open) {
      setQuantity(ingredient.quantity.toString())
    }
  }, [open, ingredient.quantity])

  const handleUpdate = () => {
    const qty = parseFloat(quantity)
    if (!isNaN(qty) && qty > 0) {
      onUpdate(qty)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUpdate()
    }
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t('meals.editIngredientTitle')}
    >
      <div className="flex flex-col gap-[var(--space-4)]">
        <div className="flex items-center gap-2">
          <CategoryBadge
            category={ingredient.category as IngredientCategory}
          />
          <span className="text-[14px] font-medium text-[var(--color-text-primary)]">
            {ingredient.name}
          </span>
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--color-text-tertiary)]">
            {t('meals.quantity')}
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            onKeyDown={handleKeyDown}
            min="0"
            step="0.25"
            className="w-full rounded-[var(--radius-md)] border-[0.5px] border-[var(--color-border-default)] bg-[var(--color-bg-primary)] px-3 py-2.5 text-[14px] text-[var(--color-text-primary)] outline-none focus:border-[1.5px] focus:border-[var(--color-accent)]"
            autoFocus
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            {t('meals.cancelButton')}
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdate}
            disabled={!quantity || isNaN(parseFloat(quantity)) || parseFloat(quantity) <= 0}
            isLoading={isLoading}
            className="flex-1"
          >
            {t('meals.updateButton')}
          </Button>
        </div>
      </div>
    </BottomSheet>
  )
}
