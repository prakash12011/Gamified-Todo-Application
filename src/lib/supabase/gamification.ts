import { supabase } from './client';

const difficultyXPMap = {
  'easy': 10,
  'medium': 20,
  'hard': 40,
  'epic': 80
};

const difficultyCoinMap = {
  'easy': 5,
  'medium': 10,
  'hard': 20,
  'epic': 40
};

export async function applyTodoCompletionRewards({ userId, todoId, difficulty, onTime }: {
  userId: string;
  todoId: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'epic';
  onTime: boolean;
}) {
  // XP: difficulty-based (+20% if on time)
  // Coins: difficulty-based
  const baseXP = difficultyXPMap[difficulty];
  const xp = onTime ? Math.round(baseXP * 1.2) : baseXP;
  const coins = difficultyCoinMap[difficulty];

  try {
    // Update user profile using RPC functions
    const { data: newXP, error: xpError } = await supabase.rpc('increment_xp', { 
      user_id: userId, 
      amount: xp 
    });
    
    if (xpError) throw xpError;

    const { data: newCoins, error: coinError } = await supabase.rpc('increment_coins', { 
      user_id: userId, 
      amount: coins 
    });
    
    if (coinError) throw coinError;

    return { xp, coins, newXP, newCoins };
  } catch (error) {
    console.error('Error applying todo completion rewards:', error);
    throw error;
  }
}
