# Codebase Concerns

**Analysis Date:** 2026-03-04

## Tech Debt

**Unused dependencies in package.json:**
- Issue: 5+ packages installed but not imported in any source file
- Files: `package.json` (express, better-sqlite3, @google/genai, dotenv, tsx, @types/express)
- Why: Likely from a template or planned features not yet implemented
- Impact: Unnecessary install size, potential security surface area
- Fix approach: Remove unused packages from `package.json`

**Monolithic component:**
- Issue: Entire application (297 lines) in single `src/App.tsx` file
- Files: `src/App.tsx`
- Why: Simple initial implementation for a small informational site
- Impact: Maintainability degrades as features are added; no component reuse
- Fix approach: Extract sections into components: Header, Hero, VisionSection, MembersSection, ContactSection, Footer

**Hardcoded content data:**
- Issue: Member organizations array and all text content hardcoded in component
- Files: `src/App.tsx` (lines 17-31 for members array)
- Why: Static content site, no CMS or data layer needed initially
- Impact: Content changes require code changes and redeployment
- Fix approach: Extract to `src/data/members.ts` and `src/data/content.ts`

## Known Bugs

**Unused import:**
- Symptoms: `ArrowRight` imported but never used
- Files: `src/App.tsx` (line 3)
- Workaround: None needed (no runtime impact)
- Root cause: Leftover from earlier iteration
- Fix: Remove `ArrowRight` from import statement

## Security Considerations

**No significant security risks detected.**
- No user input handling
- No API calls with credentials
- No authentication system
- Contact email is intentionally public

**Minor: Environment variable exposure in build config:**
- Risk: `GEMINI_API_KEY` loaded via `loadEnv()` in `vite.config.ts` and passed to `define`
- Files: `vite.config.ts`
- Current mitigation: Key not actively used in source code
- Recommendations: If Gemini AI is integrated, ensure API key is only used server-side, not bundled into client

## Performance Bottlenecks

**No significant performance concerns detected.**
- Static content with no API calls
- Small bundle size with minimal dependencies
- Motion animations use `viewport={{ once: true }}` to avoid re-triggering

## Fragile Areas

**No particularly fragile areas detected.**
- Application is simple enough that most changes are low-risk

## Scaling Limits

**Single-file architecture:**
- Current capacity: Works well for current ~300-line component
- Limit: Beyond ~500-700 lines, `App.tsx` becomes unmaintainable
- Symptoms at limit: Difficulty finding code, merge conflicts, slow comprehension
- Scaling path: Component decomposition into `src/components/` and `src/sections/`

## Dependencies at Risk

**No critical dependency risks detected.**
- All major dependencies (React, Vite, Tailwind, Motion) are actively maintained
- React 19 is latest major version

## Missing Critical Features

**No testing infrastructure:**
- Problem: No test framework, no test files, no coverage
- Current workaround: Manual testing, TypeScript type checking only
- Blocks: Cannot verify regressions when making changes
- Implementation complexity: Low (add Vitest + React Testing Library)

## Test Coverage Gaps

**Entire application untested:**
- What's not tested: All UI rendering, navigation, scroll behavior, responsive layout
- Risk: Any change could introduce visual or functional regressions
- Priority: Medium (low complexity app, but important as features are added)
- Difficulty to test: Low (standard React Testing Library patterns)

## Accessibility Gaps

**Missing ARIA attributes:**
- Files: `src/App.tsx`
- Issues: Mobile menu toggle lacks `aria-label`, menu lacks `aria-hidden`, no skip-to-content link
- Priority: Medium
- Fix approach: Add proper ARIA attributes to interactive elements

---

*Concerns audit: 2026-03-04*
*Update as issues are fixed or new ones discovered*
