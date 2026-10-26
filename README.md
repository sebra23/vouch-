# Town-clone (working name: "Ari")

Functionally equivalent clone of town.com's assistant product, built from observed
behavior (user-provided account screenshots). Original code, design, and assets.

## Run
1. cp .env.example .env  (fill in OAuth + DB + AI keys)
2. npm install && npx prisma db push
3. npm run dev

## Stack
Next.js 14 (App Router) · Auth.js (Google + Microsoft Entra ID) · Postgres/Prisma ·
OpenAI-compatible LLM · Google/Microsoft Graph APIs · Resend email · Vercel cron.

## Legal
No Town assets, brand, copy, or private endpoints are used. Functionality-level
competitive re-implementation only.

## Demo mode (no OAuth needed)
1. Set NEXTAUTH_SECRET and NEXT_PUBLIC_DEMO=1 in .env
2. Open /login → "Explore the demo" (demo user is created on first visit)

## Deploy (Monday checklist)
- [ ] Google OAuth client (calendar+gmail scopes), Microsoft Entra app (Mail.Read/Calendars.Read)
- [ ] Supabase Postgres → DATABASE_URL; npx prisma db push
- [ ] AI_API_KEY (OpenAI-compatible)
- [ ] RESEND_API_KEY (assistant outbound email)
- [ ] CRON_SECRET env; vercel.json crons active
- [ ] NEXT_PUBLIC_DEMO=0 for production
