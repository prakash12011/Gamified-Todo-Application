import { supabase } from './client';

export async function checkAndAwardAchievements(userId: string) {
  try {
    // Check for 1st todo completed
    const { data: todos } = await supabase
      .from('todos')
      .select('id')
      .eq('user_id', userId)
      .eq('completed', true);
    
    if (todos && todos.length === 1) {
      // Check if achievement already exists
      const { data: existingAchievement } = await supabase
        .from('achievements')
        .select('id')
        .eq('user_id', userId)
        .eq('type', 'first_todo')
        .single();

      if (!existingAchievement) {
        // Award "First Steps" badge
        const { error: achievementError } = await supabase.from('achievements').insert({
          user_id: userId,
          type: 'first_todo',
          title: 'First Steps',
          description: 'Completed your first todo!',
          badge_icon: '🎯',
          xp_bonus: 10,
          coin_bonus: 5,
        });

        if (achievementError) {
          console.error('Error creating achievement:', achievementError);
        } else {
          // Add XP and coin bonus
          await supabase.rpc('increment_xp', { user_id: userId, amount: 10 });
          await supabase.rpc('increment_coins', { user_id: userId, amount: 5 });
        }
      }
    }

    // Check for 5 todos completed
    if (todos && todos.length === 5) {
      const { data: existingAchievement } = await supabase
        .from('achievements')
        .select('id')
        .eq('user_id', userId)
        .eq('type', 'getting_started')
        .single();

      if (!existingAchievement) {
        await supabase.from('achievements').insert({
          user_id: userId,
          type: 'getting_started',
          title: 'Getting Started',
          description: 'Completed 5 todos!',
          badge_icon: '🚀',
          xp_bonus: 25,
          coin_bonus: 15,
        });

        await supabase.rpc('increment_xp', { user_id: userId, amount: 25 });
        await supabase.rpc('increment_coins', { user_id: userId, amount: 15 });
      }
    }

    // TODO: Add more achievement checks (50 todos, streaks, etc.)
  } catch (error) {
    console.error('Error checking achievements:', error);
  }
}
