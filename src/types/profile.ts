export interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  level: number;
  xp: number;
  coins: number;
  streak_count: number;
  last_activity_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  type: string;
  title: string;
  description: string | null;
  badge_icon: string | null;
  unlocked_at: string;
  xp_bonus: number | null;
  coin_bonus: number | null;
}
