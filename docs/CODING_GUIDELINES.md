# mealWise — Coding Guidelines

---

## General Principles

- **Clarity over cleverness** — write code that is easy to read and understand
- **Small, focused units** — functions and components should do one thing well
- **Fail loudly** — never silently swallow errors; always handle or surface them
- **No premature optimization** — make it work first, then optimize if needed
- **Consistency** — follow existing patterns in the codebase before introducing new ones

---

## TypeScript

- Strict mode is enabled — no `any`, ever
- Always type function parameters and return values explicitly
- Prefer `type` over `interface` for data shapes; use `interface` only for extendable contracts
- Use `unknown` instead of `any` when the type is genuinely unknown, then narrow it
- Never use non-null assertion (`!`) — handle nullability explicitly
- Use `satisfies` for validating literal objects against a type without losing inference

```ts
// ❌ Bad
const getMeal = (id: any) => { ... }

// ✅ Good
const getMeal = (id: string): Promise<Meal> => { ... }
```

---

## React

- Functional components only — no class components
- One component per file
- Keep components small — if a component exceeds ~150 lines, split it
- Extract reusable UI into `src/components/ui/` and domain components into `src/components/`
- Avoid prop drilling beyond 2 levels — use context or co-locate state
- Use `React.memo` only when there is a measured performance reason, not by default
- Never use `useEffect` for data fetching — use TanStack Query instead

```ts
// ❌ Bad
useEffect(() => {
  fetchMeals().then(setMeals)
}, [])

// ✅ Good
const { data: meals } = useQuery({
  queryKey: ['meals', householdId],
  queryFn: () => getMeals(householdId)
})
```

---

## TanStack Query

- Every query must have a consistent, typed `queryKey` — define keys in a central `src/lib/queryKeys.ts` file
- Use `useMutation` for all writes (insert, update, delete) and invalidate relevant queries on success
- Always handle `isLoading`, `isError`, and empty states in the UI — never assume data is available
- Use optimistic updates for fast-feedback interactions (e.g. checking off a shopping list item)

```ts
// queryKeys.ts
export const queryKeys = {
  meals: (householdId: string) => ['meals', householdId] as const,
  weeklyMenu: (householdId: string, weekStart: string) =>
    ['weeklyMenu', householdId, weekStart] as const,
}
```

---

## TanStack Router

- Use file-based routing under `src/routes/`
- Route params and search params must be typed — never use untyped `params`
- Use `loader` for data that should be prefetched before the route renders
- Redirect unauthenticated users at the router level, not inside components

---

## Supabase

- All Supabase logic lives in `src/lib/` — one file per domain (e.g. `meals.ts`, `menus.ts`, `shopping.ts`)
- Never call `supabase` directly from a component — always go through a `src/lib/` function
- Always check for errors in Supabase responses — never destructure `data` without checking `error`
- Never use the `service_role` key on the frontend — only the `anon` key via the Supabase client

```ts
// ❌ Bad — called directly in component, error ignored
const { data } = await supabase.from('meals').select('*')

// ✅ Good — in src/lib/meals.ts, error handled
export const getMeals = async (householdId: string): Promise<Meal[]> => {
  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .eq('household_id', householdId)

  if (error) throw error
  return data
}
```

---

## File & Folder Structure

```
src/
├── components/        # Shared and domain UI components
│   └── ui/            # Base UI primitives (shadcn/ui wrappers)
├── lib/               # Supabase queries, API calls, utilities
│   ├── queryKeys.ts   # Centralized TanStack Query keys
│   ├── supabase.ts    # Supabase client initialization
│   ├── meals.ts
│   ├── menus.ts
│   ├── shopping.ts
│   └── ingredients.ts
├── routes/            # TanStack Router file-based routes
├── hooks/             # Custom React hooks
├── types/             # Shared TypeScript types and interfaces
└── utils/             # Pure utility functions (no side effects)
```

---

## Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Components | PascalCase | `MealCard.tsx` |
| Hooks | camelCase with `use` prefix | `useHousehold.ts` |
| Lib functions | camelCase | `getMeals`, `createMeal` |
| Types | PascalCase | `Meal`, `ShoppingListItem` |
| Route files | kebab-case | `weekly-menu.tsx` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_DAYS_AHEAD` |

---

## Error Handling

- All async functions must be wrapped in try/catch or propagate errors explicitly
- Use a consistent error boundary at the route level to catch render errors
- Show user-friendly error messages in the UI — never expose raw Supabase or API error messages to the user
- Log errors to the console in development; integrate an error tracking service before production

---

## Mobile-First CSS

- Always design and build for mobile first, then add responsive overrides for larger screens
- Use Tailwind's responsive prefixes in order: base (mobile) → `sm:` → `md:` → `lg:`
- Minimum tap target size: **44x44px** for all interactive elements
- Avoid hover-only interactions — always provide a tap/click equivalent
- Test layouts at 375px width (iPhone SE) as the minimum supported size

```tsx
// ❌ Bad — desktop first
<div className="grid-cols-4 sm:grid-cols-1">

// ✅ Good — mobile first
<div className="grid-cols-1 md:grid-cols-4">
```

---

## AI Features (Anthropic API)

- All Anthropic API calls go through a single wrapper in `src/lib/ai.ts`
- Always set a timeout and handle failures gracefully — if category detection fails, let the user set it manually
- Never block the UI waiting for AI responses — show a loading indicator and allow cancellation
- Keep prompts in a dedicated `src/lib/prompts.ts` file so they are easy to find and update

---

## Code Style

- Use `const` by default; `let` only when reassignment is needed
- Prefer early returns over nested conditionals
- No commented-out code in commits — delete it or open a ticket
- No magic numbers — extract them as named constants
- Imports order: React → third-party → internal (`@/`) → relative

```ts
// ✅ Correct import order
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getMeals } from '@/lib/meals'
import { MealCard } from './MealCard'
```