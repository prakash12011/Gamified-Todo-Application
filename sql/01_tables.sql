-- =============================================================================
-- 01_tables.sql
-- Creates all application tables.
-- Run this first, before RLS policies, functions, or seed data.
-- =============================================================================

-- -----------------------------------------------------------------------
-- profiles
-- One row per auth user. Created automatically via trigger (see 03_functions.sql).
-- -----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  username         TEXT,
  full_name        TEXT,
  avatar_url       TEXT,
  level            INTEGER   NOT NULL DEFAULT 1,
  xp               INTEGER   NOT NULL DEFAULT 0,
  coins            INTEGER   NOT NULL DEFAULT 100,
  streak_count     INTEGER   NOT NULL DEFAULT 0,
  last_activity_date TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------
-- todos
-- Core task table. user_id references auth.users (not profiles) so that
-- deleting a profile row does not orphan tasks.
-- -----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.todos (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title          TEXT NOT NULL,
  description    TEXT,
  category       TEXT NOT NULL DEFAULT 'personal'
                   CHECK (category IN ('work','personal','health','learning','finance')),
  difficulty     TEXT NOT NULL DEFAULT 'easy'
                   CHECK (difficulty IN ('easy','medium','hard','epic')),
  xp_reward      INTEGER NOT NULL DEFAULT 10,
  coin_reward    INTEGER NOT NULL DEFAULT 5,
  priority       INTEGER DEFAULT 0,
  completed      BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at   TIMESTAMPTZ,
  due_date       TIMESTAMPTZ,
  is_recurring   BOOLEAN NOT NULL DEFAULT FALSE,
  recurring_type TEXT CHECK (recurring_type IN ('daily','weekly','monthly')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------
-- achievements
-- Earned badges per user. type is a short slug (e.g. 'first_todo').
-- -----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.achievements (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type        TEXT NOT NULL,
  title       TEXT NOT NULL,
  description TEXT,
  badge_icon  TEXT,
  xp_bonus    INTEGER DEFAULT 0,
  coin_bonus  INTEGER DEFAULT 0,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, type)
);

-- -----------------------------------------------------------------------
-- badge_definitions
-- Catalog of all possible badges. Not per-user.
-- -----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.badge_definitions (
  id                 UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name               TEXT UNIQUE NOT NULL,
  description        TEXT,
  icon               TEXT,
  requirement_type   TEXT NOT NULL
                       CHECK (requirement_type IN ('streak','completion','xp','level','goal')),
  requirement_value  INTEGER NOT NULL DEFAULT 1,
  xp_reward          INTEGER NOT NULL DEFAULT 50,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------
-- user_achievements
-- Join table linking users to badge_definitions (alternative achievement
-- lookup; used alongside the achievements table for catalog-based queries).
-- -----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES public.badge_definitions(id) ON DELETE CASCADE NOT NULL,
  earned_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, achievement_id)
);

-- -----------------------------------------------------------------------
-- vision_plans
-- Long-term goal planning (1 / 3 / 5 / 10 year horizons).
-- milestones is a JSON array of milestone objects.
-- -----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.vision_plans (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title               TEXT NOT NULL,
  description         TEXT,
  timeline_years      INTEGER NOT NULL CHECK (timeline_years IN (1,3,5,10)),
  target_date         DATE,
  category            TEXT,
  progress_percentage INTEGER NOT NULL DEFAULT 0
                        CHECK (progress_percentage BETWEEN 0 AND 100),
  milestones          JSONB NOT NULL DEFAULT '[]',
  image_url           TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_todos_user_id        ON public.todos(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_due_date       ON public.todos(due_date);
CREATE INDEX IF NOT EXISTS idx_todos_completed      ON public.todos(user_id, completed);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON public.achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_vision_plans_user_id ON public.vision_plans(user_id);
