import { useState, useCallback } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useNavigate } from '@tanstack/react-router'
import { Avatar } from '@/components/Avatar'
import { useTheme } from '@/lib/theme'
import { signOut } from '@/lib/auth'
import { useTranslation } from '@/hooks/useTranslation'
import { LANGUAGES, type Locale } from '@/lib/i18n'
import type { AuthUser } from '@/types/auth'
import type { Household } from '@/types/household'

type ProfileDropdownProps = {
  user: AuthUser
  household?: Household | null
}

export const ProfileDropdown = ({ user, household }: ProfileDropdownProps) => {
  const { theme, setTheme } = useTheme()
  const { locale, setLocale, t } = useTranslation()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)
  const [langExpanded, setLangExpanded] = useState(false)

  const isDark = theme === 'dark'
  const hasHousehold = !!household

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

  const handleSignOut = useCallback(async () => {
    await signOut()
    navigate({ to: '/login' })
  }, [navigate])

  const handleLanguageSelect = useCallback((code: Locale) => {
    setLocale(code)
    setLangExpanded(false)
  }, [setLocale])

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <button className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]">
          <Avatar
            src={user.avatarUrl}
            displayName={user.displayName}
            size="sm"
          />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-[220px] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-primary)] p-2 shadow-lg"
        >
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar
              src={user.avatarUrl}
              displayName={user.displayName}
              size="md"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                {user.displayName}
              </p>
              <p className="truncate text-xs text-[var(--color-text-secondary)]">
                {user.email}
              </p>
            </div>
          </div>

          <DropdownMenu.Separator className="my-1 h-px bg-[var(--color-border-default)]" />

          <DropdownMenu.Item
            className={`flex cursor-pointer items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none ${
              hasHousehold ? 'hover:bg-[var(--color-bg-secondary)]' : ''
            }`}
            onSelect={(e) => {
              e.preventDefault()
              if (hasHousehold) handleCopyCode()
            }}
            disabled={!hasHousehold}
          >
            <i className={`ti ti-home text-base ${!hasHousehold ? 'opacity-40' : ''}`} />
            <span className={`flex-1 ${!hasHousehold ? 'opacity-40' : ''}`}>
              {t('household.myHousehold')}
            </span>
            {hasHousehold ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-bg-secondary)] px-2 py-0.5 text-xs text-[var(--color-text-secondary)]">
                {household.joinCode}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCopyCode()
                  }}
                  className="ml-0.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                >
                  <i className={`ti ${copied ? 'ti-check text-green-500' : 'ti-copy'}`} />
                </button>
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                {t('household.setupNeeded')}
              </span>
            )}
          </DropdownMenu.Item>

          <DropdownMenu.Item
            className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none hover:bg-[var(--color-bg-secondary)]"
            onSelect={(e) => {
              e.preventDefault()
              setTheme(isDark ? 'light' : 'dark')
            }}
          >
            <i className={`ti ${isDark ? 'ti-sun' : 'ti-moon'} text-base`} />
            <span className="flex-1">{t('profile.darkMode')}</span>
            <span className="text-xs text-[var(--color-text-secondary)]">
              {isDark ? 'On' : 'Off'}
            </span>
          </DropdownMenu.Item>

          <DropdownMenu.Item
            className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm text-[var(--color-accent)] outline-none hover:bg-[var(--color-accent-subtle)]"
            onSelect={(e) => {
              e.preventDefault()
              setLangExpanded(!langExpanded)
            }}
          >
            <i className="ti ti-language text-base" />
            <span className="flex-1">{t('profile.language')}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-accent-subtle)] px-2 py-0.5 text-xs font-medium text-[var(--color-accent)]">
              {LANGUAGES.find(l => l.code === locale)?.code.toUpperCase()}
            </span>
            <i className={`ti ti-chevron-${langExpanded ? 'up' : 'down'} text-xs text-[var(--color-accent)]`} />
          </DropdownMenu.Item>

          {langExpanded && (
            <div className="ml-4 border-l border-[var(--color-border-default)] pl-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageSelect(lang.code)}
                  className="flex w-full items-center gap-2 rounded-[var(--radius-md)] px-2 py-1.5 text-sm text-[var(--color-text-primary)] outline-none hover:bg-[var(--color-bg-secondary)]"
                >
                  <span className="text-base">{lang.flag}</span>
                  <span className="flex-1 text-left">
                    <span className="font-medium">{lang.nativeName}</span>
                    <span className="ml-1 text-xs text-[var(--color-text-secondary)]">
                      {lang.name}
                    </span>
                  </span>
                  {locale === lang.code && (
                    <i className="ti ti-check text-sm text-[var(--color-accent)]" />
                  )}
                </button>
              ))}
            </div>
          )}

          <DropdownMenu.Item
            className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none hover:bg-[var(--color-bg-secondary)]"
            onSelect={(e) => e.preventDefault()}
          >
            <i className="ti ti-settings text-base" />
            <span>{t('profile.settings')}</span>
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="my-1 h-px bg-[var(--color-border-default)]" />

          <DropdownMenu.Item
            className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none hover:bg-[var(--color-bg-secondary)]"
            onSelect={(e) => {
              e.preventDefault()
              handleSignOut()
            }}
          >
            <i className="ti ti-logout text-base" />
            <span>{t('profile.signOut')}</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}