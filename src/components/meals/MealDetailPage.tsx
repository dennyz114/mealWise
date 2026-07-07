import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useHousehold } from '@/hooks/useHousehold'
import { useTranslation } from '@/hooks/useTranslation'
import { getMealById, updateMealName, deleteIngredient } from '@/lib/meals'
import { queryKeys } from '@/lib/queryKeys'
import { IngredientRow } from './IngredientRow'
import { IngredientPickerSheet } from './IngredientPickerSheet'
import type { MealIngredient } from '@/types/meals'

export const MealDetailPage = () => {
  const { t } = useTranslation()
  const { household } = useHousehold()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { mealId } = useParams({ from: '/_authenticated/meals/$mealId' })

  const [isEditingName, setIsEditingName] = useState(false)
  const [editName, setEditName] = useState('')
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [editingIngredient, setEditingIngredient] = useState<MealIngredient | null>(null)

  const { data: meal, isLoading } = useQuery({
    queryKey: queryKeys.mealDetail(mealId),
    queryFn: () => getMealById(mealId),
    enabled: !!mealId,
  })

  const updateNameMutation = useMutation({
    mutationFn: (name: string) => updateMealName(mealId, name),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.mealDetail(mealId),
      })
      await queryClient.invalidateQueries({
        queryKey: queryKeys.meals(household?.id ?? ''),
      })
      setIsEditingName(false)
    },
  })

  const deleteIngredientMutation = useMutation({
    mutationFn: (ingredientId: string) => deleteIngredient(ingredientId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.mealDetail(mealId),
      })
    },
  })

  const handleEditName = () => {
    if (!meal) return
    setEditName(meal.name)
    setIsEditingName(true)
  }

  const handleSaveName = () => {
    if (!editName.trim()) return
    updateNameMutation.mutate(editName.trim())
  }

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveName()
    } else if (e.key === 'Escape') {
      setIsEditingName(false)
    }
  }

  const handleDeleteIngredient = (ingredientId: string) => {
    deleteIngredientMutation.mutate(ingredientId)
  }

  const handleAddIngredient = () => {
    setEditingIngredient(null)
    setIsPickerOpen(true)
  }

  const handleEditIngredient = (ingredient: MealIngredient) => {
    setEditingIngredient(ingredient)
    setIsPickerOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="size-6 animate-spin rounded-full border-2 border-[var(--color-border-default)] border-t-[var(--color-accent)]" />
      </div>
    )
  }

  if (!meal) {
    return (
      <div className="p-4 text-center">
        <p className="text-[15px] text-[var(--color-text-secondary)]">
          Meal not found.
        </p>
      </div>
    )
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6 flex items-center gap-[var(--space-3)]">
        <button
          onClick={() => navigate({ to: '/meals' })}
          className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]"
          aria-label="Back to meals"
        >
          <i className="ti ti-arrow-left text-[20px]" />
        </button>

        <div className="min-w-0 flex-1">
          {isEditingName ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={handleNameKeyDown}
              onBlur={handleSaveName}
              className="w-full rounded-[var(--radius-md)] border-[1.5px] border-[var(--color-accent)] bg-[var(--color-bg-primary)] px-3 py-2 text-[22px] font-medium text-[var(--color-text-primary)] outline-none"
              autoFocus
            />
          ) : (
            <h1 className="truncate text-[22px] font-medium text-[var(--color-text-primary)]">
              {meal.name}
            </h1>
          )}
        </div>

        {!isEditingName && (
          <button
            onClick={handleEditName}
            className="shrink-0 text-[13px] font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
          >
            {t('meals.editName')}
          </button>
        )}
      </div>

      {/* Ingredients section */}
      <div className="mb-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--color-text-tertiary)]">
          {t('meals.ingredientsTitle')}
        </p>
      </div>

      {meal.ingredients.length === 0 ? (
        <div className="py-12 text-center">
          <i className="ti ti-package mb-3 text-[40px] text-[var(--color-text-tertiary)]" />
          <p className="text-[13px] text-[var(--color-text-secondary)]">
            {t('meals.noIngredients')}
          </p>
        </div>
      ) : (
        <div className="mb-4">
          {meal.ingredients.map((ingredient) => (
            <IngredientRow
              key={ingredient.id}
              ingredient={ingredient}
              onEdit={handleEditIngredient}
              onDelete={handleDeleteIngredient}
            />
          ))}
        </div>
      )}

      {/* Add ingredient button */}
      <button
        onClick={handleAddIngredient}
        className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-lg)] border-[0.5px] border-dashed border-[var(--color-border-default)] py-3 text-[14px] font-medium text-[var(--color-accent)] hover:bg-[var(--color-accent-subtle)]"
      >
        <i className="ti ti-plus text-[18px]" />
        {t('meals.addIngredient')}
      </button>

      {/* Ingredient picker sheet */}
      <IngredientPickerSheet
        open={isPickerOpen}
        onOpenChange={setIsPickerOpen}
        mealId={mealId}
        editingIngredient={editingIngredient}
      />
    </div>
  )
}
