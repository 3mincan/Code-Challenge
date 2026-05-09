# Recipe Companion Frontend

Frontend for the Recipe Companion coding challenge. The app uses Next.js App
Router and talks to the completed FastAPI backend in `../backend`.

## Setup

Requirements:

- Node.js 20.19 or newer
- npm
- Backend running on `http://localhost:8000`

Install dependencies:

```bash
npm install
```

Create local environment:

```bash
cp .env.example .env.local
```

Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Scripts

```bash
npm run dev           # start Next.js locally
npm run build         # production build
npm run start         # serve a production build
npm run lint          # ESLint
npm run typecheck     # TypeScript without emitting files
npm run format        # Prettier write
npm run format:check  # Prettier check
```

## Environment

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

The value must be an absolute URL. It is read by `config/env.ts` and defaults to
`http://localhost:8000` for local development.

## Architecture

The structure is intentionally small and flat while the product is still early:

```text
app/
  globals.css          # Tailwind v4 entrypoint and design tokens
  layout.tsx           # root layout, fonts, metadata, providers
  page.tsx             # current foundation specimen
  providers.tsx        # client providers such as React Query
components/
  layout/              # app-level layout shell primitives
  ui/                  # reusable design-system primitives
config/
  env.ts               # typed environment access
lib/
  api/                 # API client utilities
  query/               # React Query client setup
  utils.ts             # shared className helper
types/
  api.ts               # shared API utility types
```

Key decisions:

- App Router stays at the top level to match Next.js conventions.
- `components/ui` holds reusable primitives from the design system.
- `components/layout` holds shell components that compose pages without carrying
  domain behaviour.
- `config/env.ts` centralises environment reads and validation.
- `lib/api/client.ts` provides a small typed fetch wrapper without baking in
  recipe-specific business logic.
- `lib/query/client.ts` keeps React Query defaults in one place.
- Absolute imports use `@/*` with `baseUrl` configured in `tsconfig.json`.

## Created Foundation Files

- `.env.example`
- `.prettierignore`
- `.prettierrc.json`
- `app/providers.tsx`
- `components/layout/app-shell.tsx`
- `config/env.ts`
- `lib/api/client.ts`
- `lib/query/client.ts`
- `types/api.ts`

Existing files also configure TypeScript, TailwindCSS, shadcn/ui, Framer Motion
utilities, typography, theme tokens, and the tablet-first layout specimen.
