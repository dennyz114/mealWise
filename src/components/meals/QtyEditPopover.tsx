import { useState, useEffect, useRef } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { Button } from '@/components/ui/button'
import type { MealIngredient } from '@/types/meals'

type QtyEditPopoverProps = {
  ingredient: MealIngredient
  onUpdate: (quantity: number) => void
  onCancel: () => void
  isLoading?: boolean
}

export const QtyEditPopover = ({
  ingredient,
  onUpdate,
  onCancel,
  isLoading,
}: QtyEditPopoverProps) => {
  const { t } = useTranslation()
  const [quantity, setQuantity] = useState(ingredient.quantity.toString())
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setQuantity(ingredient.quantity.toString())
    inputRef.current?.focus()
  }, [ingredient.quantity])

  const handleUpdate = () => {
    const qty = parseFloat(quantity)
    if (!isNaN(qty) && qty > 0) {
      onUpdate(qty)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUpdate()
    } else if (e.key === 'Escape') {
      onCancel()
    }
  }

  return (
    <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-[var(--radius-lg)] border-[0.5px] border-[var(--color-border-default)] bg-[var(--color-bg-primary)] p-3 shadow-lg">
      <label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--color-text-tertiary)]">
        {t('meals.quantity')}
      </label>
      <input
        ref={inputRef}
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        onKeyDown={handleKeyDown}
        min="0"
        step="0.25"
        className="mb-2 w-full rounded-[var(--radius-md)] border-[0.5px] border-[var(--color-border-default)] bg-[var(--color-bg-primary)] px-3 py-2 text-[13px] text-[var(--color-text-primary)] outline-none focus:border-[1.5px] focus:border-[var(--color-accent)]"
      />
      <div className="flex gap-2">
        <Button
          variant="ghost"
          onClick={onCancel}
          className="flex-1 text-[12px]"
        >
          {t('meals.cancelButton')}
        </Button>
        <Button
          variant="primary"
          onClick={handleUpdate}
          disabled={!quantity || isNaN(parseFloat(quantity)) || parseFloat(quantity) <= 0}
          isLoading={isLoading}
          className="flex-1 text-[12px]"
        >
          {t('meals.updateButton')}
        </Button>
      </div>
    </div>
  )
}
