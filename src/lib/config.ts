/**
 * Application configuration utilities
 */

/**
 * Get the base URL for the application
 * In production: uses NEXT_PUBLIC_FRONTEND_URL
 * In development: uses window.location.origin (browser) or localhost (server)
 */
export function getBaseUrl(): string {
  // If we have the environment variable, use it (production)
  if (process.env.NEXT_PUBLIC_FRONTEND_URL) {
    return process.env.NEXT_PUBLIC_FRONTEND_URL;
  }
  
  // In browser, use current origin
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Server-side fallback for development
  return 'http://localhost:3000';
}

/**
 * Get the auth callback URL
 */
export function getAuthCallbackUrl(): string {
  return `${getBaseUrl()}/auth/callback`;
}

/**
 * Environment detection
 */
export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Supabase configuration
 */
export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
} as const;
