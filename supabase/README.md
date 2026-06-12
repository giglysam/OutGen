# Supabase setup

1. Open [Supabase SQL Editor](https://supabase.com/dashboard/project/gdmucpihztlberwaqtwk/sql/new).
2. Paste and run migrations in order: `001`, `002`, `003`, `004_credit_pricing_tiers.sql`.
3. In Vercel (or `.env` locally), set:
   - `VITE_SUPABASE_URL=https://gdmucpihztlberwaqtwk.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` — your anon/public key from Project Settings → API.

Optional one-time bootstrap via API (after setting `SUPABASE_DB_PASSWORD` and `SETUP_SECRET` in Vercel):

```bash
curl -X POST https://your-app.vercel.app/api/setup-db \
  -H "x-setup-secret: YOUR_SETUP_SECRET"
```

Never commit the service role key or database password.

## Vercel environment variables

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Public anon key |
| `RESEND_API_KEY` | Resend API key (`re_xxxxxxxxx`) |
| `RESEND_FROM` | Sender address (e.g. `onboarding@resend.dev`) |
| `OWNER_EMAIL` | Where print/payment alerts go |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin API only (server) |
| `ADMIN_SECRET` | Password for `/admin` page |
