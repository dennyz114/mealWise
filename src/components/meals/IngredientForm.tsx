import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { detectCategory } from '@/lib/ai'
import type {
  MealIngredient,
  IngredientCategory,
  IngredientUnit,
} from '@/types/meals'
import { Button } from '@/components/ui/button'

const UNITS: IngredientUnit[] = ['units', 'kg', 'l', 'pack', 'bunch', 'can']

type IngredientFormProps = {
  ingredient?: MealIngredient
  onSave: (data: {
    name: string
    quantity: number
    unit: string
    category: string
  }) => void
  onCancel?: () => void
  isLoading?: boolean
}

export const IngredientForm = ({
  ingredient,
  onSave,
  onCancel,
  isLoading = false,
}: IngredientFormProps) => {
  const { t } = useTranslation()

  const [name, setName] = useState(ingredient?.name ?? '')
  const [quantity, setQuantity] = useState<string>(
    ingredient?.quantity?.toString() ?? '',
  )
  const [unit, setUnit] = useState<IngredientUnit>(
    (ingredient?.unit as IngredientUnit) ?? 'units',
  )
  const [category, setCategory] = useState<IngredientCategory>(
    (ingredient?.category as IngredientCategory) ?? 'pantry',
  )
  const [aiSuggestion, setAiSuggestion] = useState<IngredientCategory | null>(
    null,
  )
  const [isDetecting, setIsDetecting] = useState(false)
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const nameRef = useRef(name)

  const detectCategoryDebounced = useCallback(
    (ingredientName: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      if (!ingredientName.trim()) {
        setAiSuggestion(null)
        setIsDetecting(false)
        return
      }

      setIsDetecting(true)
      debounceRef.current = setTimeout(async () => {
        try {
          const result = await detectCategory(ingredientName)
          setAiSuggestion(result)
          if (!ingredient) {
            setCategory(result)
          }
        } catch {
          // AI detection failed, default to pantry
        } finally {
          setIsDetecting(false)
        }
      }, 500)
    },
    [ingredient],
  )

  useEffect(() => {
    if (name !== nameRef.current) {
      nameRef.current = name
      detectCategoryDebounced(name)
    }
  }, [name, detectCategoryDebounced])

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  const handleSave = () => {
    const quantityNum = parseFloat(quantity)
    if (!name.trim() || isNaN(quantityNum) || quantityNum <= 0) return

    onSave({
      name: name.trim(),
      quantity: quantityNum,
      unit,
      category,
    })
  }

  const handleCategorySelect = (cat: IngredientCategory) => {
    setCategory(cat)
    setShowCategoryPicker(false)
  }

  const isFormValid =
    name.trim() && !isNaN(parseFloat(quantity)) && parseFloat(quantity) > 0

  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <div>
        <h3 className="text-[15px] font-medium text-[var(--color-text-primary)]">
          {ingredient
            ? t('meals.editIngredientTitle')
            : t('meals.newIngredientTitle')}
        </h3>
        <p className="mt-0.5 text-[12px] text-[var(--color-text-secondary)]">
          {t('meals.newIngredientSubtitle')}
        </p>
      </div>

      {/* Name */}
      <div>
        <label className="mb-1 block text-[13px] font-medium text-[var(--color-text-primary)]">
          {t('meals.ingredientName')}
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('meals.ingredientNamePlaceholder')}
          className="w-full rounded-[var(--radius-md)] border-[0.5px] border-[var(--color-border-default)] bg-[var(--color-bg-primary)] px-3 py-2.5 text-[13px] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)] focus:border-[1.5px] focus:border-[var(--color-accent)]"
        />
      </div>

      {/* Quantity + Unit row */}
      <div className="flex gap-[var(--space-3)]">
        <div className="flex-1">
          <label className="mb-1 block text-[13px] font-medium text-[var(--color-text-primary)]">
            {t('meals.quantity')}
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="0"
            step="0.25"
            className="w-full rounded-[var(--radius-md)] border-[0.5px] border-[var(--color-border-default)] bg-[var(--color-bg-primary)] px-3 py-2.5 text-[13px] text-[var(--color-text-primary)] outline-none focus:border-[1.5px] focus:border-[var(--color-accent)]"
          />
        </div>

        <div className="flex-1">
          <label className="mb-1 block text-[13px] font-medium text-[var(--color-text-primary)]">
            {t('meals.unit')}
          </label>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value as IngredientUnit)}
            className="w-full rounded-[var(--radius-md)] border-[0.5px] border-[var(--color-border-default)] bg-[var(--color-bg-primary)] px-3 py-2.5 text-[13px] text-[var(--color-text-primary)] outline-none focus:border-[1.5px] focus:border-[var(--color-accent)]"
          >
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {t(`units.${u}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="mb-1 block text-[13px] font-medium text-[var(--color-text-primary)]">
          {t('meals.category')}
        </label>

        {/* AI suggestion chip */}
        {isDetecting && (
          <div className="flex items-center gap-2 py-2">
            <div className="size-4 animate-spin rounded-full border-2 border-[var(--color-border-default)] border-t-[var(--color-accent)]" />
            <span className="text-[12px] text-[var(--color-text-secondary)]">
              Detecting category...
            </span>
          </div>
        )}

        {!isDetecting && aiSuggestion && !showCategoryPicker && (
          <button
            onClick={() => setShowCategoryPicker(true)}
            className="flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-accent-subtle)] px-3 py-2 text-[13px] text-[var(--color-accent)]"
          >
            <i className="ti ti-sparkles text-[14px]" />
            {t('meals.aiSuggests', {
              category: t(`categories.${aiSuggestion}`),
            })}
          </button>
        )}

        {(showCategoryPicker || !aiSuggestion) && (
          <div className="flex flex-wrap gap-2 pt-1">
            {(
              [
                'vegetables',
                'proteins',
                'pantry',
                'fruits',
                'spices',
                'cleaning',
              ] as IngredientCategory[]
            ).map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`rounded-full border-[1.5px] px-3 py-1.5 text-[12px] font-medium transition-colors ${
                  category === cat
                    ? 'border-[var(--color-border-accent)] bg-[var(--color-accent-subtle)] text-[var(--color-accent)]'
                    : 'border-[var(--color-border-default)] bg-[var(--color-bg-primary)] text-[var(--color-text-secondary)]'
                }`}
              >
                {t(`categories.${cat}`)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-[var(--space-3)]">
        {onCancel && (
          <Button
            variant="secondary"
            onClick={onCancel}
            className="flex-1"
          >
            {t('meals.cancelButton')}
          </Button>
        )}
        <Button
          variant="primary"
          isLoading={isLoading}
          disabled={!isFormValid}
          onClick={handleSave}
          className="flex-1"
        >
          {isLoading
            ? t('meals.saving')
            : t('meals.saveIngredient')}
        </Button>
      </div>
    </div>
  )
}
