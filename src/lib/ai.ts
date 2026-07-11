import type { IngredientCategory } from '@/types/meals'
import type { Locale } from './i18n'
import { getCategoryDetectionPrompt, formatPrompt } from './prompts'

const VALID_CATEGORIES: IngredientCategory[] = [
  'vegetables',
  'proteins',
  'pantry',
  'fruits',
  'spices',
  'cleaning',
]

const CATEGORY_MAP: Record<string, IngredientCategory> = {
  verduras: 'vegetables',
  vegetales: 'vegetables',
  hortalizas: 'vegetables',
  proteinas: 'proteins',
  carne: 'proteins',
  pollo: 'proteins',
  pescado: 'proteins',
  mariscos: 'proteins',
  huevos: 'proteins',
  despensa: 'pantry',
  abarrotes: 'pantry',
  granos: 'pantry',
  frutas: 'fruits',
  especias: 'spices',
  condimentos: 'spices',
  limpieza: 'cleaning',
}

const normalizeCategory = (text: string): IngredientCategory | null => {
  const lower = text.toLowerCase().trim()

  if (VALID_CATEGORIES.includes(lower as IngredientCategory)) {
    return lower as IngredientCategory
  }

  if (CATEGORY_MAP[lower]) {
    return CATEGORY_MAP[lower]
  }

  for (const cat of VALID_CATEGORIES) {
    if (lower.includes(cat)) {
      return cat
    }
  }

  return null
}

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models'
const MODEL_NAME = 'gemini-2.5-flash-lite'
const TIMEOUT_MS = 10_000

export const detectCategory = async (
  ingredientName: string,
  locale: Locale = 'en',
): Promise<IngredientCategory | null> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (!apiKey) {
    console.warn('No Gemini API key found')
    return null
  }

  const promptTemplate = getCategoryDetectionPrompt(locale)
  const prompt = formatPrompt(promptTemplate, { name: ingredientName })

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(
      `${GEMINI_API_URL}/${MODEL_NAME}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            maxOutputTokens: 50,
            temperature: 0,
          },
        }),
        signal: controller.signal,
      },
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      console.error('Gemini API error:', response.status, errorData)
      return null
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

    if (!text) {
      console.warn('Empty response from Gemini API')
      return null
    }

    const normalized = normalizeCategory(text)
    if (normalized) {
      return normalized
    }

    console.warn('Could not normalize category response:', text)
    return null
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('Gemini API request timed out')
    } else {
      console.error('Gemini API error:', error)
    }
    return null
  } finally {
    clearTimeout(timeout)
  }
}
