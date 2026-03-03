# Architecture

**Analysis Date:** 2026-03-04

## Pattern Overview

**Overall:** Single-Page Application (SPA) - Static Informational Website

**Key Characteristics:**
- Monolithic single-component React application
- No backend API integration (purely client-side)
- Static content with scroll-based animations
- Anchor-based navigation (no client-side router)

## Layers

**Presentation Layer:**
- Purpose: Render all UI sections as a single scrollable page
- Contains: React component with JSX markup, animations, event handlers
- Location: `src/App.tsx`
- Depends on: React, Motion, Lucide icons
- Used by: Entry point (`src/main.tsx`)

**Styling Layer:**
- Purpose: Global styles and Tailwind CSS configuration
- Contains: Tailwind imports, custom font theme (Pretendard), font smoothing
- Location: `src/index.css`
- Depends on: Tailwind CSS
- Used by: Entry point (`src/main.tsx`)

**Entry Point Layer:**
- Purpose: React DOM initialization with StrictMode
- Contains: Root element mounting, imports
- Location: `src/main.tsx`
- Depends on: Presentation layer, Styling layer
- Used by: `index.html` (script tag)

**Build & Configuration Layer:**
- Purpose: Build tooling, TypeScript, environment handling
- Contains: Vite config, TypeScript config, path aliases
- Location: `vite.config.ts`, `tsconfig.json`
- Depends on: Vite, TypeScript, Tailwind plugins

## Data Flow

**Page Render:**

1. Browser loads `index.html`
2. Vite serves `src/main.tsx` as entry script
3. React mounts `App` component to `#root` element
4. Static content renders with hardcoded data (members array)
5. Motion animations trigger on viewport intersection

**User Interaction:**

1. Scroll event → `handleScroll` listener → `isScrolled` state → navbar style change
2. Mobile menu button click → `mobileMenuOpen` state toggle → overlay render
3. Navigation link click → smooth scroll to anchor section
4. Mobile menu link click → close menu + scroll to section

**State Management:**
- Local React state only (`useState`)
- `isScrolled`: boolean - navbar background visibility
- `mobileMenuOpen`: boolean - mobile menu overlay toggle
- No global state management library

## Key Abstractions

**Single Component:**
- Purpose: Entire application UI in one functional component
- Location: `src/App.tsx` (297 lines)
- Pattern: Monolithic component with inline data and markup
- No sub-components extracted

**Hardcoded Data:**
- Purpose: Member organizations list
- Location: `src/App.tsx` (lines 17-31, `members` array with 13 items)
- Pattern: Inline constant array, not fetched from API

**Animation Pattern:**
- Purpose: Scroll-triggered entrance animations
- Pattern: `<motion.div initial={} whileInView={} viewport={{ once: true }}>`
- Applied to: Vision/Mission/Values cards, Member tags, Hero section

## Entry Points

**HTML Entry:**
- Location: `index.html`
- Triggers: Browser page load
- Responsibilities: Load Pretendard font, define `#root` div, load Vite script

**React Entry:**
- Location: `src/main.tsx`
- Triggers: Script loaded by index.html
- Responsibilities: Mount React app to DOM, wrap in StrictMode

**Application Entry:**
- Location: `src/App.tsx`
- Triggers: React render
- Responsibilities: Render entire page, manage UI state, handle scroll events

## Error Handling

**Strategy:** No explicit error handling implemented

**Patterns:**
- Non-null assertion on root element: `document.getElementById('root')!` (`src/main.tsx`)
- No try/catch blocks in event handlers
- No error boundaries for React components

## Cross-Cutting Concerns

**Logging:**
- Not implemented (no logging framework)

**Validation:**
- Not applicable (no user input forms, no API calls)

**Authentication:**
- Not implemented

**Responsive Design:**
- Tailwind breakpoints: `md:` prefix for tablet/desktop
- Mobile-first approach with hamburger menu overlay
- Grid layouts: `grid-cols-1 md:grid-cols-3`

**Color System:**
- Teal (#00B050) - Primary brand color
- Yellow (#FFD966) - Mission card accent
- Orange (#F4B183) - Values card accent
- Stone palette - Neutral backgrounds and text

---

*Architecture analysis: 2026-03-04*
*Update when major patterns change*
