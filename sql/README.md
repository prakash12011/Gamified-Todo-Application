# SQL Migrations

These files recreate the full Supabase database schema from scratch.

## Quick setup (new project)

Paste `00_full_setup.sql` into the **Supabase SQL Editor** and run it.  
That's it — all tables, RLS policies, functions, triggers, storage bucket, and seed data are created in one shot.

## Incremental files (run in order)

| File | What it creates |
|------|----------------|
| `01_tables.sql` | All tables + indexes |
| `02_rls.sql` | Row Level Security policies |
| `03_functions.sql` | RPC functions (`increment_xp`, `increment_coins`, `update_streak`) + triggers (auto-create profile on signup, auto-update `updated_at`) |
| `04_storage.sql` | `avatars` storage bucket + access policies |
| `05_seed_badges.sql` | Initial `badge_definitions` catalog (24 badges) |

## After running the SQL

1. Go to **Dashboard → Storage** and confirm the `avatars` bucket was created.  
   If it wasn't (some tiers block bucket creation via SQL), create it manually:  
   *New bucket → name: `avatars` → Public: OFF → File size limit: 5 MB*

2. Go to **Settings → API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

3. Paste those values into `.env.local`.

## Tables overview

| Table | Purpose |
|-------|---------|
| `profiles` | One row per user — level, XP, coins, streak |
| `todos` | Tasks with difficulty, rewards, due dates |
| `achievements` | Earned badges (keyed by `type` slug per user) |
| `badge_definitions` | Badge catalog (global, not per-user) |
| `user_achievements` | Join table — user × badge_definition |
| `vision_plans` | Long-term goals (1 / 3 / 5 / 10 year) |

## RPC functions (called by the app)

| Function | Description |
|----------|-------------|
| `increment_xp(user_id, amount)` | Adds XP and recalculates level |
| `increment_coins(user_id, amount)` | Adds coins |
| `update_streak(user_id)` | Increments or resets daily streak |
