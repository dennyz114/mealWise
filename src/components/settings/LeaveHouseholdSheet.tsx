import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { BottomSheet } from '@/components/ui/bottom-sheet'
import { leaveHousehold } from '@/lib/households'
import { queryKeys } from '@/lib/queryKeys'
import { useAuth } from '@/hooks/useAuth'
import { useTranslation } from '@/hooks/useTranslation'
import type { Household } from '@/types/household'

type LeaveHouseholdSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  household: Household
}

export const LeaveHouseholdSheet = ({
  open,
  onOpenChange,
  household,
}: LeaveHouseholdSheetProps) => {
  const { user } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const leaveMutation = useMutation({
    mutationFn: () => leaveHousehold(household.id, user?.id ?? ''),
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: queryKeys.households(user.id) })
      }
      onOpenChange(false)
      navigate({ to: '/' })
    },
  })

  const errorMessage = leaveMutation.error
    ? (leaveMutation.error as Error).message || t('settings.leaveError')
    : null

  return (
    <BottomSheet
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen && !leaveMutation.isPending) {
          onOpenChange(false)
        }
      }}
      title={t('settings.leaveHousehold')}
    >
      <p className="mb-4 text-[14px] text-[var(--color-text-primary)]">
        {t('settings.leaveHouseholdModalBody')}
      </p>

      {errorMessage && (
        <div className="mb-4 rounded-[var(--radius-md)] bg-red-50 p-3 text-[12px] text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <button
          onClick={() => leaveMutation.mutate()}
          disabled={leaveMutation.isPending}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[var(--radius-md)] bg-red-500 px-4 py-[10px] text-[14px] font-medium text-white transition-colors hover:bg-red-600 disabled:pointer-events-none disabled:opacity-50"
        >
          {leaveMutation.isPending ? (
            <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <i className="ti ti-logout text-base" />
          )}
          {t('settings.leaveHousehold')}
        </button>

        <button
          onClick={() => onOpenChange(false)}
          disabled={leaveMutation.isPending}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[var(--radius-md)] border-[0.5px] border-[var(--color-border-strong)] bg-transparent px-4 py-[10px] text-[14px] font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-bg-secondary)] disabled:pointer-events-none disabled:opacity-50"
        >
          {t('settings.cancel')}
        </button>
      </div>
    </BottomSheet>
  )
}
