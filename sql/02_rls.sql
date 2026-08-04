-- =============================================================================
-- 02_rls.sql
-- Row Level Security policies.
-- Run after 01_tables.sql.
-- Every table is locked to the authenticated user's own rows.
-- =============================================================================

-- -----------------------------------------------------------------------
-- profiles
-- -----------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: select own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "profiles: insert own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles: update own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles: delete own"
  ON public.profiles FOR DELETE
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------
-- todos
-- -----------------------------------------------------------------------
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "todos: select own"
  ON public.todos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "todos: insert own"
  ON public.todos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "todos: update own"
  ON public.todos FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "todos: delete own"
  ON public.todos FOR DELETE
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------
-- achievements
-- -----------------------------------------------------------------------
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "achievements: select own"
  ON public.achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "achievements: insert own"
  ON public.achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "achievements: update own"
  ON public.achievements FOR UPDATE
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------
-- badge_definitions (read-only for all authenticated users)
-- -----------------------------------------------------------------------
ALTER TABLE public.badge_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "badge_definitions: read all authenticated"
  ON public.badge_definitions FOR SELECT
  TO authenticated
  USING (true);

-- -----------------------------------------------------------------------
-- user_achievements
-- -----------------------------------------------------------------------
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_achievements: select own"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_achievements: insert own"
  ON public.user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------
-- vision_plans
-- -----------------------------------------------------------------------
ALTER TABLE public.vision_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vision_plans: select own"
  ON public.vision_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "vision_plans: insert own"
  ON public.vision_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "vision_plans: update own"
  ON public.vision_plans FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "vision_plans: delete own"
  ON public.vision_plans FOR DELETE
  USING (auth.uid() = user_id);
