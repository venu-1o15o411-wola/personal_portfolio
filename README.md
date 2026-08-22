# Upwork Portfolio Library

Private case-study library with admin-curated client share links. The public site is **share-link only** — the full archive stays behind `/admin`.

## Local setup

```bash
cp .env.example .env.local
npm install
npm run db:seed
npm run dev
```

Then open [http://localhost:3000/admin/login](http://localhost:3000/admin/login). Default local password is `changeme` (set `ADMIN_PASSWORD` and `SESSION_SECRET` in `.env.local`).

Without `BLOB_READ_WRITE_TOKEN`, screenshots save to `public/uploads`. Without `OPENAI_API_KEY`, job matching falls back to keyword overlap.

## Vercel deploy

Vercel cannot persist a SQLite file. Use **Turso** (hosted SQLite, free tier):

1. Create a database at [turso.tech](https://turso.tech) or via the Vercel Turso marketplace.
2. Set `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`.
3. From your machine, point `.env.local` at Turso and run `npm run db:seed` (creates tables + the 10-category tree).
4. Create a Vercel Blob store (Hobby includes 1 GB). `BLOB_READ_WRITE_TOKEN` is injected automatically.
5. Set `ADMIN_PASSWORD`, `SESSION_SECRET`, `OPENAI_API_KEY`, and optionally `PORTFOLIO_NAME` / `PORTFOLIO_TITLE` / `PORTFOLIO_TAGLINE`.
6. Deploy.

## Workflow

1. Add engagements under **Projects** (the ask, what you walked into, how you worked it, what they run now — plus gallery).
2. Paste an Upwork job on **AI Match**, review the ranked set, generate a link.
3. Or select projects manually and generate a link from the project library.
4. Client opens `/p/{token}` — only the selected published work is visible.
