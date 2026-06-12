# Supabase setup

## Run this ONE file (required)

1. Open [Supabase SQL Editor](https://supabase.com/dashboard/project/gdmucpihztlberwaqtwk/sql/new)
2. Paste **all** of `COMPLETE_SCHEMA.sql` and click **Run**

This file includes every table, column, function, and policy from all migrations combined. Safe to re-run if something was missing.

Do **not** run old 001–004 files separately unless you know you need a partial patch.

## Vercel environment variables

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | `https://gdmucpihztlberwaqtwk.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Public anon key |
| `RESEND_API_KEY` | Email (server) |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin/signup checks (server only) |
| `ADMIN_SECRET` | `/admin` page password |

## Cross-device

Sign in with the **same email** on phone and computer. Outfits save to the `designs` table in Supabase and sync automatically.
