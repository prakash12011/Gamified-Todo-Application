import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const pathname = request.nextUrl.pathname

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // files with extensions
  ) {
    return supabaseResponse
  }

  // Allow auth callback route to proceed without checks
  if (pathname.startsWith('/auth/callback') || pathname.startsWith('/auth/verify')) {
    return supabaseResponse
  }

  // Skip auth check for debug pages in development
  if (process.env.NODE_ENV === 'development' && 
      (pathname.startsWith('/test-connection') || pathname.startsWith('/clear-auth'))) {
    return supabaseResponse
  }

  try {
    // IMPORTANT: This refreshes the session and ensures cookies are properly set
    const {
      data: { user },
      error
    } = await supabase.auth.getUser()

    // Handle auth errors gracefully
    if (error) {
      // If there's an auth error on a protected route, redirect to login
      if (pathname.startsWith('/dashboard')) {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/login'
        redirectUrl.searchParams.set('error', 'auth_failed')
        redirectUrl.searchParams.set('message', encodeURIComponent(error.message))
        return NextResponse.redirect(redirectUrl)
      }
      // For non-protected routes, continue without user
    }

    // Protect dashboard routes
    if (pathname.startsWith('/dashboard')) {
      if (!user) {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/login'
        redirectUrl.searchParams.set('redirectedFrom', pathname)
        return NextResponse.redirect(redirectUrl)
      }
    }

    // Redirect authenticated users away from auth pages
    if ((pathname === '/login' || pathname === '/signup') && user) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/dashboard'
      return NextResponse.redirect(redirectUrl)
    }

    // Redirect root to dashboard if authenticated, login if not
    if (pathname === '/') {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = user ? '/dashboard' : '/login'
      return NextResponse.redirect(redirectUrl)
    }

  } catch (error) {
    // If middleware fails, log in development but don't break the app
    if (process.env.NODE_ENV === 'development') {
      console.error('Middleware error:', error)
    }
    
    // For dashboard routes, redirect to login on error
    if (pathname.startsWith('/dashboard')) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/login'
      redirectUrl.searchParams.set('error', 'middleware_error')
      return NextResponse.redirect(redirectUrl)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - .*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$ (static assets)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
}
