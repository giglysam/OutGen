# AGENTS.md

## Cursor Cloud specific instructions

OutGen is a single Vite + React 19 + TypeScript SPA (package manager: **npm**, see `package-lock.json`). There is no separate backend process — `/api/*` is served two different ways depending on environment.

### Services / how to run
- **Dev server:** `npm run dev` (Vite, port **5173**). This serves the whole product UI plus a small dev API middleware (`server/devApiPlugin.ts`).
- Standard scripts live in `package.json`: `npm run lint`, `npm run build` (`tsc -b && vite build`), `npm run preview`, `npm run db:migrate`.

### Non-obvious caveats
- **No `.env` is required for the core flow.** The frontend has hardcoded fallback Supabase URL + anon key in `src/lib/supabase.ts`, so auth/designs/profiles work against the hosted Supabase project out of the box.
- **The Vite dev middleware only implements two routes:** `POST /api/generate-image` and `POST /api/chat`. Both proxy to external hosted services (Simple Generator, chat-z), so **AI image generation and chat require outbound internet access**.
- **All other `/api/*` routes (admin, `notify-*`, signup, `setup-db`) are NOT served by `npm run dev`.** They only exist in the Vercel serverless function `api/index.js`. To exercise them locally you must run under the Vercel runtime (`vercel dev`) and provide the server-only env vars from `.env.example` (`RESEND_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_SECRET`, `SUPABASE_DB_PASSWORD`, etc.).
- **DB migrations** (`npm run db:migrate` / `supabase/`) target the hosted Supabase project and need `SUPABASE_DB_PASSWORD`; the hosted schema is already provisioned, so this is rarely needed.
- `npm run build` prints a >500 kB chunk-size warning — this is expected, not an error.
