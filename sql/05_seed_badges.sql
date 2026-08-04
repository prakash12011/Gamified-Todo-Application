-- =============================================================================
-- 05_seed_badges.sql
-- Inserts the initial badge_definitions catalog.
-- Safe to re-run (ON CONFLICT DO NOTHING).
-- =============================================================================

INSERT INTO public.badge_definitions (name, description, icon, requirement_type, requirement_value, xp_reward)
VALUES

  -- Completion milestones
  ('First Steps',      'Complete your very first todo',          '🎯', 'completion', 1,    10),
  ('Getting Started',  'Complete 5 todos',                        '🚀', 'completion', 5,    25),
  ('Task Apprentice',  'Complete 25 todos',                       '📋', 'completion', 25,   50),
  ('Task Master',      'Complete 50 todos',                       '⚡', 'completion', 50,  100),
  ('Todo Centurion',   'Complete 100 todos',                      '🏆', 'completion', 100, 200),
  ('Unstoppable',      'Complete 500 todos',                      '💎', 'completion', 500, 500),

  -- Streak milestones
  ('Day One',          'Complete todos 2 days in a row',          '🔥', 'streak',      2,   15),
  ('Week Warrior',     'Maintain a 7-day streak',                 '📅', 'streak',      7,   75),
  ('Fortnight Fighter','Maintain a 14-day streak',                '💪', 'streak',     14,  150),
  ('Monthly Maven',    'Maintain a 30-day streak',                '🌟', 'streak',     30,  300),
  ('Century Streak',   'Maintain a 100-day streak',               '👑', 'streak',    100,  750),

  -- XP milestones
  ('XP Initiate',      'Earn 100 XP',                             '✨', 'xp',         100,  20),
  ('XP Adept',         'Earn 500 XP',                             '⭐', 'xp',         500,  50),
  ('XP Expert',        'Earn 1,000 XP',                           '🌠', 'xp',        1000, 100),
  ('XP Master',        'Earn 5,000 XP',                           '💫', 'xp',        5000, 250),
  ('XP Legend',        'Earn 10,000 XP',                          '🎆', 'xp',       10000, 500),

  -- Level milestones
  ('Rising Star',      'Reach level 5',                           '🌱', 'level',       5,   50),
  ('Achiever',         'Reach level 10',                          '🌿', 'level',      10,  100),
  ('Veteran',          'Reach level 25',                          '🌳', 'level',      25,  250),
  ('Elite',            'Reach level 50',                          '🏅', 'level',      50,  500),
  ('Legend',           'Reach level 100',                         '🎖️', 'level',     100, 1000),

  -- Goal milestones
  ('Dreamer',          'Create your first vision plan',           '💭', 'goal',        1,   25),
  ('Visionary',        'Create 5 vision plans',                   '🔭', 'goal',        5,   75),
  ('Goal Crusher',     'Complete a vision plan at 100%',          '🎯', 'goal',        1,  150)

ON CONFLICT (name) DO NOTHING;
