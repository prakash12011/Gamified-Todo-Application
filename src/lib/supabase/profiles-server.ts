import { createServerSupabaseClient } from './server';
import { Profile, Achievement } from '@/types/profile';

export async function fetchUserProfile(userId: string): Promise<Profile | null> {
  const supabase = await createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  
  return data as Profile;
}

export async function fetchUserAchievements(userId: string): Promise<Achievement[]> {
  const supabase = await createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('user_id', userId)
    .order('unlocked_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching achievements:', error);
    return [];
  }
  
  return data as Achievement[];
}

export async function updateUserProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
  const supabase = await createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating profile:', error);
    return null;
  }
  
  return data as Profile;
}
