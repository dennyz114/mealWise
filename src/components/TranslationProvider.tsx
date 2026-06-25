import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, type Locale } from '@/lib/i18n'
import en from '@/locales/en.json'
import es from '@/locales/es.json'
import fr from '@/locales/fr.json'

type TranslationContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
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

  const t = useCallback((key: string): string => {
    const currentTranslations = translations[locale]
    const value = getNestedValue(currentTranslations, key)

    if (value !== undefined) {
      return value
    }

    const fallbackValue = getNestedValue(translations.en, key)
    if (fallbackValue !== undefined) {
      return fallbackValue
    }

    return key
  }, [locale])

  return (
    <TranslationContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </TranslationContext.Provider>
  )
}

export { TranslationContext }