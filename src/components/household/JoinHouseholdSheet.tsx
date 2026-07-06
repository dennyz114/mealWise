import { useState, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { BottomSheet } from '@/components/ui/bottom-sheet'
import { joinHousehold } from '@/lib/households'
import { queryKeys } from '@/lib/queryKeys'
import { formatJoinCodeInput, isValidJoinCode } from '@/utils/joinCode'
import { useTranslation } from '@/hooks/useTranslation'
import type { AuthUser } from '@/types/auth'

type JoinHouseholdSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: AuthUser
}

export const JoinHouseholdSheet = ({ open, onOpenChange, user }: JoinHouseholdSheetProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [code, setCode] = useState('')
  const [joinError, setJoinError] = useState<string | null>(null)

  const handleCodeChange = useCallback((raw: string) => {
    const formatted = formatJoinCodeInput(raw)
    setCode(formatted)
    setJoinError(null)
  }, [])

  const joinMutation = useMutation({
    mutationFn: ({ joinCode }: { joinCode: string }) =>
      joinHousehold(joinCode, user.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.households(user.id) })
      onOpenChange(false)
      navigate({ to: '/meals' })
    },
    onError: (error: Error) => {
      setJoinError(error.message || t('household.errorGeneric'))
    },
  })

  const handleJoin = useCallback(() => {
    if (!isValidJoinCode(code)) {
      setJoinError(t('household.errorInvalidCode'))
      return
    }
    joinMutation.mutate({ joinCode: code })
  }, [code, joinMutation, t])

  const isCodeValid = code.length === 7 && isValidJoinCode(code)

  return (
    <BottomSheet
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen && !joinMutation.isPending) {
          setCode('')
          setJoinError(null)
          onOpenChange(false)
        }
      }}
      title={t('household.joinTitle')}
    >
      <p className="mb-5 text-[13px] text-[var(--color-text-secondary)]">
        {t('household.joinSubtitle')}
      </p>

      <div className="mb-4">
        <label
          htmlFor="join-code"
          className="mb-1.5 block text-[12px] font-medium text-[var(--color-text-secondary)]"
        >
          {t('household.joinInputLabel')}
        </label>
        <input
          id="join-code"
          type="text"
          value={code}
          onChange={(e) => handleCodeChange(e.target.value)}
          placeholder={t('household.joinInputPlaceholder')}
          maxLength={7}
          className="w-full rounded-[var(--radius-md)] border-[0.5px] border-[var(--color-border-default)] bg-[var(--color-bg-primary)] p-[9px_12px] text-[13px] text-[var(--color-text-primary)] outline-none transition-colors placeholder:text-[var(--color-text-tertiary)] focus:border-[1.5px] focus:border-[var(--color-accent)]"
          autoComplete="off"
        />
      </div>

      {joinError && (
        <div className="mb-4 rounded-[var(--radius-md)] bg-red-50 p-3 text-[12px] text-red-700">
          {joinError}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <button
          onClick={handleJoin}
          disabled={!isCodeValid || joinMutation.isPending}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-accent)] px-4 py-[10px] text-[14px] font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:pointer-events-none disabled:opacity-50"
        >
          {joinMutation.isPending ? (
            <>
              <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {t('household.joinButton')}
            </>
          ) : (
            <>
              <i className="ti ti-login-2 text-base" />
              {t('household.joinButton')}
            </>
          )}
        </button>

        <button
          onClick={() => onOpenChange(false)}
          disabled={joinMutation.isPending}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[var(--radius-md)] border-[0.5px] border-[var(--color-border-strong)] bg-transparent px-4 py-[10px] text-[14px] font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-bg-secondary)] disabled:pointer-events-none disabled:opacity-50"
        >
          {t('household.cancel')}
        </button>
      </div>
    </BottomSheet>
  )
}
