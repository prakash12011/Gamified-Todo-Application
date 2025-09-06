export type TodoCategory = 'work' | 'personal' | 'health' | 'learning' | 'finance';
export type TodoDifficulty = 'easy' | 'medium' | 'hard' | 'epic';

export interface Todo {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: TodoCategory;
  difficulty: TodoDifficulty;
  xp_reward: number;
  coin_reward: number;
  completed: boolean;
  completed_at: string | null;
  due_date: string | null;
  is_recurring: boolean;
  recurring_type: 'daily' | 'weekly' | 'monthly' | null;
  created_at: string;
  updated_at: string;
}
