-- =============================================================================
-- 00_full_setup.sql
-- ONE-SHOT SETUP SCRIPT  —  paste this entire file into the Supabase
-- SQL Editor to create a fresh database from scratch.
--
-- Individual files (run in order for incremental setups):
--   01_tables.sql      → all tables + indexes
--   02_rls.sql         → Row Level Security policies
--   03_functions.sql   → RPC functions + triggers
--   04_storage.sql     → avatars storage bucket + policies
--   05_seed_badges.sql → initial badge catalog
-- =============================================================================


-- ===========================================================================
-- SECTION 1 — TABLES
-- ===========================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id                 UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id            UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  username           TEXT,
  full_name          TEXT,
  avatar_url         TEXT,
  level              INTEGER   NOT NULL DEFAULT 1,
  xp                 INTEGER   NOT NULL DEFAULT 0,
  coins              INTEGER   NOT NULL DEFAULT 100,
  streak_count       INTEGER   NOT NULL DEFAULT 0,
  last_activity_date TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS public.badge_definitions (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name              TEXT UNIQUE NOT NULL,
  description       TEXT,
  icon              TEXT,
  requirement_type  TEXT NOT NULL
                      CHECK (requirement_type IN ('streak','completion','xp','level','goal')),
  requirement_value INTEGER NOT NULL DEFAULT 1,
  xp_reward         INTEGER NOT NULL DEFAULT 50,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES public.badge_definitions(id) ON DELETE CASCADE NOT NULL,
  earned_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, achievement_id)
);

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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_todos_user_id        ON public.todos(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_due_date       ON public.todos(due_date);
CREATE INDEX IF NOT EXISTS idx_todos_completed      ON public.todos(user_id, completed);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON public.achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_vision_plans_user_id ON public.vision_plans(user_id);


-- ===========================================================================
-- SECTION 2 — ROW LEVEL SECURITY
-- ===========================================================================

ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badge_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vision_plans    ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "profiles: select own" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "profiles: insert own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles: update own" ON public.profiles FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles: delete own" ON public.profiles FOR DELETE USING (auth.uid() = user_id);

-- todos
CREATE POLICY "todos: select own" ON public.todos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "todos: insert own" ON public.todos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "todos: update own" ON public.todos FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "todos: delete own" ON public.todos FOR DELETE USING (auth.uid() = user_id);

-- achievements
CREATE POLICY "achievements: select own" ON public.achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "achievements: insert own" ON public.achievements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "achievements: update own" ON public.achievements FOR UPDATE USING (auth.uid() = user_id);

-- badge_definitions (read-only for all authenticated users)
CREATE POLICY "badge_definitions: read all authenticated" ON public.badge_definitions FOR SELECT TO authenticated USING (true);

-- user_achievements
CREATE POLICY "user_achievements: select own" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_achievements: insert own" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- vision_plans
CREATE POLICY "vision_plans: select own" ON public.vision_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "vision_plans: insert own" ON public.vision_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "vision_plans: update own" ON public.vision_plans FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "vision_plans: delete own" ON public.vision_plans FOR DELETE USING (auth.uid() = user_id);


-- ===========================================================================
-- SECTION 3 — FUNCTIONS & TRIGGERS
-- ===========================================================================

-- increment_xp
CREATE OR REPLACE FUNCTION public.increment_xp(user_id UUID, amount INTEGER)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE new_xp INTEGER;
BEGIN
  UPDATE public.profiles
  SET xp = xp + amount, level = FLOOR((xp + amount) / 100) + 1, updated_at = NOW()
  WHERE profiles.user_id = increment_xp.user_id
  RETURNING xp INTO new_xp;
  RETURN new_xp;
END;
$$;

-- increment_coins
CREATE OR REPLACE FUNCTION public.increment_coins(user_id UUID, amount INTEGER)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE new_coins INTEGER;
BEGIN
  UPDATE public.profiles
  SET coins = coins + amount, updated_at = NOW()
  WHERE profiles.user_id = increment_coins.user_id
  RETURNING coins INTO new_coins;
  RETURN new_coins;
END;
$$;

-- update_streak
CREATE OR REPLACE FUNCTION public.update_streak(user_id UUID)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  last_date  DATE;
  today      DATE := CURRENT_DATE;
  new_streak INTEGER;
BEGIN
  SELECT last_activity_date::DATE INTO last_date
  FROM public.profiles WHERE profiles.user_id = update_streak.user_id;

  IF last_date = today THEN
    SELECT streak_count INTO new_streak FROM public.profiles WHERE profiles.user_id = update_streak.user_id;
  ELSIF last_date = today - INTERVAL '1 day' THEN
    UPDATE public.profiles
    SET streak_count = streak_count + 1, last_activity_date = NOW(), updated_at = NOW()
    WHERE profiles.user_id = update_streak.user_id
    RETURNING streak_count INTO new_streak;
  ELSE
    UPDATE public.profiles
    SET streak_count = 1, last_activity_date = NOW(), updated_at = NOW()
    WHERE profiles.user_id = update_streak.user_id
    RETURNING streak_count INTO new_streak;
  END IF;

  RETURN new_streak;
END;
$$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || LEFT(NEW.id::TEXT, 8)),
    NOW(), NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.todos;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.todos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.vision_plans;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.vision_plans FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ===========================================================================
