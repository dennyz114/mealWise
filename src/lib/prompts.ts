export const CATEGORY_DETECTION_PROMPT = `Given an ingredient name, classify it into exactly one of these categories:
- vegetables
- proteins
- pantry
- fruits
- spices
- cleaning

Return ONLY the category name in lowercase, nothing else. No punctuation, no explanation.

Ingredient: {name}`

export const formatPrompt = (template: string, vars: Record<string, string>): string => {
  let result = template
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(`{${key}}`, value)
  }
  return result
}
