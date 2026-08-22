# Upwork Portfolio Library

Private case-study library with admin-curated client share links. The public site is **share-link only** — the full archive stays behind `/admin`.

## Local setup

```bash
cp .env.example .env.local
```

Fill in your [Supabase](https://supabase.com) project:

1. **Database** → Settings → Database → Connect. Paste the **transaction pooler** URI into `DATABASE_URL` (port `6543`). Optionally set `DIRECT_DATABASE_URL` to the session/direct URI (port `5432`) for migrations.
2. **API** → copy Project URL into `NEXT_PUBLIC_SUPABASE_URL` and the **service role** key into `SUPABASE_SERVICE_ROLE_KEY` (server-only; never expose it in the browser).
3. Storage: leave `SUPABASE_STORAGE_BUCKET` unset to use `project-media`. Seed/upload will create a **public** bucket if it is missing. You can also create it in Storage yourself (Public).

Then:

```bash
npm install
npm run db:seed
npm run dev
```

Open [http://localhost:3000/admin/login](http://localhost:3000/admin/login). Default local password is `changeme` (set `ADMIN_PASSWORD` and `SESSION_SECRET` in `.env.local`).

Without `OPENAI_API_KEY`, job matching falls back to keyword overlap. Screenshots upload to Supabase Storage.

## Vercel deploy

1. Create a Supabase project and run `npm run db:seed` once from your machine (creates tables, taxonomy, sample work, and the storage bucket).
2. On Vercel, set `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, `SESSION_SECRET`, `OPENAI_API_KEY`, and optionally `PORTFOLIO_NAME` / `PORTFOLIO_TITLE` / `PORTFOLIO_TAGLINE`.
3. Deploy.

Local `local.db` / Turso / Vercel Blob are no longer used.

## Workflow

1. Add engagements under **Projects** (the ask, what you walked into, how you worked it, what they run now — plus gallery).
2. Paste an Upwork job on **AI Match**, review the ranked set, generate a link.
3. Or select projects manually and generate a link from the project library.
4. Client opens `/p/{token}` — only the selected work on that link is visible.
