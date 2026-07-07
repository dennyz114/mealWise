import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { BottomSheet } from '@/components/ui/bottom-sheet'
import { Button } from '@/components/ui/button'
import { useHousehold } from '@/hooks/useHousehold'
import { useAuth } from '@/hooks/useAuth'
import { useTranslation } from '@/hooks/useTranslation'
import { createMeal } from '@/lib/meals'
import { queryKeys } from '@/lib/queryKeys'

type CreateMealSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const CreateMealSheet = ({
  open,
  onOpenChange,
}: CreateMealSheetProps) => {
  const { t } = useTranslation()
  const { household } = useHousehold()
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [name, setName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = async () => {
    if (!name.trim() || !household?.id || !user?.id) return

    setIsCreating(true)
    try {
      const newMeal = await createMeal(household.id, name.trim(), user.id)
      await queryClient.invalidateQueries({
        queryKey: queryKeys.meals(household.id),
      })
      setName('')
      onOpenChange(false)
      navigate({ to: '/meals/$mealId', params: { mealId: newMeal.id } })
    } catch (error) {
      console.error('Failed to create meal:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreate()
    }
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t('meals.createTitle')}
    >
      <div className="flex flex-col gap-[var(--space-4)]">
        <div>
          <label className="mb-1 block text-[13px] font-medium text-[var(--color-text-primary)]">
            {t('meals.nameLabel')}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('meals.namePlaceholder')}
            className="w-full rounded-[var(--radius-md)] border-[0.5px] border-[var(--color-border-default)] bg-[var(--color-bg-primary)] px-3 py-2.5 text-[13px] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)] focus:border-[1.5px] focus:border-[var(--color-accent)]"
            autoFocus
          />
        </div>

        <Button
          variant="primary"
          isLoading={isCreating}
          disabled={!name.trim()}
          onClick={handleCreate}
          className="w-full"
        >
          {t('meals.createButton')}
        </Button>
      </div>
    </BottomSheet>
  )
}
