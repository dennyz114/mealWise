import { useState } from 'react'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { useTranslation } from '@/hooks/useTranslation'
import { CategoryBadge } from './CategoryBadge'
import { QtyEditBottomSheet } from './QtyEditBottomSheet'
import { QtyEditPopover } from './QtyEditPopover'
import type { MealIngredient, IngredientCategory } from '@/types/meals'

type EditableIngredientRowProps = {
  ingredient: MealIngredient
  isEditing: boolean
  onUpdateQuantity: (ingredientId: string, quantity: number) => void
  onDelete: (ingredientId: string) => void
}

export const EditableIngredientRow = ({
  ingredient,
  isEditing,
  onUpdateQuantity,
  onDelete,
}: EditableIngredientRowProps) => {
  const { t } = useTranslation()
  const { isDesktop } = useBreakpoint()
  const [isQtySheetOpen, setIsQtySheetOpen] = useState(false)
  const [showPopover, setShowPopover] = useState(false)

  const handleQtyClick = () => {
    if (isDesktop) {
      setShowPopover(!showPopover)
    } else {
      setIsQtySheetOpen(true)
    }
  }

  const handleUpdateQuantity = (quantity: number) => {
    onUpdateQuantity(ingredient.id, quantity)
    setIsQtySheetOpen(false)
    setShowPopover(false)
  }

  const handleCancelPopover = () => {
    setShowPopover(false)
  }

  if (!isEditing) {
    return (
      <div className="flex items-center gap-[var(--space-3)] border-b border-[var(--color-border-default)] py-3">
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
              category={ingredient.category as IngredientCategory}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center gap-[var(--space-3)] border-b border-[var(--color-border-default)] py-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-medium text-[var(--color-text-primary)]">
              {ingredient.name}
            </span>
            <button
              onClick={handleQtyClick}
              className="relative rounded-[var(--radius-sm)] bg-[var(--color-bg-secondary)] px-2 py-0.5 text-[13px] text-[var(--color-text-primary)] hover:bg-[var(--color-accent-subtle)]"
            >
              {ingredient.quantity} {t(`units.${ingredient.unit}`)}
              {showPopover && isDesktop && (
                <QtyEditPopover
                  ingredient={ingredient}
                  onUpdate={handleUpdateQuantity}
                  onCancel={handleCancelPopover}
                />
              )}
            </button>
          </div>
          <div className="mt-1">
            <CategoryBadge
              category={ingredient.category as IngredientCategory}
            />
          </div>
        </div>

        <button
          onClick={() => onDelete(ingredient.id)}
          className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-cat-protein-text)]"
          aria-label="Delete ingredient"
        >
          <i className="ti ti-trash text-[18px]" />
        </button>
      </div>

      <QtyEditBottomSheet
        open={isQtySheetOpen}
        onOpenChange={setIsQtySheetOpen}
        ingredient={ingredient}
        onUpdate={handleUpdateQuantity}
      />
    </>
  )
}
