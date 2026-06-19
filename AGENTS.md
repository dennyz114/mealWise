# mealWise

A mobile-first weekly meal planner for households. Users manage a library of meals with ingredients, plan their week, and generate a categorized shopping list they can check off at the market.

---

## On Session Start

Always activate the **ProductManager** agent before doing anything else.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build tool | Vite |
| Routing | TanStack Router (file-based, type-safe) |
| Server state | TanStack Query |
| Backend / DB | Supabase (PostgreSQL) |
| Auth | Supabase Auth — Google OAuth |
| Styling | Tailwind CSS v4 |
| UI components | shadcn/ui |
| AI features | Anthropic API (ingredient category auto-detection) |
| Deployment | Cloudflare Pages |

---

## Project Type

- **SPA** — no SSR, no SEO requirements
- **Mobile-first** — UI must work well on phones; desktop is secondary
- All data access goes through the **Supabase JS client** directly from the frontend
- No custom backend server

---

## Key Conventions

- All new components go in `src/components/`
- All Supabase query logic goes in `src/lib/` (one file per domain: `meals.ts`, `menus.ts`, `shopping.ts`, etc.)
- TanStack Router file-based routing under `src/routes/`
- Use TanStack Query for all async data — no raw `useEffect` for fetching
- TypeScript strict mode — no `any`
- Prefer editing existing files over creating new ones

---

## Linked Docs

- Database schema → `docs/DATABASE.md`
- Features → `docs/FEATURES.md`
- Coding guidelines → `docs/CODING_GUIDELINES.md`