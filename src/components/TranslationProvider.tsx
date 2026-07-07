import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, type Locale } from '@/lib/i18n'
import en from '@/locales/en.json'
import es from '@/locales/es.json'
import fr from '@/locales/fr.json'

type TranslationContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const translations = { en, es, fr } as const

const getNestedValue = (obj: unknown, path: string): string | undefined => {
  const keys = path.split('.')
  let current: unknown = obj

  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined
    }
    current = (current as Record<string, unknown>)[key]
  }

  return typeof current === 'string' ? current : undefined
}

const TranslationContext = createContext<TranslationContextValue | null>(null)

type TranslationProviderProps = {
  children: ReactNode
}

export const TranslationProvider = ({ children }: TranslationProviderProps) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (stored === 'en' || stored === 'es' || stored === 'fr') {
      return stored
    }
    return DEFAULT_LOCALE
  })

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const setLocale = useCallback((newLocale: Locale) => {
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale)
    setLocaleState(newLocale)
  }, [])

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const currentTranslations = translations[locale]
    let value = getNestedValue(currentTranslations, key)

    if (value === undefined) {
      value = getNestedValue(translations.en, key)
    }

    if (value === undefined) {
      return key
    }

    if (params) {
      for (const [paramKey, paramValue] of Object.entries(params)) {
        value = value.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue))
      }
    }

    return value
  }, [locale])

  return (
    <TranslationContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </TranslationContext.Provider>
  )
}

export { TranslationContext }