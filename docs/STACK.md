# Stack (boilerplate)

- **Next.js 16** App Router, deploy on Vercel
- **Postgres** via `postgres` + **Drizzle** (`lib/db/`); local DB in `docker-compose.yml`
- **AI SDK 7** (`ai`) + **Gemini** (`@ai-sdk/google`) — `lib/ai.ts`, `lib/ai/generate.ts`
- **Zod 4** — demo schema is inline in `lib/ai/generate.ts` (add your own as you build)

## Local

```bash
cp .env.example .env.local
bun install
bun db:up      # first time: Docker Postgres on localhost:5432
bun db:setup   # push schema + seed demo catalogue (fast when DB is already up)
bun dev
```

## Vercel

Set `DATABASE_URL` to your hosted Postgres (e.g. Neon connection string). Set `GEMINI_API_KEY`. Gemini uses AI SDK only (no raw REST client).
