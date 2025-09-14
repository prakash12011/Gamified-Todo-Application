import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        storageKey: 'supabase.auth.token',
        debug: process.env.NODE_ENV === 'development'
      },
      global: {
        headers: {
          'X-Client-Info': 'gamified-todo-app',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        }
      },
      db: {
        schema: 'public'
      }
    }
  )
}

// For backward compatibility
export const supabase = createClient()

// Function to handle auth errors and refresh tokens
export async function handleAuthError() {
  try {
    console.log('Handling auth error - clearing session and redirecting to login');
    await supabase.auth.signOut();
    // Clear any cached data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('supabase.auth.token');
      window.location.href = '/login';
    }
  } catch (error) {
    console.error('Error during auth cleanup:', error);
  }
}

// Enhanced auth status check with error handling
export async function checkAuthStatus() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Auth status check error:', error);
      
      // Handle refresh token errors
      if (error.message.includes('refresh_token_not_found') || 
          error.message.includes('Invalid Refresh Token')) {
        console.log('Refresh token invalid, signing out user');
        await handleAuthError();
        return { session: null, error };
      }
    }
    
    console.log('Auth Status - Session:', session?.user?.id ? 'Valid' : 'None', 'Error:', error);
    return { session, error };
  } catch (error) {
    console.error('Auth status check failed:', error);
    await handleAuthError();
    return { session: null, error };
  }
}
