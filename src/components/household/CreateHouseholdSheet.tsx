import { useState, useCallback, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { BottomSheet } from '@/components/ui/bottom-sheet'
import { createHousehold } from '@/lib/households'
import { queryKeys } from '@/lib/queryKeys'
import { generateJoinCode } from '@/utils/joinCode'
import { useTranslation } from '@/hooks/useTranslation'
import type { AuthUser } from '@/types/auth'

type CreateHouseholdSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: AuthUser
}

export const CreateHouseholdSheet = ({ open, onOpenChange, user }: CreateHouseholdSheetProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [copyFeedback, setCopyFeedback] = useState(false)

  useEffect(() => {
    if (open) {
      setJoinCode(generateJoinCode())
      setName('')
    }
  }, [open])

  const createMutation = useMutation({
    mutationFn: ({ name: householdName, code }: { name: string; code: string }) =>
      createHousehold(householdName, code, user.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.households(user.id) })
      onOpenChange(false)
      navigate({ to: '/meals' })
    },
  })

  const handleCopyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(joinCode)
      setCopyFeedback(true)
      setTimeout(() => setCopyFeedback(false), 1500)
    } catch {
      // Clipboard not available
    }
  }, [joinCode])

  const handleCreate = useCallback(() => {
    if (!name.trim()) return
    createMutation.mutate({ name: name.trim(), code: joinCode })
  }, [name, joinCode, createMutation])

  const isNameEmpty = !name.trim()
  const errorMessage = createMutation.error
    ? (createMutation.error as Error).message || t('household.errorGeneric')
    : null

  return (
    <BottomSheet
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen && !createMutation.isPending) {
          onOpenChange(false)
        }
      }}
      title={t('household.createTitle')}
    >
      <p className="mb-5 text-[13px] text-[var(--color-text-secondary)]">
        {t('household.createSubtitle')}
      </p>

      <div className="mb-4">
        <label
          htmlFor="household-name"
          className="mb-1.5 block text-[12px] font-medium text-[var(--color-text-secondary)]"
        >
          {t('household.createNameLabel')}
        </label>
        <input
          id="household-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('household.createNamePlaceholder')}
          className="w-full rounded-[var(--radius-md)] border-[0.5px] border-[var(--color-border-default)] bg-[var(--color-bg-primary)] p-[9px_12px] text-[13px] text-[var(--color-text-primary)] outline-none transition-colors placeholder:text-[var(--color-text-tertiary)] focus:border-[1.5px] focus:border-[var(--color-accent)]"
        />
      </div>

      <div className="mb-5">
        <label className="mb-1.5 block text-[12px] font-medium text-[var(--color-text-secondary)]">
          {t('household.createCodeHelper')}
        </label>
        <div className="flex items-center gap-2">
          <div className="flex-1 rounded-[var(--radius-md)] border-[0.5px] border-[var(--color-border-default)] bg-[var(--color-bg-secondary)] px-3 py-[9px] text-[13px] font-mono text-[var(--color-text-primary)]">
            {joinCode}
          </div>
          <button
            onClick={handleCopyCode}
            className="flex size-[44px] min-w-[44px] items-center justify-center rounded-[var(--radius-md)] border-[0.5px] border-[var(--color-border-strong)] bg-transparent text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)]"
            aria-label={t('household.copyCode')}
          >
            <i className={`ti ${copyFeedback ? 'ti-check text-green-500' : 'ti-copy'} text-lg`} />
          </button>
        </div>
        {copyFeedback && (
          <p className="mt-1 text-[11px] text-green-600">
            {t('household.codeCopied')}
          </p>
        )}
      </div>

      {errorMessage && (
        <div className="mb-4 rounded-[var(--radius-md)] bg-red-50 p-3 text-[12px] text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <button
          onClick={handleCreate}
          disabled={isNameEmpty || createMutation.isPending}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-accent)] px-4 py-[10px] text-[14px] font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:pointer-events-none disabled:opacity-50"
        >
          {createMutation.isPending ? (
            <>
              <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {t('household.createButton')}
            </>
          ) : (
            <>
              <i className="ti ti-plus text-base" />
              {t('household.createButton')}
            </>
          )}
        </button>

        <button
          onClick={() => onOpenChange(false)}
          disabled={createMutation.isPending}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[var(--radius-md)] border-[0.5px] border-[var(--color-border-strong)] bg-transparent px-4 py-[10px] text-[14px] font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-bg-secondary)] disabled:pointer-events-none disabled:opacity-50"
        >
          {t('household.cancel')}
        </button>
      </div>
    </BottomSheet>
  )
}
