# Local Newspaper

A local newspaper site: readers browse published issues and articles; editors manage them at `/editor` (protected by `EDITOR_PASSWORD`).

## Stack
- React Router 7 (SSR, `react-router.config.ts`), React 19, Vite, CSS modules
- Supabase (database + storage) via `@supabase/supabase-js` — client in `app/lib/supabase.ts`
- Tiptap rich-text editor, Radix UI
- Deployed on Netlify (`netlify.toml`, builds `build/client`)
- Originally generated with Dazl — conventions in `dazl-prompts/` (code patterns, project structure)

## Layout
- `app/routes/` — pages (`home.tsx`, `editor.tsx`) and `api/` server routes (create/delete/publish issues, save article, upload images, track clicks)
- `app/blocks/` — page sections; `app/components/` — shared UI
- `supabase/` — Supabase CLI config and SQL migrations (source of truth for the schema)

## Supabase rules
- `supabase` (anon key) is safe for the browser. `createAdminClient()` uses the service-role key and bypasses RLS: use it only inside server loaders/actions and `app/routes/api/*`, never in client code.
- Schema changes go in a new migration: `npx supabase migration new <name>`, then edit the SQL file. Apply to the live project with `npx supabase db push` only after the user approves.
- Never commit `.env` or print secrets from it.
- Generated DB types live in `app/lib/database.types.ts`; refresh with `npm run db:types` after schema changes. Keep the `Issue` / `Article` types in `app/lib/supabase.ts` in sync.
- No Docker on this machine: `supabase db pull` / `db diff` / local DB don't work. Read the live schema through the read-only Supabase MCP instead.

## Commands
- `npm run dev` — dev server
- `npm run typecheck` — type check (run before committing)
- `npm run build` — production build

## Git
- Work on `develop`; open PRs from `develop` into `main`. Merging to `main` deploys via Netlify.
