import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useHousehold } from '@/hooks/useHousehold'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { useTranslation } from '@/hooks/useTranslation'
import { getMeals, deleteMeal, getMealIngredientCounts } from '@/lib/meals'
import { queryKeys } from '@/lib/queryKeys'
import { Button } from '@/components/ui/button'
import { MealList } from './MealList'
import { CreateMealSheet } from './CreateMealSheet'
import { DeleteMealDialog } from './DeleteMealDialog'
import type { Meal } from '@/types/meals'

export const MealsPage = () => {
  const { t } = useTranslation()
  const { household } = useHousehold()
  const { isDesktop } = useBreakpoint()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [search, setSearch] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Meal | null>(null)

  const { data: meals = [], isLoading } = useQuery({
    queryKey: queryKeys.meals(household?.id ?? ''),
    queryFn: () => getMeals(household?.id ?? ''),
    enabled: !!household?.id,
  })

  const { data: ingredientCounts = {} } = useQuery({
    queryKey: queryKeys.mealIngredientCounts(household?.id ?? ''),
    queryFn: () => getMealIngredientCounts(household?.id ?? ''),
    enabled: !!household?.id,
  })

  const filteredMeals = useMemo(
    () =>
      meals.filter((meal) =>
        meal.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [meals, search],
  )

  const deleteMutation = useMutation({
    mutationFn: (mealId: string) => deleteMeal(mealId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.meals(household?.id ?? ''),
      })
      await queryClient.invalidateQueries({
        queryKey: queryKeys.mealIngredientCounts(household?.id ?? ''),
      })
      setDeleteTarget(null)
    },
  })

  const handleDeleteMeal = (meal: Meal) => {
    setDeleteTarget(meal)
  }

  const handleConfirmDelete = () => {
    if (!deleteTarget) return
    deleteMutation.mutate(deleteTarget.id)
  }

  const handleMealClick = (meal: Meal) => {
    navigate({ to: '/meals/$mealId', params: { mealId: meal.id } })
  }

  return (
    <div className="p-4 pb-24 md:pb-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-[22px] font-medium text-[var(--color-text-primary)]">
          {t('meals.title')}
        </h1>

        {isDesktop && (
          <Button
            variant="secondary"
            onClick={() => setIsCreateOpen(true)}
          >
            <i className="ti ti-plus text-[16px]" />
            {t('meals.newMeal')}
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('meals.searchPlaceholder')}
          className="w-full rounded-[var(--radius-md)] border-[0.5px] border-[var(--color-border-default)] bg-[var(--color-bg-primary)] px-3 py-2.5 text-[13px] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)] focus:border-[1.5px] focus:border-[var(--color-accent)]"
        />
      </div>

      {/* Meal list */}
      <MealList
        meals={filteredMeals}
        ingredientCounts={ingredientCounts}
        isLoading={isLoading}
        isDesktop={isDesktop}
        onMealClick={handleMealClick}
        onDeleteMeal={handleDeleteMeal}
      />

      {/* Mobile FAB */}
      {!isDesktop && (
        <button
          onClick={() => setIsCreateOpen(true)}
          className="fixed bottom-20 right-4 z-40 flex size-11 items-center justify-center rounded-full bg-[var(--color-accent)] text-white shadow-lg"
          aria-label={t('meals.newMeal')}
          style={{ borderRadius: 24, height: 44, minWidth: 44 }}
        >
          <i className="ti ti-plus text-[20px]" />
        </button>
      )}

      {/* Create meal sheet */}
      <CreateMealSheet
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />

      {/* Delete meal dialog */}
      <DeleteMealDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        meal={deleteTarget}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
