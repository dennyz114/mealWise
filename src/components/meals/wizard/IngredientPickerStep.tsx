import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useHousehold } from '@/hooks/useHousehold'
import { useTranslation } from '@/hooks/useTranslation'
import { getIngredientLibrary } from '@/lib/meals'
import { queryKeys } from '@/lib/queryKeys'
import { Button } from '@/components/ui/button'
import { CategoryBadge } from '@/components/meals/CategoryBadge'
import { InlineQtyPrompt } from './InlineQtyPrompt'
import { NewIngredientForm } from './NewIngredientForm'
import type {
  TemporaryIngredient,
  LibraryIngredient,
  IngredientCategory,
  IngredientUnit,
} from '@/types/meals'

type IngredientPickerStepProps = {
  ingredients: TemporaryIngredient[]
  onAddIngredient: (ingredient: TemporaryIngredient) => void
  onNext: () => void
  onBack: () => void
}

export const IngredientPickerStep = ({
  ingredients,
  onAddIngredient,
  onNext,
  onBack,
}: IngredientPickerStepProps) => {
  const { t } = useTranslation()
  const { household } = useHousehold()
  const [search, setSearch] = useState('')
  const [addingLibraryItem, setAddingLibraryItem] =
    useState<LibraryIngredient | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)

  const { data: library = [], isLoading: libraryLoading } = useQuery({
    queryKey: queryKeys.ingredientLibrary(household?.id ?? ''),
    queryFn: () => getIngredientLibrary(household?.id ?? ''),
    enabled: !!household?.id,
  })

  const filteredLibrary = useMemo(
    () =>
      library.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [library, search],
  )

  const handleAddFromLibrary = (ingredient: LibraryIngredient, quantity: number) => {
    const newIngredient: TemporaryIngredient = {
      id: crypto.randomUUID(),
      name: ingredient.name,
      quantity,
      unit: ingredient.unit as IngredientUnit,
      category: ingredient.category,
      isExisting: true,
    }
    onAddIngredient(newIngredient)
    setAddingLibraryItem(null)
    setSearch('')
  }

  const handleAddNew = (data: {
    name: string
    quantity: number
    unit: string
    category: string
  }) => {
    const newIngredient: TemporaryIngredient = {
      id: crypto.randomUUID(),
      name: data.name,
      quantity: data.quantity,
      unit: data.unit as IngredientUnit,
      category: data.category as IngredientCategory,
      isExisting: false,
    }
    onAddIngredient(newIngredient)
    setShowNewForm(false)
    setSearch('')
  }

  return (
    <div className="space-y-4">

      {/* Search */}
      {!libraryLoading && filteredLibrary.length > 0 &&
        <div>
          <div className="relative">
            <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('meals.wizardSearchIngredients')}
              className="w-full rounded-[var(--radius-md)] border-[0.5px] border-[var(--color-border-default)] bg-[var(--color-bg-primary)] py-2.5 pl-9 pr-3 text-[13px] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)] focus:border-[1.5px] focus:border-[var(--color-accent)]"
            />
          </div>
        </div>
      }

      {/* Library section */}
      <div>
        <h3 className="mb-2 text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
          {t('meals.wizardFromLibrary')}
        </h3>

        {libraryLoading && (
          <div className="py-4 text-center text-[12px] text-[var(--color-text-secondary)]">
            {t('meals.wizardLoadingLibrary')}
          </div>
        )}

        {!libraryLoading && filteredLibrary.length === 0 && (
          <div className="py-4 text-center text-[12px] text-[var(--color-text-secondary)]">
            {search
              ? t('meals.wizardNoResults')
              : t('meals.wizardEmptyLibrary')}
          </div>
        )}

        <div className="space-y-2">
          {filteredLibrary.map((item) => (
            <div key={item.name}>
              <div className="flex items-center gap-2 rounded-[var(--radius-md)] border-[0.5px] border-[var(--color-border-default)] bg-[var(--color-bg-primary)] p-3">
                <CategoryBadge
                  category={item.category as IngredientCategory}
                />
                <span className="flex-1 text-[13px] font-medium text-[var(--color-text-primary)]">
                  {item.name}
                </span>
                <span className="text-[12px] text-[var(--color-text-secondary)]">
                  {t(`units.${item.unit}`)}
                </span>
                <button
                  onClick={() => setAddingLibraryItem(item)}
                  className="flex size-7 items-center justify-center rounded-full bg-[var(--color-accent)] text-white"
                >
                  <i className="ti ti-plus text-[14px]" />
                </button>
              </div>

              {addingLibraryItem?.name === item.name && (
                <InlineQtyPrompt
                  ingredient={item}
                  onAdd={(qty) => handleAddFromLibrary(item, qty)}
                  onCancel={() => setAddingLibraryItem(null)}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* New ingredient section */}
      <div>
        <h3 className="mb-2 text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
          {t('meals.wizardOrAddNew')}
        </h3>

        {!showNewForm ? (
          <button
            onClick={() => setShowNewForm(true)}
            className="w-full rounded-[var(--radius-md)] border-[0.5px] border-[var(--color-border-default)] bg-[var(--color-bg-primary)] px-3 py-2.5 text-left text-[13px] text-[var(--color-text-tertiary)]"
          >
            {t('meals.wizardTypeNewIngredient')}
          </button>
        ) : (
          <NewIngredientForm
            initialName={search}
            onAdd={handleAddNew}
            onCancel={() => {
              setShowNewForm(false)
              setSearch('')
            }}
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button variant="ghost" onClick={onBack} className="flex-1">
          {t('meals.wizardBack')}
        </Button>
        <Button
          onClick={onNext}
          disabled={ingredients.length === 0}
          className="flex-1"
        >
          {t('meals.wizardNext')}
        </Button>
      </div>
    </div>
  )
}
