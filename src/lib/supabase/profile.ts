// Server-side profile functions for fetching data
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

async function createSupabaseClient() {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}

type Profile = {
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
};

type Achievement = {
  id: string;
  name: string;
  description: string;
  badge_icon: string;
  category: string;
  xp_reward: number;
  coin_reward: number;
  criteria: string;
  created_at: string;
};

type UserAchievement = {
  id: string;
  user_id: string;
  achievement_type_id: string;
  unlocked_at: string;
  achievement_type: Achievement;
};

export async function fetchUserProfile(userId: string): Promise<Profile | null> {
  const supabase = await createSupabaseClient();
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
}

export async function fetchUserAchievements(userId: string): Promise<UserAchievement[]> {
  const supabase = await createSupabaseClient();
  
  try {
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievement_type:achievement_types(*)
      `)
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false });

    if (error) {
      console.error('Error fetching user achievements:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    return [];
  }
}

export async function fetchAvailableAchievements(): Promise<Achievement[]> {
  const supabase = await createSupabaseClient();
  
  try {
    // Use the new achievement_types table
    const { data, error } = await supabase
      .from('achievement_types')
      .select('*')
      .order('category', { ascending: true });

    if (error) {
      console.error('Error fetching achievement types:', error);
      return [];
    }

    // Transform to match Achievement interface
    return (data || []).map(achievementType => ({
      id: achievementType.id,
      name: achievementType.name,
      description: achievementType.description,
      badge_icon: achievementType.badge_icon,
      category: achievementType.category,
      xp_reward: achievementType.xp_reward,
      coin_reward: achievementType.coin_reward,
      criteria: achievementType.criteria,
      created_at: achievementType.created_at
    }));
  } catch (error) {
    console.error('Error fetching achievement types:', error);
    return [];
  }
}

export async function fetchUserStats(userId: string) {
  const supabase = await createSupabaseClient();
  
  try {
    // Fetch task completion stats
    const { data: completedTasks, error: tasksError } = await supabase
      .from('todos')
      .select('id')
      .eq('user_id', userId)
      .eq('completed', true);

    const { data: totalTasks, error: totalError } = await supabase
      .from('todos')
      .select('id')
      .eq('user_id', userId);

    // Try to fetch points from user_achievements (may not exist)
    let totalPoints = 0;
    let achievementsError = null;
    
    try {
      const { data: achievements, error } = await supabase
        .from('user_achievements')
        .select('achievement:achievements(points)')
        .eq('user_id', userId);

      achievementsError = error;
      
      if (!error && achievements) {
        totalPoints = achievements.reduce((sum: number, item: any) => {
          return sum + (item.achievement?.points || 0);
        }, 0);
      }
    } catch (err) {
      achievementsError = err;
    }

    if (tasksError || totalError) {
      console.error('Error fetching user stats:', { tasksError, totalError, achievementsError });
      return {
        completedTasks: 0,
        totalTasks: 0,
        totalPoints: 0,
        streak: 0
      };
    }

    return {
      completedTasks: completedTasks?.length || 0,
      totalTasks: totalTasks?.length || 0,
      totalPoints,
      streak: 0 // TODO: Calculate streak from completed tasks
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return {
      completedTasks: 0,
      totalTasks: 0,
      totalPoints: 0,
      streak: 0
    };
  }
}

export async function createUserProfile(userId: string): Promise<Profile> {
  const supabase = await createSupabaseClient();
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        username: null,
        avatar_url: null,
        level: 1,
        xp: 0,
        coins: 0,
        streak_count: 0,
        last_activity_date: null
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error creating profile:', error);
    throw error;
  }
}
