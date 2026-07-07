import { useState, useCallback, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { BottomSheet } from '@/components/ui/bottom-sheet'
import { deleteHousehold } from '@/lib/households'
import { queryKeys } from '@/lib/queryKeys'
import { useAuth } from '@/hooks/useAuth'
import { useTranslation } from '@/hooks/useTranslation'
import type { Household } from '@/types/household'

type CloseHouseholdSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  household: Household
  memberCount: number
}

export const CloseHouseholdSheet = ({
  open,
  onOpenChange,
  household,
  memberCount,
}: CloseHouseholdSheetProps) => {
  const { user } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [confirmName, setConfirmName] = useState('')

  useEffect(() => {
    if (open) {
      setConfirmName('')
    }
  }, [open])

  const deleteMutation = useMutation({
    mutationFn: () => deleteHousehold(household.id, user?.id ?? ''),
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: queryKeys.households(user.id) })
      }
      onOpenChange(false)
      navigate({ to: '/' })
    },
  })

  const handleConfirm = useCallback(() => {
    if (confirmName.trim() !== household.name) return
    deleteMutation.mutate()
  }, [confirmName, household.name, deleteMutation])

  const isNameMatch = confirmName.trim() === household.name
  const errorMessage = deleteMutation.error
    ? (deleteMutation.error as Error).message || t('settings.closeError')
    : null

  return (
    <BottomSheet
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen && !deleteMutation.isPending) {
          onOpenChange(false)
        }
      }}
      title={t('settings.closeHousehold')}
    >
      <div className="mb-4 flex size-12 items-center justify-center rounded-[var(--radius-lg)] bg-red-500/10">
        <i className="ti ti-trash text-2xl text-red-500" />
      </div>

      <p className="mb-4 text-[14px] text-[var(--color-text-primary)]">
        {t('settings.closeHouseholdModalBody', { name: household.name })}
      </p>

      <div className="mb-5 rounded-[var(--radius-md)] bg-red-500/10 p-3">
        <p className="text-[13px] text-red-500">
          <i className="ti ti-alert-triangle mr-1" />
          {t('settings.closeHouseholdWarning', { count: memberCount })}
        </p>
      </div>

      <p className="mb-2 text-[13px] text-[var(--color-text-secondary)]">
        {t('settings.typeToConfirm', { name: household.name })}
      </p>
      <input
        type="text"
        value={confirmName}
        onChange={(e) => setConfirmName(e.target.value)}
        placeholder={t('settings.householdNamePlaceholder')}
        className="mb-4 w-full rounded-[var(--radius-md)] border-[0.5px] border-[var(--color-border-default)] bg-[var(--color-bg-primary)] p-[9px_12px] text-[13px] text-[var(--color-text-primary)] outline-none transition-colors placeholder:text-[var(--color-text-tertiary)] focus:border-[1.5px] focus:border-[var(--color-accent)]"
        autoFocus
      />

      {errorMessage && (
        <div className="mb-4 rounded-[var(--radius-md)] bg-red-50 p-3 text-[12px] text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <button
          onClick={handleConfirm}
          disabled={!isNameMatch || deleteMutation.isPending}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[var(--radius-md)] bg-red-500 px-4 py-[10px] text-[14px] font-medium text-white transition-colors hover:bg-red-600 disabled:pointer-events-none disabled:opacity-50"
        >
          {deleteMutation.isPending ? (
            <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <i className="ti ti-trash text-base" />
          )}
          {t('settings.closeHousehold')}
        </button>

        <button
          onClick={() => onOpenChange(false)}
          disabled={deleteMutation.isPending}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[var(--radius-md)] border-[0.5px] border-[var(--color-border-strong)] bg-transparent px-4 py-[10px] text-[14px] font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-bg-secondary)] disabled:pointer-events-none disabled:opacity-50"
        >
          {t('settings.cancel')}
        </button>
      </div>
    </BottomSheet>
  )
}
