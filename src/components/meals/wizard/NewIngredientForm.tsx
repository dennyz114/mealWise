import { useState, useEffect, useRef } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { detectCategory } from '@/lib/ai'
import { Button } from '@/components/ui/button'
import type { IngredientCategory, IngredientUnit } from '@/types/meals'

const UNITS: IngredientUnit[] = ['units', 'kg', 'l', 'pack', 'bunch', 'can']

type NewIngredientFormProps = {
  initialName?: string
  onAdd: (data: {
    name: string
    quantity: number
    unit: string
    category: string
  }) => void
  onCancel: () => void
}

export const NewIngredientForm = ({
  initialName = '',
  onAdd,
  onCancel,
}: NewIngredientFormProps) => {
  const { t } = useTranslation()
  const [name, setName] = useState(initialName)
  const [quantity, setQuantity] = useState('1')
  const [unit, setUnit] = useState<IngredientUnit>('units')
  const [category, setCategory] = useState<IngredientCategory>('pantry')
  const [aiSuggestion, setAiSuggestion] = useState<IngredientCategory | null>(
    null,
  )
  const [isDetecting, setIsDetecting] = useState(false)
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)
  const [userManuallyChanged, setUserManuallyChanged] = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastDetectedNameRef = useRef('')

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (!name.trim()) {
      setAiSuggestion(null)
      setIsDetecting(false)
      lastDetectedNameRef.current = ''
      return
    }

    if (userManuallyChanged) return

    debounceRef.current = setTimeout(async () => {
      if (name === lastDetectedNameRef.current) return

      setIsDetecting(true)
      try {
        const result = await detectCategory(name)
        setAiSuggestion(result)
        setCategory(result)
        lastDetectedNameRef.current = name
      } catch {
        // AI detection failed, default to pantry
      } finally {
        setIsDetecting(false)
      }
    }, 1000)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [name, userManuallyChanged])

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  const handleAdd = () => {
    const quantityNum = parseFloat(quantity)
    if (!name.trim() || isNaN(quantityNum) || quantityNum <= 0) return

    onAdd({
      name: name.trim(),
      quantity: quantityNum,
      unit,
      category,
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && name.trim()) {
      handleAdd()
    }
  }

  const handleCategorySelect = (cat: IngredientCategory) => {
    setCategory(cat)
    setShowCategoryPicker(false)
    setUserManuallyChanged(true)
    setAiSuggestion(null)
  }

  const handleNameChange = (newName: string) => {
    setName(newName)
    if (newName !== name) {
      setUserManuallyChanged(false)
      setAiSuggestion(null)
      lastDetectedNameRef.current = ''
    }
  }

  const isFormValid =
    name.trim() && !isNaN(parseFloat(quantity)) && parseFloat(quantity) > 0

  return (
    <div className="space-y-3 rounded-[var(--radius-md)] border-[0.5px] border-[var(--color-border-default)] bg-[var(--color-bg-secondary)] p-3">
      <h3 className="text-[15px] font-medium text-[var(--color-text-primary)]">
        {t('meals.wizardNewIngredient')}
      </h3>

      {/* Name */}
      <div>
        <label className="mb-1 block text-[12px] text-[var(--color-text-secondary)]">
          {t('meals.wizardIngredientName')}
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('meals.wizardTypeNewIngredient')}
          className="w-full rounded-[var(--radius-md)] border-[0.5px] border-[var(--color-border-default)] bg-[var(--color-bg-primary)] px-3 py-2.5 text-[13px] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)] focus:border-[1.5px] focus:border-[var(--color-accent)]"
          autoFocus
        />
      </div>

      {/* Quantity + Unit */}
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="mb-1 block text-[12px] text-[var(--color-text-secondary)]">
            {t('meals.wizardQuantity')}
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="0.1"
            step="0.5"
            className="w-full rounded-[var(--radius-md)] border-[0.5px] border-[var(--color-border-default)] bg-[var(--color-bg-primary)] px-3 py-2.5 text-[13px] text-[var(--color-text-primary)] outline-none focus:border-[1.5px] focus:border-[var(--color-accent)]"
          />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-[12px] text-[var(--color-text-secondary)]">
            {t('meals.wizardUnit')}
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
        <label className="mb-1 block text-[12px] text-[var(--color-text-secondary)]">
          {t('meals.wizardCategory')}
        </label>

        {isDetecting && (
          <div className="flex items-center gap-2 py-2">
            <div className="size-4 animate-spin rounded-full border-2 border-[var(--color-border-default)] border-t-[var(--color-accent)]" />
            <span className="text-[12px] text-[var(--color-text-secondary)]">
              {t('meals.detectingCategory')}
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

        {!aiSuggestion && !showCategoryPicker && (
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

        {showCategoryPicker && (
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
      <div className="flex gap-2">
        <Button
          onClick={handleAdd}
          disabled={!isFormValid}
          className="flex-1"
        >
          {t('meals.wizardAddToMeal')}
        </Button>
        <Button variant="ghost" onClick={onCancel} className="flex-1">
          {t('meals.wizardCancel')}
        </Button>
      </div>
    </div>
  )
}
