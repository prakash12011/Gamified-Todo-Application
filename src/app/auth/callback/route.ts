import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;
  const cookieStore = await cookies();

  console.log("Auth callback received:", { code: !!code, origin, url: request.url });

  if (code) {
    const supabase = createServerClient(
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

    try {
      console.log("Exchanging code for session...");
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error("Error exchanging code for session:", error);
        return NextResponse.redirect(`${origin}/login?error=auth_failed&message=${encodeURIComponent(error.message)}`);
      }

      if (data.user) {
        console.log("User authenticated successfully:", data.user.id);
        
        // Create profile if it doesn't exist
        try {
          console.log("Creating profile for user:", data.user.id);
          const profileResponse = await fetch(`${origin}/api/profile`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: data.user.id,
              username: data.user.user_metadata?.username || data.user.email?.split('@')[0],
            }),
          });

          const profileResult = await profileResponse.json();
          console.log("Profile creation result:", profileResult);

          if (!profileResponse.ok) {
            console.error("Profile creation failed during callback:", profileResult);
          }
        } catch (profileError) {
          console.error("Profile creation error during callback:", profileError);
          // Don't fail the auth process if profile creation fails
        }

        // Create response with proper cookie handling
        const response = NextResponse.redirect(`${origin}/dashboard`);
        
        // Refresh the session to ensure cookies are set properly
        await supabase.auth.getUser();
        
        console.log("Redirecting to dashboard");
        return response;
      }
    } catch (authError) {
      console.error("Auth callback error:", authError);
      return NextResponse.redirect(`${origin}/login?error=auth_failed&message=${encodeURIComponent(String(authError))}`);
    }
  }

  console.log("No code provided, redirecting to login");
  // If no code, redirect to login
  return NextResponse.redirect(`${origin}/login`);
}
