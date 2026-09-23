# mealWise

A mobile-first weekly meal planner for households. Users manage a library of meals with ingredients, plan their week, and generate a categorized shopping list they can check off at the market.

---

## On Session Start

1. Always activate the **ProductManager** agent before doing anything else.
2. For feature work, read **`docs/features/`** (start at `docs/features/README.md`) instead of asking the user to paste feature context. Also check `docs/DATABASE.md` when touching schema.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build tool | Vite |
| Routing | TanStack Router (file-based, type-safe) |
| Server state | TanStack Query |
| Backend / DB | Supabase (PostgreSQL) |
| Auth | Supabase Auth — email/password |
| Styling | Tailwind CSS v4 |
| UI components | shadcn/ui |
| AI features | Optional ingredient category detection (system setting) |
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

- Feature guidance (session) → `docs/features/README.md`
- Features overview → `docs/FEATURES.md`
- Database schema → `docs/DATABASE.md`
- Coding guidelines → `docs/CODING_GUIDELINES.md`