# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev                  # Start dev server at localhost:3000
npm run dev:turbopack        # Start with Turbopack (faster HMR)

# Type checking & linting
npm run type-check           # TypeScript strict check (no emit)
npm run lint                 # ESLint check
npm run lint:fix             # ESLint auto-fix

# Production
npm run build                # Next.js production build
npm run start                # Serve production build locally
npm run build:analyze        # Bundle analyzer (ANALYZE=true)

# Deployment
npm run deploy:vercel        # Deploy to production
npm run deploy:preview       # Deploy preview to Vercel
```

No test runner is configured. Use `npm run type-check && npm run lint` to validate changes.

## Environment Variables

Create `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_FRONTEND_URL=...   # Production URL; omit for local dev
```

## Architecture Overview

**Next.js 15 App Router** with TypeScript, Supabase (PostgreSQL + Auth), Tailwind CSS v4, and shadcn/ui components.

### Auth Pattern (two-layer)

1. **Middleware** (`middleware.ts` at root) — server-side route protection using `@supabase/ssr`. Redirects unauthenticated users away from `/dashboard/**`, redirects authenticated users away from `/login` and `/signup`, and redirects `/` to `/dashboard` or `/login`.

2. **Client-side guard** — `src/app/dashboard/layout.tsx` (a Client Component) checks auth via `useAuth()` and redirects with `router.push('/login')` as a secondary guard.

The `AuthProvider` context (`src/components/auth/auth-provider.tsx`) wraps the app in `src/app/layout.tsx` and provides `{ user, session, loading, signOut }` to client components via the `useAuth()` hook.

### Supabase Client Split

There are **two separate Supabase client patterns** — do not mix them:

| Layer | File | Use When |
|-------|------|----------|
| Browser (implicit flow) | `src/lib/supabase/client.ts` | Client Components, hooks |
| Server (cookie-based) | `src/lib/supabase/server.ts` | Server Components, API routes |
| Auth server helper | `src/lib/auth/server.ts` | Server Actions, `requireAuth()` |

Server Actions in `src/app/dashboard/todos/actions.ts` use `requireAuth()` from `src/lib/auth/server.ts` and call `*-server.ts` variants of data functions (e.g. `todos-server.ts`, `profiles-server.ts`).

### Data / Gamification Flow

When a todo is completed (`completeTodoAction`):
1. `updateTodoServer` marks it complete in Supabase
2. `applyTodoCompletionRewards` calls Supabase RPC functions `increment_xp` and `increment_coins` (defined in the DB, not in app code)
3. `checkAndAwardAchievements` checks milestone criteria and inserts achievement rows
4. `revalidatePath` refreshes `/dashboard/todos` and `/dashboard`

**XP table** (defined in `src/lib/supabase/gamification.ts` and duplicated in `actions.ts`):
- easy: 10 XP / 5 coins
- medium: 20 XP / 10 coins
- hard: 40 XP / 20 coins
- epic: 80 XP / 40 coins
- +20% XP bonus if completed on time

Level formula: `Level = floor(total_xp / 100) + 1`

### Database Tables

- `profiles` — user level, total_xp, coins, streak_days, avatar_url
- `todos` — tasks with difficulty, xp_reward, coin_reward, category, due_date, is_recurring
- `achievements` — earned badges per user
- `vision_plans` — long-term goals with timeline_years (1/3/5/10), milestones (JSONB)
- `badge_definitions` — badge metadata and unlock criteria

Row Level Security (RLS) is enabled; all queries must include `user_id` scoping.

### Directory Structure

```
src/
├── app/
│   ├── api/                  # API routes (profile, avatar, DB migrate)
│   ├── auth/                 # Auth callback and email verification pages
│   ├── dashboard/            # Protected pages (layout.tsx guards auth)
│   │   ├── analytics/        # Charts via recharts
│   │   ├── calendar/         # Task calendar view
│   │   ├── profile/          # Gamification profile
│   │   ├── todos/            # Todo CRUD + Server Actions
│   │   └── vision/           # Long-term goal board
│   ├── login/ & signup/      # Auth pages
│   └── layout.tsx            # Root layout with AuthProvider + PWA
├── components/
│   ├── auth/                 # AuthProvider + form components
│   ├── dashboard/            # Sidebar, topbar, DashboardLayout
│   ├── gamification/         # Achievement notification component
│   ├── pwa/                  # PWA install, offline indicator, service worker
│   ├── todos/                # TodoList + modals
│   ├── ui/                   # shadcn/ui components (do not hand-edit)
│   └── vision/ / calendar/ / profile/
├── hooks/
│   ├── use-auth.ts           # Reads from AuthContext
│   └── usePWAInstall.ts / useIsPWA.ts
├── lib/
│   ├── auth/server.ts        # requireAuth(), createAuthenticatedSupabaseClient()
│   ├── config.ts             # getBaseUrl(), env helpers
│   ├── supabase/             # DB query functions (split client/server)
│   ├── utils.ts              # cn() (clsx + tailwind-merge)
│   └── validations.ts        # Zod schemas
└── types/                    # Todo, Profile, Vision TypeScript interfaces
```

### PWA

The service worker is at `public/sw.js` (static, not Workbox-generated). The app registers it via `src/components/pwa/pwa-provider.tsx`. The `next.config.ts` sets `Cache-Control: no-cache` on `/sw.js` and proper headers on `/manifest.json`.

### UI Conventions

- All reusable primitives live in `src/components/ui/` and are generated by shadcn/ui — prefer updating via the shadcn CLI rather than editing directly.
- Utility: `cn()` from `src/lib/utils.ts` for conditional Tailwind class merging.
- Animations: Framer Motion for page transitions (`src/components/ui/page-transition.tsx`) and micro-interactions.
- Forms: React Hook Form + Zod via `@hookform/resolvers/zod`.
- Validation schemas: centralized in `src/lib/validations.ts`.
