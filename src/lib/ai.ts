import type { IngredientCategory } from '@/types/meals'
import { CATEGORY_DETECTION_PROMPT, formatPrompt } from './prompts'

const VALID_CATEGORIES: IngredientCategory[] = [
  'vegetables',
  'proteins',
  'pantry',
  'fruits',
  'spices',
  'cleaning',
]

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const TIMEOUT_MS = 10_000

export const detectCategory = async (
  ingredientName: string,
): Promise<IngredientCategory> => {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) return 'pantry'

  const prompt = formatPrompt(CATEGORY_DETECTION_PROMPT, { name: ingredientName })

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 20,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: controller.signal,
    })

    if (!response.ok) return 'pantry'

    const data = await response.json()
    const text = data.content?.[0]?.text?.trim().toLowerCase() as string | undefined

    if (text && VALID_CATEGORIES.includes(text as IngredientCategory)) {
      return text as IngredientCategory
    }

    return 'pantry'
  } catch {
    return 'pantry'
  } finally {
    clearTimeout(timeout)
  }
}
