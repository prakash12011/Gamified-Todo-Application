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
        flowType: 'implicit',
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        storageKey: 'sb-hqsfhnmpknusoffnjcnv-auth-token',
        debug: process.env.NODE_ENV === 'development'
      },
      // Add production optimizations
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    }
  )
}

// For backward compatibility
export const supabase = createClient()

// Function to handle auth errors and refresh tokens
export async function handleAuthError() {
  try {
    await supabase.auth.signOut();
    
    if (typeof window !== 'undefined') {
      const keysToRemove = [
        'sb-hqsfhnmpknusoffnjcnv-auth-token',
        'supabase.auth.token', // Legacy key
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
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
      if (process.env.NODE_ENV === 'development') {
        console.error('Auth status check error:', error);
      }
      
      // Handle refresh token errors
      if (error.message.includes('refresh_token_not_found') || 
          error.message.includes('Invalid Refresh Token')) {
        await handleAuthError();
        return { session: null, error };
      }
    }
    
    return { session, error };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Auth status check failed:', error);
    }
    await handleAuthError();
    return { session: null, error };
  }
}

// Production-ready auth state listener
export function createAuthStateListener(callback: (session: any) => void) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        callback(session);
      } else if (event === 'SIGNED_IN') {
        callback(session);
      }
    }
  );

  return () => subscription.unsubscribe();
}
