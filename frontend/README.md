# Recipe Companion Frontend

Next.js (App Router) client for the Recipe Companion challenge. The canonical **submission guide**, one-command startup, environment matrix, architecture overview, and checklist live in the **[repository root README](../README.md)**.

## Requirements

- Node.js **20.19+**
- npm
- Backend reachable at the URL in `.env.local` (default `http://localhost:8000`)

## Setup

```bash
npm install
cp .env.example .env.local   # optional
npm run dev
```

Open http://localhost:3000. From the monorepo root you can use **`./scripts/dev.sh`** to bring up Docker backend (if `.env` is present) and this dev server.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Next.js development server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run format` | Prettier write |
| `npm run format:check` | Prettier check |

## Environment

`NEXT_PUBLIC_API_BASE_URL` — absolute API base (no trailing slash required). Read in `config/env.ts`. The Next route `app/api/copilotkit/route.ts` proxies the CopilotKit runtime to `{apiBaseUrl}/copilotkit`.

## Source layout (high level)

```text
app/
  globals.css       # Design tokens, Tailwind v4, typography utilities
  layout.tsx        # Fonts, metadata, Providers
  page.tsx          # RecipeHome entry
  providers.tsx     # React Query, MotionConfig, CopilotKit
  api/copilotkit/   # CopilotKit → HttpAgent → backend AG-UI
components/
  layout/           # App shell
  features/         # upload/*, recipe/* (tablet workspace)
  feedback/         # Connection / session messaging
  ui/               # Primitives: button, surface, panel, typography, motion
config/
  copilot.ts        # Agent name (matches backend)
  env.ts
hooks/
  use-recipe-coagent.ts   # useCoAgent + session hydrate/persist (debounced)
  use-recipe-upload.ts
  use-voice-transcription.ts
lib/
  api/client.ts, recipe-session.ts, recipe-context.ts, …
types/
  recipe.ts, api.ts
```

## Principles

- **UI follows `RecipeContext`**, not assistant markdown — agent tools own servings, ingredients, and step index.
- **Tablet-first**: touch targets, landscape-oriented grids, calm motion (`components/ui/motion.ts` + CSS variables).
- **`Panel` / `Surface`** — Raised vs flat surfaces share radii and elevation tokens to avoid ad-hoc Tailwind clutter.
- **Code splitting** — `recipe-experience` loads dynamically after a recipe exists (`recipe-home.tsx`) to keep the upload path light.

## Further reading

- [Backend API & state shape](../backend/README.md)
- [Root README: architecture diagram, tradeoffs, demo tips](../README.md)
