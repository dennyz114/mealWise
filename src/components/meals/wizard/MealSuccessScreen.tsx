import { useTranslation } from '@/hooks/useTranslation'
import { Button } from '@/components/ui/button'

type MealSuccessScreenProps = {
  mealName: string
  onViewMeal: () => void
  onBackToMeals: () => void
}

export const MealSuccessScreen = ({
  mealName,
  onViewMeal,
  onBackToMeals,
}: MealSuccessScreenProps) => {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center py-6 text-center">
      {/* Success icon */}
      <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-[#0D9488]">
        <i className="ti ti-check text-[32px] text-white" />
      </div>

      {/* Title */}
      <h2 className="mb-6 text-[17px] font-medium text-[var(--color-text-primary)]">
        {t('meals.wizardSuccessTitle', { name: mealName })}
      </h2>

      {/* Actions */}
      <div className="flex w-full gap-2">
        <Button
          variant="secondary"
          onClick={onBackToMeals}
          className="flex-1"
        >
          {t('meals.wizardBackToMeals')}
        </Button>
        <Button onClick={onViewMeal} className="flex-1">
          {t('meals.wizardViewMeal')}
        </Button>
      </div>
    </div>
  )
}
