import type { Locale } from './i18n'

const CATEGORY_DETECTION_PROMPTS: Record<Locale, string> = {
  en: `You are a food ingredient classifier. Given an ingredient name, classify it into EXACTLY one of these categories:

- vegetables (fresh vegetables, herbs, leafy greens)
- proteins (meat, poultry, fish, seafood, eggs, tofu, legumes)
- pantry (dry goods, grains, pasta, rice, canned goods, oils, vinegar)
- fruits (fresh fruits, dried fruits)
- spices (spices, seasonings, herbs, sauces, condiments)
- cleaning (cleaning supplies, dish soap, laundry detergent)

IMPORTANT: Return ONLY the category name in lowercase. Nothing else. No punctuation, no explanation, no quotes.

Examples:
- chicken breast → proteins
- carrot → vegetables
- rice → pantry
- apple → fruits
- cumin → spices
- dish soap → cleaning

Ingredient: {name}`,

  es: `Eres un clasificador de ingredientes alimentarios. Dado el nombre de un ingrediente, clasifícalo en UNA de estas categorías EXACTAMENTE:

- vegetables (verduras frescas, hierbas, hojas verdes)
- proteins (carne, pollo, pescado, mariscos, huevos, tofu, legumbres)
- pantry (granos secos, pastas, arroz, enlatados, aceites, vinagre)
- fruits (frutas frescas, frutas secas)
- spices (especias, condimentos, hierbas, salsas)
- cleaning (productos de limpieza, jabón para platos, detergente)

IMPORTANTE: Devuelve SOLO el nombre de la categoría en inglés y en minúsculas. Nada más. Sin puntuación, sin explicación, sin comillas.

Ejemplos:
- pechuga de pollo → proteins
- zanahoria → vegetables
- arroz → pantry
- manzana → fruits
- comino → spices
- jabón para platos → cleaning

Ingrediente: {name}`,

  fr: `Vous êtes un classificateur d'ingrédients alimentaires. Étant donné le nom d'un ingrédient, classez-le dans UNE de ces catégories EXACTEMENT:

- vegetables (légumes frais, herbes, légumes-feuilles)
- proteins (viande, volaille, poisson, fruits de mer, œufs, tofu, légumineuses)
- pantry (produits secs, pâtes, riz, conserves, huiles, vinaigre)
- fruits (fruits frais, fruits secs)
- spices (épices, assaisonnements, herbes, sauces)
- cleaning (produits ménagers, liquide vaisselle, lessive)

IMPORTANT: Retournez UNIQUEMENT le nom de la catégorie en anglais et en minuscules. Rien d'autre. Sans ponctuation, sans explication, sans guillemets.

Exemples:
- poitrine de poulet → proteins
- carotte → vegetables
- riz → pantry
- pomme → fruits
- cumin → spices
- liquide vaisselle → cleaning

Ingrédient: {name}`,
}

export const getCategoryDetectionPrompt = (locale: Locale): string =>
  CATEGORY_DETECTION_PROMPTS[locale] ?? CATEGORY_DETECTION_PROMPTS.en

export const formatPrompt = (template: string, vars: Record<string, string>): string => {
  let result = template
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value)
  }
  return result
}
