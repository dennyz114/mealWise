import { useState, useEffect, useRef, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useHousehold } from '@/hooks/useHousehold'
import { useBreakpoint } from '@/hooks/useBreakpoint'
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

const MAX_RESULTS_MOBILE = 4
const MAX_RESULTS_DESKTOP = 10
const SEARCH_DEBOUNCE_MS = 300

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
  const { isDesktop } = useBreakpoint()
  const inputRef = useRef<HTMLInputElement>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [addingLibraryItem, setAddingLibraryItem] =
    useState<LibraryIngredient | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newFormName, setNewFormName] = useState('')

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const { data: library = [], isLoading: libraryLoading } = useQuery({
    queryKey: queryKeys.ingredientLibrary(household?.id ?? ''),
    queryFn: () => getIngredientLibrary(household?.id ?? ''),
    enabled: !!household?.id,
  })

  const filteredLibrary = useMemo(() => {
    if (!debouncedQuery.trim()) return []
    const query = debouncedQuery.toLowerCase()
    return library.filter((item) =>
      item.name.toLowerCase().includes(query),
    )
  }, [library, debouncedQuery])

  const maxResults = isDesktop ? MAX_RESULTS_DESKTOP : MAX_RESULTS_MOBILE
  const displayedResults = filteredLibrary.slice(0, maxResults)
  const hasQuery = searchQuery.trim().length > 0
  const hasResults = displayedResults.length > 0

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    setShowDropdown(value.trim().length > 0)
    setShowNewForm(false)
    setAddingLibraryItem(null)
  }

  const handleInputFocus = () => {
    if (searchQuery.trim().length > 0) {
      setShowDropdown(true)
    }
  }

  const handleClearInput = () => {
    setSearchQuery('')
    setDebouncedQuery('')
    setShowDropdown(false)
    setShowNewForm(false)
    setAddingLibraryItem(null)
    inputRef.current?.focus()
  }

  const handleSelectLibraryItem = (item: LibraryIngredient) => {
    setAddingLibraryItem(item)
    setShowDropdown(false)
  }

  const handleAddFromLibrary = (quantity: number) => {
    if (!addingLibraryItem) return
    const newIngredient: TemporaryIngredient = {
      id: crypto.randomUUID(),
      name: addingLibraryItem.name,
      quantity,
      unit: addingLibraryItem.unit as IngredientUnit,
      category: addingLibraryItem.category,
      isExisting: true,
    }
    onAddIngredient(newIngredient)
    setAddingLibraryItem(null)
    setSearchQuery('')
    setDebouncedQuery('')
    setShowDropdown(false)
    inputRef.current?.focus()
  }

  const handleAddAsNew = () => {
    setNewFormName(searchQuery.trim())
    setShowNewForm(true)
    setShowDropdown(false)
    setAddingLibraryItem(null)
  }

  const handleAddNewIngredient = (data: {
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
    setSearchQuery('')
    setDebouncedQuery('')
    inputRef.current?.focus()
  }

  const handleCancelNewForm = () => {
    setShowNewForm(false)
    setNewFormName('')
    inputRef.current?.focus()
  }

  const handleCancelQtyPrompt = () => {
    setAddingLibraryItem(null)
    inputRef.current?.focus()
  }

  // Render qty prompt overlay
  if (addingLibraryItem) {
    return (
      <div className="space-y-4">
        <InlineQtyPrompt
          ingredient={addingLibraryItem}
          onAdd={handleAddFromLibrary}
          onCancel={handleCancelQtyPrompt}
        />
      </div>
    )
  }

  // Render new ingredient form
  if (showNewForm) {
    return (
      <div className="space-y-4">
        <NewIngredientForm
          initialName={newFormName}
          onAdd={handleAddNewIngredient}
          onCancel={handleCancelNewForm}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">

      {/* Ingredients label */}
      <h3 className="text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
        {ingredients.length > 0
          ? `${t('meals.wizardIngredientsLabel')} — ${ingredients.length}`
          : t('meals.wizardIngredientsLabel')}
      </h3>

      {/* Added ingredients list */}
      {ingredients.length > 0 && (
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
                onClick={() => {
                  /* handled by parent */
                }}
                className="flex size-7 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)]"
              >
                <i className="ti ti-trash text-[14px]" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {ingredients.length === 0 && !hasQuery && (
        <div className="flex flex-col items-center justify-center rounded-[var(--radius-md)] border-[0.5px] border-dashed border-[var(--color-border-default)] bg-[var(--color-bg-secondary)] py-8">
          <i className="ti ti-tools-kitchen-2 mb-3 text-[32px] text-[var(--color-text-tertiary)]" />
          <p className="text-[13px] text-[var(--color-text-secondary)]">
            {t('meals.wizardEmptyIngredients')}
          </p>
        </div>
      )}

      {/* Search input with dropdown */}
      <div className="relative">
        {/* Input */}
        <div
          className={[
            'relative flex items-center',
            showDropdown && hasQuery
              ? 'rounded-t-[var(--radius-md)] border-[0.5px] border-b-0 border-[var(--color-border-default)] bg-[var(--color-bg-primary)]'
              : 'rounded-[var(--radius-md)] border-[0.5px] border-[var(--color-border-default)] bg-[var(--color-bg-primary)]',
          ].join(' ')}
        >
          <i className="ti ti-search absolute left-3 text-[var(--color-text-tertiary)]" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder={t('meals.wizardSearchIngredients')}
            className="w-full bg-transparent py-2.5 pl-9 pr-9 text-[13px] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)]"
          />
          {searchQuery && (
            <button
              onClick={handleClearInput}
              className="absolute right-3 flex size-5 items-center justify-center rounded-full text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)]"
            >
              <i className="ti ti-x text-[14px]" />
            </button>
          )}
        </div>

        {/* Dropdown */}
        {showDropdown && hasQuery && (
          <div className="rounded-b-[var(--radius-md)] border-[0.5px] border-[var(--color-border-default)] border-t-0 bg-[var(--color-bg-primary)]">
            {/* Loading state */}
            {libraryLoading && (
              <div className="flex items-center gap-2 px-3 py-3">
                <div className="size-4 animate-spin rounded-full border-2 border-[var(--color-border-default)] border-t-[var(--color-accent)]" />
                <span className="text-[12px] text-[var(--color-text-secondary)]">
                  {t('meals.wizardSearching')}
                </span>
              </div>
            )}

            {/* No matches */}
            {!libraryLoading && !hasResults && (
              <div className="flex items-center gap-2 px-3 py-3">
                <i className="ti ti-search text-[14px] text-[var(--color-text-tertiary)]" />
                <span className="text-[12px] text-[var(--color-text-secondary)]">
                  {t('meals.wizardNoMatches', { query: searchQuery })}
                </span>
              </div>
            )}

            {/* Results */}
            {!libraryLoading && hasResults && (
              <div className="max-h-[240px] overflow-y-auto">
                {displayedResults.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleSelectLibraryItem(item)}
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-[var(--color-bg-secondary)]"
                  >
                    <CategoryBadge
                      category={item.category as IngredientCategory}
                    />
                    <span className="flex-1 text-[13px] font-medium text-[var(--color-text-primary)]">
                      {item.name}
                    </span>
                    <span className="text-[12px] text-[var(--color-text-secondary)]">
                      {t(`units.${item.unit}`)}
                    </span>
                    <div className="flex size-6 items-center justify-center rounded-full bg-[var(--color-accent)] text-white">
                      <i className="ti ti-plus text-[12px]" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Add as new option - always at bottom */}
            <button
              onClick={handleAddAsNew}
              className="flex w-full items-center gap-2 border-t-[0.5px] border-[var(--color-border-default)] bg-[var(--color-accent-subtle)] px-3 py-3 text-left transition-colors hover:bg-[var(--color-accent)]/10"
            >
              <div className="flex size-6 items-center justify-center rounded-full bg-[var(--color-accent)] text-white">
                <i className="ti ti-plus text-[12px]" />
              </div>
              <span className="text-[13px] font-medium text-[var(--color-accent)]">
                {t('meals.wizardAddAsNew', { name: searchQuery })}
              </span>
            </button>
          </div>
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
