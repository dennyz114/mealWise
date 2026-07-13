import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useHousehold } from '@/hooks/useHousehold'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { useTranslation } from '@/hooks/useTranslation'
import {
  getMealById,
  updateMealName,
  deleteIngredient,
  updateIngredient,
} from '@/lib/meals'
import { queryKeys } from '@/lib/queryKeys'
import { Button } from '@/components/ui/button'
import { EditableIngredientRow } from './EditableIngredientRow'
import { InlineIngredientPicker } from './InlineIngredientPicker'

export const MealDetailPage = () => {
  const { t } = useTranslation()
  const { household } = useHousehold()
  const navigate = useNavigate()
  const { isDesktop } = useBreakpoint()
  const queryClient = useQueryClient()

  const { mealId } = useParams({ from: '/_authenticated/meals/$mealId' })

  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [showAddPicker, setShowAddPicker] = useState(false)
  const [deletedIngredients, setDeletedIngredients] = useState<string[]>([])
  const [updatedQuantities, setUpdatedQuantities] = useState<
    Record<string, number>
  >({})

  useEffect(() => {
    const storedMealId = sessionStorage.getItem('addIngredient')
    if (storedMealId === mealId) {
      sessionStorage.removeItem('addIngredient')
      setIsEditing(true)
      setShowAddPicker(true)
    }
  }, [mealId])

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

  const updateIngredientMutation = useMutation({
    mutationFn: ({
      ingredientId,
      quantity,
    }: {
      ingredientId: string
      quantity: number
    }) => updateIngredient(ingredientId, { quantity }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.mealDetail(mealId),
      })
    },
  })

  const handleEditName = () => {
    if (!meal) return
    setEditName(meal.name)
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditName('')
    setDeletedIngredients([])
    setUpdatedQuantities({})
    setShowAddPicker(false)
  }

  const handleSaveChanges = async () => {
    if (!meal) return

    if (editName.trim() && editName.trim() !== meal.name) {
      await updateNameMutation.mutateAsync(editName.trim())
    }

    for (const ingredientId of deletedIngredients) {
      await deleteIngredientMutation.mutateAsync(ingredientId)
    }

    for (const [ingredientId, quantity] of Object.entries(updatedQuantities)) {
      await updateIngredientMutation.mutateAsync({
        ingredientId,
        quantity,
      })
    }

    setIsEditing(false)
    setDeletedIngredients([])
    setUpdatedQuantities({})
    setShowAddPicker(false)
  }

  const handleDeleteIngredient = (ingredientId: string) => {
    setDeletedIngredients((prev) => [...prev, ingredientId])
  }

  const handleUpdateQuantity = (ingredientId: string, quantity: number) => {
    setUpdatedQuantities((prev) => ({ ...prev, [ingredientId]: quantity }))
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
          {t('meals.mealNotFound')}
        </p>
      </div>
    )
  }

  const visibleIngredients = meal.ingredients.filter(
    (ing) => !deletedIngredients.includes(ing.id),
  )

  return (
    <div className="p-4">
      {/* Breadcrumb - Desktop only */}
      {isDesktop && (
        <nav className="mb-4 text-[13px] text-[var(--color-text-secondary)]">
          <button
            onClick={() => navigate({ to: '/meals' })}
            className="hover:text-[var(--color-accent)]"
          >
            {t('nav.meals')}
          </button>
          <span className="mx-2">/</span>
          <span className="text-[var(--color-text-primary)]">{meal.name}</span>
        </nav>
      )}

      {/* Header */}
      <div className="mb-6 flex items-center gap-[var(--space-3)]">
        {!isDesktop && (
          <button
            onClick={() => navigate({ to: '/meals' })}
            className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]"
            aria-label="Back to meals"
          >
            <i className="ti ti-arrow-left text-[20px]" />
          </button>
        )}

        <div className="min-w-0 flex-1">
          {isEditing && !isDesktop ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full rounded-[var(--radius-md)] border-[1.5px] border-[var(--color-accent)] bg-[var(--color-bg-primary)] px-3 py-2 text-[22px] font-medium text-[var(--color-text-primary)] outline-none"
              autoFocus
            />
          ) : (
            <h1 className="truncate text-[22px] font-medium text-[var(--color-text-primary)]">
              {isEditing && editName ? editName : meal.name}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              {isDesktop && (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-48 rounded-[var(--radius-md)] border-[1.5px] border-[var(--color-accent)] bg-[var(--color-bg-primary)] px-3 py-2 text-[14px] text-[var(--color-text-primary)] outline-none"
                  autoFocus
                />
              )}
              <Button variant="ghost" onClick={handleCancelEdit}>
                {t('meals.cancelButton')}
              </Button>
              <Button variant="primary" onClick={handleSaveChanges}>
                {t('meals.doneButton')}
              </Button>
            </>
          ) : (
            <Button variant="secondary" onClick={handleEditName}>
              {t('meals.editButton')}
            </Button>
          )}
        </div>
      </div>

      {/* Ingredients section */}
      <div className="mb-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--color-text-tertiary)]">
          {t('meals.ingredientsTitle')}
        </p>
      </div>

      {meal.ingredients.length === 0 && !isEditing ? (
        <div className="py-12 text-center">
          <i className="ti ti-package mb-3 text-[40px] text-[var(--color-text-tertiary)]" />
          <p className="text-[13px] text-[var(--color-text-secondary)]">
            {t('meals.noIngredients')}
          </p>
        </div>
      ) : (
        <div className="mb-4">
          {visibleIngredients.map((ingredient) => (
            <EditableIngredientRow
              key={ingredient.id}
              ingredient={{
                ...ingredient,
                quantity: updatedQuantities[ingredient.id] ?? ingredient.quantity,
              }}
              isEditing={isEditing}
              onUpdateQuantity={handleUpdateQuantity}
              onDelete={handleDeleteIngredient}
            />
          ))}
        </div>
      )}

      {/* Add ingredient section */}
      {isEditing && (
        <div className="mt-4">
          {showAddPicker ? (
            <div className="rounded-[var(--radius-lg)] border-[0.5px] border-[var(--color-border-default)] bg-[var(--color-bg-primary)] p-3">
              <InlineIngredientPicker
                mealId={mealId}
                onAdded={() => {
                  setShowAddPicker(false)
                }}
              />
            </div>
          ) : (
            <button
              onClick={() => setShowAddPicker(true)}
              className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-lg)] border-[0.5px] border-dashed border-[var(--color-border-default)] py-3 text-[14px] font-medium text-[var(--color-accent)] hover:bg-[var(--color-accent-subtle)]"
            >
              <i className="ti ti-plus text-[18px]" />
              {t('meals.addIngredient')}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
