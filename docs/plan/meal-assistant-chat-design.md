# Meal Assistant Chat — Design

## Summary

Add a full-page chat assistant at `/assistant` that helps household members create meals: the user enters a meal name, Gemini proposes ingredients (preferring names already in the household library), the user refines via chat and light inline edits, then Accept persists meal + ingredients through a new dedicated Supabase RPC and shows a link to the created meal.

Weekly menu generation is out of scope for MVP but the same chat shell exposes a “Plan my week” chip that replies “coming soon.”

## Goals

- Faster meal creation when the user knows the dish name but not every ingredient.
- Prefer existing `ingredient_library` names so shopping lists stay consistent.
- Nothing written to the database until the user explicitly accepts.
- Extensible chat shell for a future weekly-menu intent.

## Non-goals (MVP)

- Weekly menu / random meal list generation (chip → “coming soon” only).
- Persisted chat history (refresh or leave clears the session).
- Editing existing meals via chat.
- Moving Gemini behind a Supabase Edge Function (client Gemini, same model as category detection).
- Voice or image input.

## Decisions (confirmed)

| Topic | Decision |
|---|---|
| Entry | Own route, full-page chat |
| Scope | Meal create + “coming soon” for week planning |
| Edits | Chat + light inline edits on proposal card |
| Duplicate meal name | Block Accept; ask rename; keep proposal |
| AI | Client Gemini (same model as today) |
| Ingredient language | Match UI locale (EN / ES / FR) |
| Servings | Not asked; model supplies default qty/unit |
| History | Ephemeral |
| Feature flag | New flag, **enabled by default** |
| Persistence | New dedicated Supabase RPC (not the wizard’s client multi-step path) |

## UX & flow

### Shell

- Route: `/assistant` (authenticated).
- Nav: mobile bottom tabs + desktop sidebar; label via i18n (e.g. “Assistant”).
- Hide nav item when the feature flag is off.
- Layout: scrollable message list + pinned composer; when a proposal exists, a clear primary **Accept / Create meal** action (thumb-friendly).

### States

1. **Idle** — Welcome + starter chips: “Create a meal”, “Plan my week”.
2. **Awaiting name** — After “Create a meal”, the bot asks for the meal name; the user replies with the name. (Typing a free-form name from idle may be treated as starting create + that name in a later polish; MVP: chip → ask → name.)
3. **Generating** — Load household ingredient library; call Gemini with meal name + library + locale.
4. **Reviewing** — Show proposal card; allow chat refinements and inline edits.
5. **Creating** — Call new save RPC.
6. **Done** — Success message + link to `/meals/$mealId`; option to create another (reset toward idle / awaiting name).

“Plan my week” from idle → short “coming soon” reply; remain in idle.

### Proposal card

- Rows: name, quantity, unit, category badge.
- Inline: edit qty / unit / name, remove row, add row.
- Chat messages request structural or bulk changes; Gemini returns a full updated proposal JSON.
- Inline edits update the local draft only (no AI call).

### Accept

1. Validate draft: non-empty meal name; valid units/categories; **at least one ingredient**.
2. Call RPC `create_meal_from_assistant`.
3. On success: show link to meal detail.
4. On duplicate name: stay in reviewing; ask user to rename; keep ingredients.

## Gemini contracts

Provider: existing client Gemini integration (`src/lib/ai.ts` pattern), gated by the new flag + API key.

### Propose

**Input**

- `mealName: string`
- `locale: 'en' | 'es' | 'fr'`
- `existingIngredients: { id, name, unit, category }[]`

**Output (strict JSON)**

```json
{
  "message": "optional short assistant text",
  "ingredients": [
    {
      "name": "string",
      "quantity": 1,
      "unit": "units|kg|l|pack|bunch|can",
      "category": "vegetables|proteins|pantry|fruits|spices|cleaning",
      "libraryIngredientId": "uuid | null"
    }
  ]
}
```

**Prompt rules**

- Prefer matching an existing library ingredient by name; when matched, set `libraryIngredientId` and reuse that name/unit/category when sensible (quantity may still be proposed).
- Only invent new ingredient names when nothing suitable exists.
- Use only allowed units and categories.
- Supply default quantity and unit (no servings question).
- Ingredient names in the UI locale.

### Refine

**Input:** current proposal + user message + same library list + locale.  
**Output:** same JSON shape; replace the draft proposal entirely.

On invalid JSON: one automatic retry, then soft-fail with a retry CTA (keep prior draft if any).

## Persistence — new RPC

### `create_meal_from_assistant`

**Params**

| Param | Type | Meaning |
|---|---|---|
| `p_household_id` | uuid | Target household |
| `p_name` | text | Meal name |
| `p_icon` | text, optional | If omitted, server assigns like `create_meal` |
| `p_ingredients` | jsonb | Array of `{ name, quantity, unit, category, library_ingredient_id? }` |

**Behavior**

1. Verify caller is an authenticated member of the household.
2. If a meal with the same name already exists in that household → raise a clear error (app prompts rename).
3. Create the meal (icon once at creation, same Tabler pool convention as existing create).
4. For each ingredient:
   - If `library_ingredient_id` is present and belongs to the household → use it.
   - Else upsert `ingredient_library` on `(household_id, name)` with unit/category.
5. Insert `meal_ingredients` rows with quantities (unique per meal + ingredient).
6. Return at least `{ id, name }` for navigation.

**Frontend:** `src/lib/` wrapper that calls only this RPC for assistant Accept (do not reuse the wizard’s multi-step client create loop).

## Feature flag & availability

- Config key `aiMealAssistant: true` in `src/config/systemSettings.ts`.
- If flag off: hide nav entry (preferred).
- If flag on but no `VITE_GEMINI_API_KEY`: show unavailable state on `/assistant` with link to Meals / manual create.

## Errors

| Case | Behavior |
|---|---|
| Gemini timeout / network | Keep meal name; offer retry; no DB write |
| Invalid model JSON | One retry; then soft fail; keep prior draft if reviewing |
| Save RPC failure | Stay on proposal; show error; retry Accept |
| Duplicate meal name | Rename prompt; proposal unchanged |
| Flag off / no key | Unavailable UI as above |

## Extensibility

Same page and message list later gain a `plan_week` path (propose a set of meals for the week). MVP only reserves the idle chip and “coming soon” reply.

## Success criteria

- User can go from meal name → accepted meal with ingredients in a few turns without a servings step.
- Proposals prefer existing library names when applicable.
- Accept creates meal + library upserts + links atomically via the new RPC.
- Success UI includes a direct link to the new meal.
- Mobile-usable full-page chat; ephemeral session; week-planning clearly deferred.
