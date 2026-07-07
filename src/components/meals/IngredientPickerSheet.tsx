import { useState } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { useHousehold } from '@/hooks/useHousehold'
import { useTranslation } from '@/hooks/useTranslation'
import { getIngredientLibrary, addIngredient, updateIngredient } from '@/lib/meals'
import { queryKeys } from '@/lib/queryKeys'
import { BottomSheet } from '@/components/ui/bottom-sheet'
import { Button } from '@/components/ui/button'
import { CategoryBadge } from './CategoryBadge'
import { IngredientForm } from './IngredientForm'
import type { LibraryIngredient, MealIngredient } from '@/types/meals'

type IngredientPickerSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mealId: string
  editingIngredient?: MealIngredient | null
}

export const IngredientPickerSheet = ({
  open,
  onOpenChange,
  mealId,
  editingIngredient,
}: IngredientPickerSheetProps) => {
  const { t } = useTranslation()
  const { household } = useHousehold()
  const queryClient = useQueryClient()

  const [search, setSearch] = useState('')
  const [addingItem, setAddingItem] = useState<LibraryIngredient | null>(null)
  const [addQuantity, setAddQuantity] = useState('')

  const { data: library = [], isLoading: isLibraryLoading } = useQuery({
    queryKey: queryKeys.ingredientLibrary(household?.id ?? ''),
    queryFn: () => getIngredientLibrary(household?.id ?? ''),
    enabled: !!household?.id && open && !editingIngredient,
  })

  const filteredLibrary = library.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()),
  )

  const addMutation = useMutation({
    mutationFn: async (data: {
      name: string
      quantity: number
      unit: string
      category: string
    }) => {
      if (editingIngredient) {
        await updateIngredient(editingIngredient.id, data)
        return
      }
      await addIngredient(mealId, data)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.mealDetail(mealId),
      })
      onOpenChange(false)
      setAddingItem(null)
      setAddQuantity('')
      setSearch('')
    },
  })

  const handleLibraryAdd = (item: LibraryIngredient) => {
    setAddingItem(item)
    setAddQuantity('')
  }

  const handleLibraryConfirm = () => {
    if (!addingItem) return
    const quantityNum = parseFloat(addQuantity)
    if (isNaN(quantityNum) || quantityNum <= 0) return

    addMutation.mutate({
      name: addingItem.name,
      quantity: quantityNum,
      unit: addingItem.unit,
      category: addingItem.category,
    })
  }

  const handleNewIngredientSave = (data: {
    name: string
    quantity: number
    unit: string
    category: string
  }) => {
    addMutation.mutate(data)
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={editingIngredient ? t('meals.editIngredientTitle') : t('meals.pickIngredientTitle')}
    >
      <div className="flex flex-col gap-[var(--space-4)]">
        {!editingIngredient && (
          <>
            <p className="text-[13px] text-[var(--color-text-secondary)]">
              {t('meals.pickIngredientSubtitle')}
            </p>

            {/* Search */}
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('meals.searchIngredients')}
              className="w-full rounded-[var(--radius-md)] border-[0.5px] border-[var(--color-border-default)] bg-[var(--color-bg-primary)] px-3 py-2.5 text-[13px] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)] focus:border-[1.5px] focus:border-[var(--color-accent)]"
            />

            {/* Library section */}
            <div>
              <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--color-text-tertiary)]">
                {t('meals.fromLibrary')}
              </p>

              {isLibraryLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="size-5 animate-spin rounded-full border-2 border-[var(--color-border-default)] border-t-[var(--color-accent)]" />
                </div>
              )}

              {!isLibraryLoading && filteredLibrary.length === 0 && (
                <p className="py-4 text-center text-[13px] text-[var(--color-text-secondary)]">
                  {search ? 'No matching ingredients.' : t('meals.libraryEmpty')}
                </p>
              )}

              {!isLibraryLoading && filteredLibrary.length > 0 && (
                <div className="max-h-48 overflow-y-auto">
                  {filteredLibrary.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center gap-[var(--space-3)] border-b border-[var(--color-border-default)] py-2.5"
                    >
                      <CategoryBadge
                        category={
                          item.category as
                            | 'vegetables'
                            | 'proteins'
                            | 'pantry'
                            | 'fruits'
                            | 'spices'
                            | 'cleaning'
                        }
                      />
                      <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[var(--color-text-primary)]">
                        {item.name}
                      </span>
                      <span className="text-[12px] text-[var(--color-text-tertiary)]">
                        {t(`units.${item.unit}`)}
                      </span>
                      <button
                        onClick={() => handleLibraryAdd(item)}
                        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-white"
                        aria-label="Add ingredient"
                      >
                        <i className="ti ti-plus text-[16px]" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quantity prompt for library item */}
            {addingItem && (
              <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-accent)] bg-[var(--color-accent-subtle)] p-3">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-[13px] font-medium text-[var(--color-text-primary)]">
                    {addingItem.name}
                  </span>
                  <span className="text-[12px] text-[var(--color-text-tertiary)]">
                    ({t(`units.${addingItem.unit}`)})
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={addQuantity}
                    onChange={(e) => setAddQuantity(e.target.value)}
                    min="0"
                    step="0.25"
                    placeholder={t('meals.quantity')}
                    className="w-24 rounded-[var(--radius-md)] border-[0.5px] border-[var(--color-border-default)] bg-[var(--color-bg-primary)] px-3 py-2 text-[13px] text-[var(--color-text-primary)] outline-none focus:border-[1.5px] focus:border-[var(--color-accent)]"
                    autoFocus
                  />
                  <Button
                    variant="primary"
                    onClick={handleLibraryConfirm}
                    disabled={
                      !addQuantity ||
                      isNaN(parseFloat(addQuantity)) ||
                      parseFloat(addQuantity) <= 0
                    }
                    isLoading={addMutation.isPending}
                  >
                    Add
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setAddingItem(null)
                      setAddQuantity('')
                    }}
                  >
                    {t('meals.cancelButton')}
                  </Button>
                </div>
              </div>
            )}

            {/* OR ADD NEW label */}
            <div>
              <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--color-text-tertiary)]">
                {t('meals.orAddNew')}
              </p>
            </div>
          </>
        )}

        {/* Ingredient form (used for both new and edit) */}
        <IngredientForm
          ingredient={editingIngredient ?? undefined}
          onSave={handleNewIngredientSave}
          isLoading={addMutation.isPending}
        />
      </div>
    </BottomSheet>
  )
}
