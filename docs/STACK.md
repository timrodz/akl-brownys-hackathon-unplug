# Stack (boilerplate)

- **Next.js 16** App Router, deploy on Vercel
- **Postgres** on Neon via `@neondatabase/serverless` + **Drizzle** (`lib/db/`)
- **AI SDK 7** (`ai`) + **Gemini** (`@ai-sdk/google`) — `lib/ai.ts`, `lib/ai/generate.ts`
- **Zod 4** — demo schema is inline in `lib/ai/generate.ts` (add your own as you build)

## Local

```bash
cp .env.example .env.local
pnpm install
pnpm db:push   # when DATABASE_URL is set
pnpm db:seed   # demo catalogue: 5 items, 3 businesses
pnpm dev
```

## Vercel

Neon integration → `DATABASE_URL`. Set `GEMINI_API_KEY`. Gemini uses AI SDK only (no raw REST client).
