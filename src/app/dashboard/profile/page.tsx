import { requireAuth } from '@/lib/auth/server';
import { 
  fetchUserProfile, 
  fetchUserAchievements, 
  fetchAvailableAchievements, 
  fetchUserStats,
  createUserProfile
} from '@/lib/supabase/profile';
import { ProfileView } from '@/components/profile/profile-view';

// Force dynamic rendering for this page since it uses authentication
export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const { user } = await requireAuth();
  
  // First try to fetch the profile
  let profile = await fetchUserProfile(user.id);
  
  // If profile doesn't exist, create one
  if (!profile) {
    try {
      profile = await createUserProfile(user.id);
    } catch (error) {
      console.error('Failed to create profile:', error);
      // Create a temporary profile object for the UI
      profile = {
        id: crypto.randomUUID(),
        user_id: user.id,
        username: null,
        avatar_url: null,
        level: 1,
        xp: 0,
        coins: 0,
        streak_count: 0,
        last_activity_date: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
  }
  
  // Fetch other profile-related data in parallel
  const [userAchievements, availableAchievements, userStats] = await Promise.all([
    fetchUserAchievements(user.id),
    fetchAvailableAchievements(),
    fetchUserStats(user.id)
  ]);

  return (
    <ProfileView 
      initialProfile={profile}
      userAchievements={userAchievements}
      availableAchievements={availableAchievements}
      userStats={userStats}
    />
  );
}
