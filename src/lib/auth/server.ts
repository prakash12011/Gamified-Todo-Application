import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

/**
 * Creates an authenticated Supabase server client with proper cookie handling
 * This handles all the boilerplate for server-side Supabase setup
 */
export async function createAuthenticatedSupabaseClient() {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )

  return supabase
}

/**
 * Creates a Supabase client and ensures user is authenticated
 * Automatically redirects to login if not authenticated
 * Returns both the user and supabase client for convenience
 */
export async function requireAuth() {
  const supabase = await createAuthenticatedSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  return { user, supabase }
}

/**
 * Gets the current user without requiring authentication
 * Returns null if not authenticated (useful for optional auth pages)
 */
export async function getCurrentUser() {
  const supabase = await createAuthenticatedSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  return { user, supabase }
}
