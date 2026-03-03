# External Integrations

**Analysis Date:** 2026-03-04

## APIs & External Services

**AI/ML Services:**
- Google Generative AI (@google/genai 1.29.0) - Dependency installed but not used in current code
  - SDK/Client: `@google/genai` npm package
  - Auth: `GEMINI_API_KEY` env var (`.env.example`)
  - Status: Configured in `vite.config.ts` but no active usage in source code

**Payment Processing:**
- Not detected

**Email/SMS:**
- Not detected (email contact is a simple mailto link)

**External APIs:**
- Not detected

## Data Storage

**Databases:**
- better-sqlite3 12.4.1 - Installed but not used in current code (`package.json`)
- No database schema, migrations, or connection code found

**File Storage:**
- Not detected

**Caching:**
- Not detected

## Authentication & Identity

**Auth Provider:**
- Not detected - No authentication system implemented

**OAuth Integrations:**
- Not detected

## Monitoring & Observability

**Error Tracking:**
- Not detected

**Analytics:**
- Not detected

**Logs:**
- Not detected (no logging framework)

## CI/CD & Deployment

**Hosting:**
- AI Studio - Referenced in `README.md` and `metadata.json`
  - Deployment: Via AI Studio platform
  - Environment vars: `APP_URL` auto-injected by Cloud Run

**CI Pipeline:**
- Not detected (no GitHub Actions, no CI configuration)

## Environment Configuration

**Development:**
- Required env vars: `GEMINI_API_KEY` (defined in `.env.example`, currently unused)
- Secrets location: `.env.local` (gitignored)
- Dev server: `npm run dev` on port 3000

**Production:**
- Secrets management: Via AI Studio / Cloud Run environment
- Static build output: `dist/`

## Webhooks & Callbacks

**Incoming:**
- Not detected

**Outgoing:**
- Not detected

## External Links (Content, not API)

- MenEngage Alliance website: `https://menengage.org/` (`src/App.tsx`)
- Kakao Open Chat: `https://open.kakao.com/o/g6G41tmh` (`src/App.tsx`)
- Pretendard font CDN: `https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/` (`index.html`)
- Contact email: `koreamenengagenetwork@gmail.com` (`src/App.tsx`)

---

*Integration audit: 2026-03-04*
*Update when adding/removing external services*
