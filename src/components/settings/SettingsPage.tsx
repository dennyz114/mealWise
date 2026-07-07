import { useState, useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { useHousehold } from '@/hooks/useHousehold'
import { useTranslation } from '@/hooks/useTranslation'
import {
  getHouseholdMembers,
  updateHouseholdName,
} from '@/lib/households'
import { queryKeys } from '@/lib/queryKeys'
import { getAvatarColor } from '@/utils/avatar'
import { Avatar } from '@/components/Avatar'
import { CloseHouseholdSheet } from './CloseHouseholdSheet'
import { LeaveHouseholdSheet } from './LeaveHouseholdSheet'

const MAX_NAME_LENGTH = 50

export const SettingsPage = () => {
  const { user } = useAuth()
  const { household } = useHousehold()
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const [editingName, setEditingName] = useState(false)
  const [householdName, setHouseholdName] = useState('')
  const [nameError, setNameError] = useState('')
  const [copied, setCopied] = useState(false)

  const [closeSheetOpen, setCloseSheetOpen] = useState(false)
  const [leaveSheetOpen, setLeaveSheetOpen] = useState(false)

  const { data: members = [] } = useQuery({
    queryKey: queryKeys.householdMembers(household?.id ?? ''),
    queryFn: () => getHouseholdMembers(household!.id),
    enabled: !!household?.id,
  })

  const updateNameMutation = useMutation({
    mutationFn: (name: string) => updateHouseholdName(household!.id, name),
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: queryKeys.households(user.id) })
      }
      setEditingName(false)
      setNameError('')
    },
    onError: () => {
      setNameError(t('settings.nameError'))
    },
  })

  const isOwner = household?.createdBy === user?.id

  const handleStartEditName = useCallback(() => {
    setHouseholdName(household?.name ?? '')
    setEditingName(true)
    setNameError('')
  }, [household])

  const handleCancelEditName = useCallback(() => {
    setEditingName(false)
    setNameError('')
  }, [])

  const handleSaveName = useCallback(() => {
    const trimmed = householdName.trim()
    if (!trimmed) {
      setNameError(t('settings.nameRequired'))
      return
    }
    if (trimmed.length > MAX_NAME_LENGTH) {
      setNameError(t('settings.nameTooLong'))
      return
    }
    updateNameMutation.mutate(trimmed)
  }, [householdName, updateNameMutation, t])

  const handleCopyCode = useCallback(async () => {
    if (!household?.joinCode) return
    try {
      await navigator.clipboard.writeText(household.joinCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard not available
    }
  }, [household])

  if (!household || !user) return null

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-6 text-[22px] font-medium text-[var(--color-text-primary)]">
        {t('settings.title')}
      </h1>

      {/* Account Section */}
      <section className="mb-8">
        <h2 className="mb-3 text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--color-text-tertiary)]">
          {t('settings.accountSection')}
        </h2>
        <div className="rounded-[var(--radius-lg)] border-[0.5px] border-[var(--color-border-default)] bg-[var(--color-bg-primary)]">
          <div className="flex items-center gap-3 border-b-[0.5px] border-[var(--color-border-default)] px-4 py-3">
            <i className="ti ti-user text-lg text-[var(--color-text-tertiary)]" />
            <div className="flex-1">
              <p className="text-[12px] text-[var(--color-text-secondary)]">
                {t('settings.nameLabel')}
              </p>
              <p className="text-[14px] font-medium text-[var(--color-text-primary)]">
                {user.displayName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <i className="ti ti-mail text-lg text-[var(--color-text-tertiary)]" />
            <div className="flex-1">
              <p className="text-[12px] text-[var(--color-text-secondary)]">
                {t('settings.emailLabel')}
              </p>
              <p className="text-[14px] text-[var(--color-text-primary)]">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Household Section */}
      <section className="mb-8">
        <h2 className="mb-3 text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--color-text-tertiary)]">
          {t('settings.householdSection')}
        </h2>
        <div className="rounded-[var(--radius-lg)] border-[0.5px] border-[var(--color-border-default)] bg-[var(--color-bg-primary)]">
          {/* Household Name */}
          <div className="flex items-center gap-3 border-b-[0.5px] border-[var(--color-border-default)] px-4 py-3">
            <i className="ti ti-home text-lg text-[var(--color-text-tertiary)]" />
            <div className="flex-1">
              <p className="text-[12px] text-[var(--color-text-secondary)]">
                {t('settings.nameLabel')}
              </p>
              {editingName ? (
                <div className="mt-1">
                  <input
                    type="text"
                    value={householdName}
                    onChange={(e) => {
                      setHouseholdName(e.target.value)
                      if (nameError) setNameError('')
                    }}
                    maxLength={MAX_NAME_LENGTH}
                    className="w-full rounded-[var(--radius-md)] border-[1.5px] border-[var(--color-accent)] bg-[var(--color-bg-primary)] p-[9px_12px] text-[14px] text-[var(--color-text-primary)] outline-none"
                    autoFocus
                  />
                  {nameError && (
                    <p className="mt-1 text-[11px] text-red-500">{nameError}</p>
                  )}
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={handleSaveName}
                      disabled={updateNameMutation.isPending}
                      className="inline-flex min-h-[36px] items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-accent)] px-3 text-[13px] font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
                    >
                      {updateNameMutation.isPending ? t('settings.saving') : t('settings.save')}
                    </button>
                    <button
                      onClick={handleCancelEditName}
                      disabled={updateNameMutation.isPending}
                      className="inline-flex min-h-[36px] items-center justify-center rounded-[var(--radius-md)] border-[0.5px] border-[var(--color-border-strong)] bg-transparent px-3 text-[13px] font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-bg-secondary)] disabled:opacity-50"
                    >
                      {t('settings.cancel')}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-[14px] font-medium text-[var(--color-text-primary)]">
                  {household.name}
                </p>
              )}
            </div>
            {isOwner && !editingName && (
              <button
                onClick={handleStartEditName}
                className="text-[13px] font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
              >
                {t('settings.edit')}
              </button>
            )}
          </div>

          {/* Join Code */}
          <div className="flex items-center gap-3 px-4 py-3">
            <i className="ti ti-key text-lg text-[var(--color-text-tertiary)]" />
            <div className="flex-1">
              <p className="text-[12px] text-[var(--color-text-secondary)]">
                {t('settings.joinCodeLabel')}
              </p>
              <p className="text-[14px] font-mono font-medium text-[var(--color-text-primary)]">
                {household.joinCode}
              </p>
            </div>
            <button
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
            >
              <i className={`ti ${copied ? 'ti-check text-green-500' : 'ti-copy'}`} />
              {copied ? t('common.copied') : t('settings.copy')}
            </button>
          </div>
        </div>
      </section>

      {/* Members Section */}
      <section className="mb-8">
        <h2 className="mb-3 text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--color-text-tertiary)]">
          {t('settings.membersSection')} ({members.length})
        </h2>
        <div className="rounded-[var(--radius-lg)] border-[0.5px] border-[var(--color-border-default)] bg-[var(--color-bg-primary)]">
          {members.map((member, index) => (
            <div
              key={member.id}
              className={`flex items-center gap-3 px-4 py-3 ${
                index < members.length - 1
                  ? 'border-b-[0.5px] border-[var(--color-border-default)]'
                  : ''
              }`}
            >
              <Avatar
                displayName={member.displayName}
                src={member.avatarUrl}
                size="md"
                color={getAvatarColor(member.displayName)}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-[14px] font-medium text-[var(--color-text-primary)]">
                    {member.displayName}
                  </p>
                  {member.role === 'owner' && (
                    <span className="inline-flex shrink-0 items-center rounded-full bg-[var(--color-accent-subtle)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-accent)]">
                      {t('settings.ownerBadge')}
                    </span>
                  )}
                  {member.userId === user.id && (
                    <span className="inline-flex shrink-0 items-center rounded-full bg-[var(--color-bg-secondary)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-text-secondary)]">
                      {t('settings.youBadge')}
                    </span>
                  )}
                </div>
                <p className="truncate text-[13px] text-[var(--color-text-secondary)]">
                  {member.email}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Danger Zone */}
      <section>
        <div className="rounded-[var(--radius-lg)] border border-red-500/30 bg-red-500/5 p-4">
          <div className="mb-3 flex items-center gap-2">
            <i className="ti ti-alert-triangle text-lg text-red-500" />
            <h3 className="text-[11px] font-medium uppercase tracking-[0.06em] text-red-500">
              {t('settings.dangerZone')}
            </h3>
          </div>

          {isOwner ? (
            <>
              <h4 className="text-[15px] font-medium text-red-500">
                {t('settings.closeHousehold')}
              </h4>
              <p className="mb-4 text-[13px] text-[var(--color-text-secondary)]">
                {t('settings.closeHouseholdDescription')}
              </p>
              <button
                onClick={() => setCloseSheetOpen(true)}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[var(--radius-md)] border-[0.5px] border-red-500/50 bg-transparent px-4 py-[10px] text-[14px] font-medium text-red-500 transition-colors hover:bg-red-500/10"
              >
                <i className="ti ti-trash text-base" />
                {t('settings.closeHousehold')}
              </button>
            </>
          ) : (
            <>
              <h4 className="text-[15px] font-medium text-red-500">
                {t('settings.leaveHousehold')}
              </h4>
              <p className="mb-4 text-[13px] text-[var(--color-text-secondary)]">
                {t('settings.leaveHouseholdDescription')}
              </p>
              <button
                onClick={() => setLeaveSheetOpen(true)}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[var(--radius-md)] border-[0.5px] border-red-500/50 bg-transparent px-4 py-[10px] text-[14px] font-medium text-red-500 transition-colors hover:bg-red-500/10"
              >
                <i className="ti ti-logout text-base" />
                {t('settings.leaveHousehold')}
              </button>
            </>
          )}
        </div>
      </section>

      {/* Modals */}
      <CloseHouseholdSheet
        open={closeSheetOpen}
        onOpenChange={setCloseSheetOpen}
        household={household}
        memberCount={members.length}
      />
      <LeaveHouseholdSheet
        open={leaveSheetOpen}
        onOpenChange={setLeaveSheetOpen}
        household={household}
      />
    </div>
  )
}
