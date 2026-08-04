-- =============================================================================
-- 03_functions.sql
-- Database functions, RPC endpoints, and triggers.
-- Run after 01_tables.sql.
-- =============================================================================

-- -----------------------------------------------------------------------
-- increment_xp
-- Called by the app after a todo is completed.
-- Also recalculates level: Level = floor(total_xp / 100) + 1
-- Returns the new xp value.
-- -----------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.increment_xp(user_id UUID, amount INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_xp    INTEGER;
  new_level INTEGER;
BEGIN
  UPDATE public.profiles
  SET
    xp         = xp + amount,
    level      = FLOOR((xp + amount) / 100) + 1,
    updated_at = NOW()
  WHERE profiles.user_id = increment_xp.user_id
  RETURNING xp INTO new_xp;

  RETURN new_xp;
END;
$$;

-- -----------------------------------------------------------------------
-- increment_coins
-- Called by the app after a todo is completed.
-- Returns the new coins value.
-- -----------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.increment_coins(user_id UUID, amount INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_coins INTEGER;
BEGIN
  UPDATE public.profiles
  SET
    coins      = coins + amount,
    updated_at = NOW()
  WHERE profiles.user_id = increment_coins.user_id
  RETURNING coins INTO new_coins;

  RETURN new_coins;
END;
$$;

-- -----------------------------------------------------------------------
-- update_streak
-- Call once per day (or on todo completion) to update streak_count.
-- Increments if last_activity_date was yesterday, resets if older,
-- leaves unchanged if already called today.
-- -----------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_streak(user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  last_date DATE;
  today     DATE := CURRENT_DATE;
  new_streak INTEGER;
BEGIN
  SELECT last_activity_date::DATE INTO last_date
  FROM public.profiles
  WHERE profiles.user_id = update_streak.user_id;

  IF last_date = today THEN
    -- Already updated today
    SELECT streak_count INTO new_streak FROM public.profiles WHERE profiles.user_id = update_streak.user_id;
  ELSIF last_date = today - INTERVAL '1 day' THEN
    -- Consecutive day
    UPDATE public.profiles
    SET
      streak_count       = streak_count + 1,
      last_activity_date = NOW(),
      updated_at         = NOW()
    WHERE profiles.user_id = update_streak.user_id
    RETURNING streak_count INTO new_streak;
  ELSE
    -- Streak broken
    UPDATE public.profiles
    SET
      streak_count       = 1,
      last_activity_date = NOW(),
      updated_at         = NOW()
    WHERE profiles.user_id = update_streak.user_id
    RETURNING streak_count INTO new_streak;
  END IF;

  RETURN new_streak;
END;
$$;

-- -----------------------------------------------------------------------
-- handle_new_user  (trigger function)
-- Automatically creates a profiles row when a new auth user signs up.
-- Avoids the need for the app to call POST /api/profile after signup.
-- -----------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || LEFT(NEW.id::TEXT, 8)),
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Attach the trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------------------------
-- updated_at auto-update trigger
-- Keeps updated_at in sync without app-level bookkeeping.
-- -----------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.todos;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.todos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.vision_plans;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.vision_plans
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
