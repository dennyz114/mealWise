import { BottomSheet } from '@/components/ui/bottom-sheet'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/hooks/useTranslation'
import type { Meal } from '@/types/meals'

type DeleteMealDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  meal: Meal | null
  onConfirm: () => void
}

export const DeleteMealDialog = ({
  open,
  onOpenChange,
  meal,
  onConfirm,
}: DeleteMealDialogProps) => {
  const { t } = useTranslation()

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <div className="flex flex-col items-center gap-[var(--space-4)] py-2">
        {/* Red trash icon */}
        <div
          className="flex size-14 items-center justify-center rounded-full"
          style={{
            background: 'var(--color-cat-protein-bg)',
          }}
        >
          <i
            className="ti ti-trash text-[24px]"
            style={{ color: 'var(--color-cat-protein-text)' }}
          />
        </div>

        <div className="text-center">
          <h3 className="text-[17px] font-medium text-[var(--color-text-primary)]">
            {t('meals.deleteTitle', { name: meal?.name ?? '' })}
          </h3>
          <p className="mt-1 text-[13px] text-[var(--color-text-secondary)]">
            {t('meals.deleteDescription')}
          </p>
        </div>

        <div className="flex w-full gap-[var(--space-3)]">
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            {t('meals.cancelButton')}
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            className="flex-1 bg-[#dc2626] text-white hover:bg-[#b91c1c]"
          >
            {t('meals.deleteButton')}
          </Button>
        </div>
      </div>
    </BottomSheet>
  )
}
