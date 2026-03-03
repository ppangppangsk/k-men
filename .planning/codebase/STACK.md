# Technology Stack

**Analysis Date:** 2026-03-04

## Languages

**Primary:**
- TypeScript 5.8.2 - All application code (`package.json`, `tsconfig.json`)

**Secondary:**
- JSX/TSX - React component markup (`src/App.tsx`)
- CSS - Tailwind utility classes (`src/index.css`)

## Runtime

**Environment:**
- Node.js (ES modules enabled via `"type": "module"` in `package.json`)
- No specific Node version pinning (no `.nvmrc` or `engines` field)

**Package Manager:**
- npm (implied from package.json structure)
- No lockfile found (dependencies not installed)

## Frameworks

**Core:**
- React 19.0.0 - UI framework (`src/App.tsx`, `src/main.tsx`)
- React DOM 19.0.0 - DOM rendering (`src/main.tsx`)

**Styling:**
- Tailwind CSS 4.1.14 - Utility-first CSS (`src/index.css`, `vite.config.ts`)
- Autoprefixer 10.4.21 - CSS vendor prefixes (`package.json`)

**Animation:**
- Motion (Framer Motion) 12.23.24 - Scroll animations (`src/App.tsx`)

**Icons:**
- Lucide React 0.546.0 - SVG icons (`src/App.tsx`)

**Testing:**
- Not configured

**Build/Dev:**
- Vite 6.2.0 - Build tool and dev server (`vite.config.ts`)
- @vitejs/plugin-react 5.0.4 - React Fast Refresh (`vite.config.ts`)
- @tailwindcss/vite 4.1.14 - Tailwind CSS integration (`vite.config.ts`)
- TypeScript 5.8.2 - Type checking (`tsconfig.json`)

## Key Dependencies

**Critical:**
- react 19.0.0 - UI rendering (`src/App.tsx`)
- motion 12.23.24 - Page animations (`src/App.tsx`)
- lucide-react 0.546.0 - Icon library (`src/App.tsx`)

**Unused (installed but not imported):**
- express 4.21.2 - Backend framework (not used in current app)
- better-sqlite3 12.4.1 - SQLite database driver (not used)
- @google/genai 1.29.0 - Gemini AI API client (not used)
- dotenv 17.2.3 - Environment variable loading (not used)
- tsx 4.21.0 - TypeScript executor (not used)

## Configuration

**Environment:**
- `.env.example` defines: `GEMINI_API_KEY`, `APP_URL`
- Environment variables loaded via Vite's `loadEnv()` in `vite.config.ts`
- No `.env.local` checked in (gitignored)

**Build:**
- `vite.config.ts` - Vite build config with React plugin, Tailwind, path aliases
- `tsconfig.json` - Target ES2022, Module ESNext, JSX react-jsx

## Platform Requirements

**Development:**
- Any platform with Node.js
- No external dependencies (Docker, databases, etc.)

**Production:**
- Static HTML + JS bundle (output to `dist/`)
- AI Studio deployment referenced in `README.md` and `metadata.json`
- Cloud Run service URL support via `APP_URL` env var

---

*Stack analysis: 2026-03-04*
*Update after major dependency changes*
