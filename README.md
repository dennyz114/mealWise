# mealWise

A mobile-first weekly meal planner for households. Plan your meals, manage your recipes, and generate a smart shopping list — all shared with your household.

---

## Features

- **Meal Library** — build a shared collection of meals with ingredients, quantities, and units
- **Smart Ingredients** — reuse ingredients across meals; categories are auto-detected using AI
- **Weekly Planner** — assign meals to any week, past or future, day by day
- **Shopping List** — auto-generated from the week's meals, grouped by category and sorted alphabetically
- **Market Mode** — check off items as you shop, with manual additions and quantity edits
- **Household Sharing** — invite members via a join code; everything is shared within the household

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build tool | Vite |
| Routing | TanStack Router |
| Server state | TanStack Query |
| Backend / DB | Supabase (PostgreSQL) |
| Auth | Supabase Auth — Google OAuth |
| Styling | Tailwind CSS v4 |
| UI components | shadcn/ui |
| AI features | Anthropic API |
| Deployment | Cloudflare Pages |

---

## Getting Started

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project with Google OAuth configured
- An [Anthropic](https://anthropic.com) API key

### Installation

```bash
git clone https://github.com/dennyz114/mealwise.git
cd mealwise
npm install
```

### Environment Variables

Create a `.env.local` file in the root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key
```

> ⚠️ Never use the Supabase `service_role` key on the frontend.

### Run in development

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

---

## Project Structure

```
mealwise/
├── src/
│   ├── components/      # UI components
│   │   └── ui/          # shadcn/ui base primitives
│   ├── lib/             # Supabase queries and API calls
│   │   ├── supabase.ts
│   │   ├── queryKeys.ts
│   │   ├── meals.ts
│   │   ├── menus.ts
│   │   ├── shopping.ts
│   │   └── ingredients.ts
│   ├── routes/          # TanStack Router file-based routes
│   ├── hooks/           # Custom React hooks
│   ├── types/           # Shared TypeScript types
│   └── utils/           # Pure utility functions
├── docs/
│   ├── FEATURES.md      # Full feature descriptions
│   ├── DATABASE.md      # Database schema and RLS notes
│   └── CODING_GUIDELINES.md
├── features/            # Requirements per feature (MW-XXX)
├── plans/               # Architecture plans per feature
├── review/              # Code review reports per feature
├── AGENTS.md            # AI agent instructions for opencode
└── opencode.json        # opencode configuration and agents
```

---

## AI-Assisted Development

This project uses [opencode](https://opencode.ai) for AI-assisted development with a set of custom agents:

| Agent | Role |
|---|---|
| `ProductManager` | Discusses and documents feature requirements |
| `UXDesigner` | Analyzes mockups and identifies UI gaps |
| `Architect` | Designs technical solutions and writes implementation plans |
| `FrontendDeveloper` | Implements frontend code and tests |
| `BackendDeveloper` | Implements Supabase logic and migrations |
| `Reviewer` | Reviews code for bugs, quality, and requirement coverage |

To invoke an agent:
```bash
/agent ProductManager
```

---

## Documentation

- [Features](docs/FEATURES.md)
- [Database Schema](docs/DATABASE.md)
- [Coding Guidelines](docs/CODING_GUIDELINES.md)