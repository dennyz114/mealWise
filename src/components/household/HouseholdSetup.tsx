import { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import type { AuthUser } from '@/types/auth'
import { CreateHouseholdSheet } from './CreateHouseholdSheet'
import { JoinHouseholdSheet } from './JoinHouseholdSheet'

type HouseholdSetupProps = {
  user: AuthUser
}

export const HouseholdSetup = ({ user }: HouseholdSetupProps) => {
  const { t } = useTranslation()
  const [createOpen, setCreateOpen] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)

  return (
    <>
      <div className="flex min-h-full items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="rounded-[var(--radius-lg)] border-[0.5px] border-[var(--color-border-default)] bg-[var(--color-bg-primary)] p-6 text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-[var(--color-accent-subtle)]">
              <i className="ti ti-home text-2xl text-[var(--color-accent)]" />
            </div>

            <h1 className="mb-2 text-[22px] font-medium text-[var(--color-text-primary)]">
              {t('household.setupTitle')}
            </h1>

            <p className="mb-6 text-[13px] text-[var(--color-text-secondary)]">
              {t('household.setupDescription')}
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => setCreateOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-accent)] px-4 py-[10px] text-[14px] font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
              >
                <i className="ti ti-plus text-base" />
                {t('household.createTitle')}
              </button>

              <button
                onClick={() => setJoinOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] border-[0.5px] border-[var(--color-border-strong)] bg-transparent px-4 py-[10px] text-[14px] font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-bg-secondary)]"
              >
                <i className="ti ti-user-plus text-base" />
                {t('household.joinTitle')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <CreateHouseholdSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        user={user}
      />

      <JoinHouseholdSheet
        open={joinOpen}
        onOpenChange={setJoinOpen}
        user={user}
      />
    </>
  )
}
