import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
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

    const fixes = [];

    // 1. Check if profiles table has missing columns and add them
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .select('full_name, user_id, level, xp, coins, streak_count, last_activity_date')
        .limit(0);
      
      if (profileError && profileError.message.includes('column') && profileError.message.includes('does not exist')) {
        fixes.push('❌ Profiles table missing columns - Manual fix required in Supabase SQL Editor');
      } else {
        fixes.push('✅ Profiles table structure looks good');
      }
    } catch (e) {
      fixes.push('❌ Profiles table needs column additions');
    }

    // 2. Check todos table priority column
    try {
      const { error: todoError } = await supabase
        .from('todos')
        .select('priority')
        .limit(0);
      
      if (todoError && todoError.message.includes('priority')) {
        fixes.push('❌ Todos table missing priority column - Manual fix required');
      } else {
        fixes.push('✅ Todos table has priority column');
      }
    } catch (e) {
      fixes.push('❌ Todos table needs priority column');
    }

    // 3. Check achievements table exists
    try {
      const { error: achievementError } = await supabase
        .from('achievements')
        .select('*')
        .limit(0);
      
      if (achievementError && achievementError.message.includes('does not exist')) {
        fixes.push('❌ Achievements table missing - Manual creation required');
      } else {
        fixes.push('✅ Achievements table exists');
      }
    } catch (e) {
      fixes.push('❌ Achievements table does not exist');
    }

    // 4. Check user_achievements table structure
    try {
      const { error: userAchievementError } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .limit(0);
      
      if (userAchievementError && userAchievementError.message.includes('achievement_id')) {
        fixes.push('❌ User achievements table missing achievement_id column');
      } else {
        fixes.push('✅ User achievements table structure looks good');
      }
    } catch (e) {
      fixes.push('❌ User achievements table needs achievement_id column');
    }

    // 5. Check storage bucket - Test direct access to avatars bucket
    try {
      // First try to list all buckets
      const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
      
      if (storageError) {
        fixes.push(`❌ Storage list error: ${storageError.message}`);
      } else {
        console.log('Available buckets:', buckets); // Debug log
        console.log('Bucket count:', buckets?.length || 0);
        
        const avatarBucket = buckets?.find(b => b.name === 'avatars');
        
        if (!avatarBucket) {
          // Try direct access to test if bucket exists but can't be listed
          try {
            const { data: files, error: listError } = await supabase.storage
              .from('avatars')
              .list('', { limit: 1 });
            
            if (listError) {
              fixes.push(`❌ Avatars bucket not accessible: ${listError.message}`);
            } else {
              fixes.push('✅ Avatars bucket exists but not in list (permissions issue)');
            }
          } catch (directTestError) {
            fixes.push('❌ Avatars storage bucket missing - Create manually in Supabase Dashboard');
          }
        } else {
          fixes.push('✅ Avatars storage bucket exists and is configured');
        }
      }
    } catch (e) {
      fixes.push(`❌ Storage check failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Database structure analysis completed',
      fixes,
      nextSteps: [
        '1. Use the SQL script on the Database Fix page',
        '2. Run it in your Supabase SQL Editor',
        '3. Create avatars storage bucket manually',
        '4. Test profile functionality'
      ]
    });

  } catch (error: unknown) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze database structure', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
