/**
 * Alternative auth flow without PKCE for email verification
 * This addresses PKCE code verifier persistence issues
 */

import { createBrowserClient } from '@supabase/ssr'

export function createNonPKCEClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false, // Disable automatic URL detection
        flowType: 'implicit', // Use implicit flow instead of PKCE
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        storageKey: 'supabase.auth.token',
        debug: process.env.NODE_ENV === 'development'
      }
    }
  )
}

/**
 * Handle email verification without PKCE
 */
export async function handleEmailVerification(token: string, type: string) {
  const supabase = createNonPKCEClient();
  
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: type as any
    });
    
    if (error) {
      console.error('Email verification error:', error);
      return { error, data: null };
    }
    
    console.log('Email verification successful:', data);
    return { error: null, data };
  } catch (error) {
    console.error('Email verification failed:', error);
    return { error, data: null };
  }
}