-- SECTION 4 — STORAGE  (avatars bucket)
-- NOTE: If this INSERT fails, create the bucket manually in the Dashboard.
-- ===========================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', false, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "avatars: upload own"  ON storage.objects FOR INSERT  TO authenticated WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::TEXT);
CREATE POLICY "avatars: update own"  ON storage.objects FOR UPDATE  TO authenticated USING    (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::TEXT);
CREATE POLICY "avatars: delete own"  ON storage.objects FOR DELETE  TO authenticated USING    (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::TEXT);
CREATE POLICY "avatars: read own"    ON storage.objects FOR SELECT  TO authenticated USING    (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::TEXT);


-- ===========================================================================
-- SECTION 5 — SEED DATA  (badge catalog)
-- ===========================================================================

INSERT INTO public.badge_definitions (name, description, icon, requirement_type, requirement_value, xp_reward) VALUES
  ('First Steps',       'Complete your very first todo',          '🎯', 'completion',   1,    10),
  ('Getting Started',   'Complete 5 todos',                        '🚀', 'completion',   5,    25),
  ('Task Apprentice',   'Complete 25 todos',                       '📋', 'completion',  25,    50),
  ('Task Master',       'Complete 50 todos',                       '⚡', 'completion',  50,   100),
  ('Todo Centurion',    'Complete 100 todos',                      '🏆', 'completion', 100,   200),
  ('Unstoppable',       'Complete 500 todos',                      '💎', 'completion', 500,   500),
  ('Day One',           'Complete todos 2 days in a row',          '🔥', 'streak',       2,    15),
  ('Week Warrior',      'Maintain a 7-day streak',                 '📅', 'streak',       7,    75),
  ('Fortnight Fighter', 'Maintain a 14-day streak',                '💪', 'streak',      14,   150),
  ('Monthly Maven',     'Maintain a 30-day streak',                '🌟', 'streak',      30,   300),
  ('Century Streak',    'Maintain a 100-day streak',               '👑', 'streak',     100,   750),
  ('XP Initiate',       'Earn 100 XP',                             '✨', 'xp',         100,    20),
  ('XP Adept',          'Earn 500 XP',                             '⭐', 'xp',         500,    50),
  ('XP Expert',         'Earn 1,000 XP',                           '🌠', 'xp',        1000,   100),
  ('XP Master',         'Earn 5,000 XP',                           '💫', 'xp',        5000,   250),
  ('XP Legend',         'Earn 10,000 XP',                          '🎆', 'xp',       10000,   500),
  ('Rising Star',       'Reach level 5',                           '🌱', 'level',        5,    50),
  ('Achiever',          'Reach level 10',                          '🌿', 'level',       10,   100),
  ('Veteran',           'Reach level 25',                          '🌳', 'level',       25,   250),
  ('Elite',             'Reach level 50',                          '🏅', 'level',       50,   500),
  ('Legend',            'Reach level 100',                         '🎖️','level',       100,  1000),
  ('Dreamer',           'Create your first vision plan',           '💭', 'goal',          1,    25),
  ('Visionary',         'Create 5 vision plans',                   '🔭', 'goal',          5,    75),
  ('Goal Crusher',      'Complete a vision plan at 100%',          '🎯', 'goal',          1,   150)
ON CONFLICT (name) DO NOTHING;
