import { useState, useEffect, useRef, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useHousehold } from '@/hooks/useHousehold'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { useTranslation } from '@/hooks/useTranslation'
import { getIngredientLibrary, addIngredient } from '@/lib/meals'
import { queryKeys } from '@/lib/queryKeys'
import { CategoryBadge } from './CategoryBadge'
import { NewIngredientForm } from './wizard/NewIngredientForm'
import { InlineQtyPrompt } from './wizard/InlineQtyPrompt'
import type { LibraryIngredient, IngredientCategory } from '@/types/meals'

const MAX_RESULTS_MOBILE = 4
const MAX_RESULTS_DESKTOP = 10
const SEARCH_DEBOUNCE_MS = 300

type InlineIngredientPickerProps = {
  mealId: string
  onAdded: () => void
}

export const InlineIngredientPicker = ({
  mealId,
  onAdded,
}: InlineIngredientPickerProps) => {
  const { t } = useTranslation()
  const { household } = useHousehold()
  const { isDesktop } = useBreakpoint()
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [addingLibraryItem, setAddingLibraryItem] =
    useState<LibraryIngredient | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newFormName, setNewFormName] = useState('')

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

  const addMutation = useMutation({
    mutationFn: async (data: {
      name: string
      quantity: number
      unit: string
      category: string
    }) => {
      await addIngredient(mealId, data)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.mealDetail(mealId),
      })
      resetState()
      onAdded()
    },
  })

  const resetState = () => {
    setSearchQuery('')
    setDebouncedQuery('')
    setShowDropdown(false)
    setAddingLibraryItem(null)
    setShowNewForm(false)
    setNewFormName('')
  }

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
    resetState()
    inputRef.current?.focus()
  }

  const handleSelectLibraryItem = (item: LibraryIngredient) => {
    setAddingLibraryItem(item)
    setShowDropdown(false)
  }

  const handleAddFromLibrary = (quantity: number) => {
    if (!addingLibraryItem) return
    addMutation.mutate({
      name: addingLibraryItem.name,
      quantity,
      unit: addingLibraryItem.unit,
      category: addingLibraryItem.category,
    })
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
    addMutation.mutate(data)
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

  if (addingLibraryItem) {
    return (
      <InlineQtyPrompt
        ingredient={addingLibraryItem}
        onAdd={handleAddFromLibrary}
        onCancel={handleCancelQtyPrompt}
      />
    )
  }

  if (showNewForm) {
    return (
      <NewIngredientForm
        initialName={newFormName}
        onAdd={handleAddNewIngredient}
        onCancel={handleCancelNewForm}
      />
    )
  }

  return (
    <div className="relative">
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

      {showDropdown && hasQuery && (
        <div className="rounded-b-[var(--radius-md)] border-[0.5px] border-[var(--color-border-default)] border-t-0 bg-[var(--color-bg-primary)]">
          {libraryLoading && (
            <div className="flex items-center gap-2 px-3 py-3">
              <div className="size-4 animate-spin rounded-full border-2 border-[var(--color-border-default)] border-t-[var(--color-accent)]" />
              <span className="text-[12px] text-[var(--color-text-secondary)]">
                {t('meals.wizardSearching')}
              </span>
            </div>
          )}

          {!libraryLoading && !hasResults && (
            <div className="flex items-center gap-2 px-3 py-3">
              <i className="ti ti-search text-[14px] text-[var(--color-text-tertiary)]" />
              <span className="text-[12px] text-[var(--color-text-secondary)]">
                {t('meals.wizardNoMatches', { query: searchQuery })}
              </span>
            </div>
          )}

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
  )
}
