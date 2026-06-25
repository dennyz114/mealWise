export const DEFAULT_LOCALE = 'es'
export const LOCALE_STORAGE_KEY = 'mealwise-locale'

export const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
] as const

export type Locale = (typeof LANGUAGES)[number]['code']

type TranslationValue = string | { [key: string]: TranslationValue }

export type Translations = { [key: string]: TranslationValue }
