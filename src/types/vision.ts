export interface VisionPlan {
  id: string;
  user_id: string;
  title: string;
  description: string;
  timeline_years: 1 | 3 | 5 | 10;
  target_date: string;
  category: string;
  progress_percentage: number;
  milestones: string[];
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement_type: 'streak' | 'completion' | 'xp' | 'level' | 'goal';
  requirement_value: number;
  xp_reward: number;
  created_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  badge_name: string;
  badge_description: string;
  earned_at: string;
  xp_earned: number;
}
