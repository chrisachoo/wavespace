# Wavespace

Real-time interactive quiz platform. Players join with a code; the host runs the quiz and advances questions. Built with Next.js, Supabase (including Realtime), and Tailwind.

## Run locally

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Admin (host)

The admin site is at **`/admin-wavespace`**. Access is gated by a secret query parameter.

- **URL pattern:**  
  `http://localhost:3000/admin-wavespace?secret=YOUR_SECRET`
- Set `NEXT_ADMIN_SECRET` in `.env` to your chosen secret. Use that value in the URL (e.g. `?secret=your-secret-here`). Do not commit the real secret.

## Environment variables

Copy `.env.example` to `.env` and fill in:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `NEXT_ADMIN_SECRET` | Secret for `/admin-wavespace?secret=...` |
| `POSTGRES_URL_NON_POOLING` | Postgres connection string (optional; for seed script) |

## Seed the database

With `POSTGRES_URL_NON_POOLING` set in `.env`:

```bash
bun run db:seed
```

Runs `scripts/002_seed_stack_quiz.sql` by default. To run another file:

```bash
bun run db:seed scripts/002_seed_stack_quiz.sql
```

## Tech

- **Package manager / runtime:** Bun  
- **Framework:** Next.js (App Router)  
- **UI:** Tailwind CSS, Shadcn/UI  
- **Backend / realtime:** Supabase + Supabase Realtime (Postgres changes on `quizzes`)
