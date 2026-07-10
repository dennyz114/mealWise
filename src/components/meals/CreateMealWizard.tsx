import { useState, useEffect, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useHousehold } from '@/hooks/useHousehold'
import { useAuth } from '@/hooks/useAuth'
import { useTranslation } from '@/hooks/useTranslation'
import { createMealWithIngredients } from '@/lib/meals'
import { queryKeys } from '@/lib/queryKeys'
import { BottomSheet } from '@/components/ui/bottom-sheet'
import { StepProgress } from '@/components/ui/StepProgress'
import { MealNameStep } from './wizard/MealNameStep'
import { IngredientPickerStep } from './wizard/IngredientPickerStep'
import { IngredientReviewStep } from './wizard/IngredientReviewStep'
import { MealSuccessScreen } from './wizard/MealSuccessScreen'
import type { TemporaryIngredient, MealDraft } from '@/types/meals'

type WizardStep = 'name' | 'ingredients' | 'review' | 'success'

const DRAFT_TTL = 24 * 60 * 60 * 1000 // 24 hours

type CreateMealWizardProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const CreateMealWizard = ({
  open,
  onOpenChange,
}: CreateMealWizardProps) => {
  const { t } = useTranslation()
  const { household } = useHousehold()
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [step, setStep] = useState<WizardStep>('name')
  const [mealName, setMealName] = useState('')
  const [ingredients, setIngredients] = useState<TemporaryIngredient[]>([])
  const [createdMealId, setCreatedMealId] = useState<string | null>(null)

  const draftKey = household?.id ? `mealDraft_${household.id}` : null

  const resetState = () => {
    setStep('name')
    setMealName('')
    setIngredients([])
    setCreatedMealId(null)
  }

  // Load draft on mount
  useEffect(() => {
    if (!open || !draftKey) return

    try {
      const stored = localStorage.getItem(draftKey)
      if (stored) {
        const draft: MealDraft = JSON.parse(stored)
        const isExpired = Date.now() - draft.createdAt > DRAFT_TTL

        if (!isExpired) {
          setMealName(draft.mealName)
          setIngredients(draft.ingredients)
          setStep(draft.step === 'review' ? 'review' : 'ingredients')
        } else {
          localStorage.removeItem(draftKey)
        }
      }
    } catch {
      localStorage.removeItem(draftKey)
    }
  }, [open, draftKey])

  // Save draft when closing at step 2 or 3
  const handleClose = useCallback(
    (isOpen: boolean) => {
      if (!isOpen && draftKey && (step === 'ingredients' || step === 'review')) {
        const draft: MealDraft = {
          mealName,
          ingredients,
          step: step === 'review' ? 'review' : 'ingredients',
          createdAt: Date.now(),
        }
        localStorage.setItem(draftKey, JSON.stringify(draft))
      }
      if (!isOpen) {
        resetState()
      }
      onOpenChange(isOpen)
    },
    [draftKey, step, mealName, ingredients, onOpenChange],
  )

  const createMutation = useMutation({
    mutationFn: () => {
      if (!household?.id || !user?.id) throw new Error('Missing household or user')
      return createMealWithIngredients(
        household.id,
        mealName,
        user.id,
        ingredients,
      )
    },
    onSuccess: async (meal) => {
      setCreatedMealId(meal.id)
      setStep('success')

      // Clear draft
      if (draftKey) {
        localStorage.removeItem(draftKey)
      }

      // Invalidate queries
      await queryClient.invalidateQueries({
        queryKey: queryKeys.meals(household?.id ?? ''),
      })
      await queryClient.invalidateQueries({
        queryKey: queryKeys.mealIngredientCounts(household?.id ?? ''),
      })
      await queryClient.invalidateQueries({
        queryKey: queryKeys.ingredientLibrary(household?.id ?? ''),
      })
    },
  })

  const handleNameContinue = (name: string) => {
    setMealName(name)
    setStep('ingredients')
  }

  const handleAddIngredient = (ingredient: TemporaryIngredient) => {
    setIngredients((prev) => [...prev, ingredient])
  }

  const handleRemoveIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((ing) => ing.id !== id))
  }

  const handleIngredientsNext = () => {
    setStep('review')
  }

  const handleReviewBack = () => {
    setStep('ingredients')
  }

  const handleIngredientsBack = () => {
    setStep('name')
  }

  const handleCreateMeal = () => {
    createMutation.mutate()
  }

  const handleViewMeal = () => {
    if (createdMealId) {
      const mealId = createdMealId
      handleClose(false)
      navigate({ to: '/meals/$mealId', params: { mealId } })
    }
  }

  const handleBackToMeals = () => {
    handleClose(false)
  }

  const getStepNumber = () => {
    switch (step) {
      case 'name':
        return 0
      case 'ingredients':
        return 1
      case 'review':
        return 2
      case 'success':
        return 2
    }
  }

  const renderContent = () => {
    switch (step) {
      case 'name':
        return (
          <MealNameStep
            initialName={mealName}
            onContinue={handleNameContinue}
            onCancel={() => handleClose(false)}
          />
        )
      case 'ingredients':
        return (
          <IngredientPickerStep
            ingredients={ingredients}
            onAddIngredient={handleAddIngredient}
            onNext={handleIngredientsNext}
            onBack={handleIngredientsBack}
          />
        )
      case 'review':
        return (
          <IngredientReviewStep
            ingredients={ingredients}
            onRemoveIngredient={handleRemoveIngredient}
            onAddMore={() => setStep('ingredients')}
            onCreateMeal={handleCreateMeal}
            onBack={handleReviewBack}
            isLoading={createMutation.isPending}
          />
        )
      case 'success':
        return (
          <MealSuccessScreen
            mealName={mealName}
            ingredients={ingredients}
            onViewMeal={handleViewMeal}
            onBackToMeals={handleBackToMeals}
          />
        )
    }
  }

  const getHeaderTitle = () => {
    switch (step) {
      case 'name':
        return t('meals.wizardNewMeal')
      case 'ingredients':
      case 'review':
        return mealName
      case 'success':
        return undefined
    }
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={handleClose}
      title={getHeaderTitle()}
      headerRight={
        step !== 'success' ? (
          <StepProgress currentStep={getStepNumber()} totalSteps={3} />
        ) : undefined
      }
    >
      {renderContent()}
    </BottomSheet>
  )
}
