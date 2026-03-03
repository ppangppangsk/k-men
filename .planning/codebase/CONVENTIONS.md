# Coding Conventions

**Analysis Date:** 2026-03-04

## Naming Patterns

**Files:**
- PascalCase for React components: `App.tsx`
- lowercase for entry/utility files: `main.tsx`, `index.css`
- kebab-case for config files: `vite.config.ts`

**Functions:**
- camelCase for all functions: `handleScroll` (`src/App.tsx`)
- React setState convention: `setIsScrolled`, `setMobileMenuOpen` (`src/App.tsx`)

**Variables:**
- camelCase for variables: `isScrolled`, `mobileMenuOpen`, `members` (`src/App.tsx`)
- Boolean state prefixed with `is`: `isScrolled` (`src/App.tsx`)
- Arrays use plural names: `members` (`src/App.tsx`)

**Types:**
- No custom types or interfaces defined yet
- TypeScript configured with `react-jsx` in `tsconfig.json`

## Code Style

**Formatting:**
- No Prettier configured (no `.prettierrc` found)
- 2-space indentation (inferred from source files)
- Single quotes for imports and strings
- Semicolons required (consistently used)
- Long Tailwind className strings on single lines

**Linting:**
- TypeScript type checking only: `"lint": "tsc --noEmit"` (`package.json`)
- No ESLint configured (no `.eslintrc` found)
- No pre-commit hooks

## Import Organization

**Order (observed in `src/App.tsx`):**
1. React hooks: `import { useState, useEffect } from 'react';`
2. External libraries: `import { motion } from 'motion/react';`
3. Icon imports: `import { Mail, MessageCircle, ... } from 'lucide-react';`

**Grouping:**
- No blank lines between import groups (all imports consecutive)
- Named imports used exclusively (no default imports from libraries)

**Path Aliases:**
- `@/*` maps to project root (`tsconfig.json`, `vite.config.ts`)
- Not actively used in current code (all imports are from packages)

## Error Handling

**Patterns:**
- No explicit error handling patterns established
- Non-null assertion used for DOM element: `document.getElementById('root')!` (`src/main.tsx`)
- No try/catch blocks in current code

**Error Types:**
- Not applicable (no error scenarios in current static content)

## Logging

**Framework:**
- None configured
- No console.log statements in source code

## Comments

**When to Comment:**
- JSX section comments for page structure organization
- Examples from `src/App.tsx`:
  - `{/* Navigation */}`
  - `{/* Mobile Menu */}`
  - `{/* Hero Section */}`
  - `{/* Vision, Mission, Values Section */}`
  - `{/* Members Section */}`
  - `{/* Contact Section */}`
  - `{/* Footer */}`

**Configuration Comments:**
- Descriptive comments in `vite.config.ts` explaining HMR and AI Studio behavior
- Documentation comments in `.env.example` explaining each variable

**TODO Comments:**
- None found in codebase

## Function Design

**Size:**
- Single monolithic component: `App()` at 297 lines (`src/App.tsx`)
- No helper functions extracted

**Parameters:**
- No custom functions with parameters (only React hooks and event handlers)

**Return Values:**
- Component returns JSX directly

## Module Design

**Exports:**
- Default export for React component: `export default function App()` (`src/App.tsx`)
- No named exports

**Barrel Files:**
- Not used (single-component application)

---

*Convention analysis: 2026-03-04*
*Update when patterns change*
