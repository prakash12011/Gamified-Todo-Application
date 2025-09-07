import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { VisionPlan } from '@/types/vision';

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
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

export async function fetchVisionPlans(userId: string): Promise<VisionPlan[]> {
  try {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
      .from('vision_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching vision plans:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchVisionPlans:', error);
    return [];
  }
}
